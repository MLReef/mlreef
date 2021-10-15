package com.mlreef.rest.feature.auth

import com.mlreef.rest.AccountExternalRepository
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.config.censor
import com.mlreef.rest.config.security.oauth.OAuthClientSettingsStorage
import com.mlreef.rest.config.tryToUUID
import com.mlreef.rest.domain.*
import com.mlreef.rest.exceptions.*
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserToken
import com.mlreef.rest.external_api.gitlab.dto.OAuthToken
import com.mlreef.rest.feature.email.EmailMessageType
import com.mlreef.rest.feature.email.EmailService
import com.mlreef.rest.feature.email.EmailVariables
import com.mlreef.rest.feature.email.TemplateType
import com.mlreef.rest.feature.groups.GroupsService
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.feature.system.FilesManagementService
import com.mlreef.rest.feature.system.FilesManagementService.Companion.USER_AVATAR_PURPOSE_ID
import com.mlreef.rest.feature.system.ReservedNamesService
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.rest.utils.toInstant
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.client.ResourceAccessException
import org.springframework.web.multipart.MultipartFile
import java.time.Instant
import java.util.*
import java.util.UUID.randomUUID
import javax.transaction.Transactional


@Service("authService")
class AuthService(
    private val gitlabRestClient: GitlabRestClient,
    private val accountRepository: AccountRepository,
    private val accountTokenRepository: AccountTokenRepository,
    private val groupService: GroupsService,
    private val passwordEncoder: PasswordEncoder,
    private val dataProjectsService: ProjectService<DataProject>,
    private val codeProjectsService: ProjectService<CodeProject>,
    private val emailService: EmailService,
    private val reservedNamesService: ReservedNamesService,
    private val userResolverService: UserResolverService,
    private val accountExternalRepository: AccountExternalRepository,
    private val oAuthClientSettingsStorage: OAuthClientSettingsStorage,
    private val filesManagementService: FilesManagementService,
) {

    @Value("\${mlreef.bot-management.epf-bot-email-domain:\"\"}")
    private val botEmailDomain: String = ""

    @Value("\${mlreef.bot-management.epf-bot-password-length}")
    private val botPasswordLength: Int = 0

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)

        private val GUEST_ACCOUNT_ID = UUID(0L, 0L)
        private val GITLAB_TOKEN_USER = "mlreef-user-token"
        private val GITLAB_TOKEN_BOT = "mlreef-bot-token"

        private const val WELCOME_MESSAGE_SUBJECT = "Welcome to MLReef"

        private val guestTokenDetails: TokenDetails by lazy {
            TokenDetails(
                username = "",
                accessToken = "",
                accountId = GUEST_ACCOUNT_ID,
                gitlabUser = null,
                valid = (true),
                isVisitor = true,
                authorities = listOf(SimpleGrantedAuthority("VISITOR"))
            )
        }
    }

    fun checkAvailability(userName: String): String {
        reservedNamesService.assertUserNameIsNotReserved(userName)
        val possibleSlug = userName
        val existingUser = userResolverService.resolveAccount(slug = possibleSlug)
        if (existingUser != null) {
            throw ConflictException(ErrorCode.UserAlreadyExisting, "User exists for $possibleSlug / $userName")
        }
        return possibleSlug
    }

    fun loginUser(plainPassword: String, username: String?, email: String?): Pair<Account, OAuthToken> {
        val finalUserName = username?.trim()?.toLowerCase()
        val finalEmail = email?.trim()?.toLowerCase()

        val user = finalUserName?.let { accountRepository.findByUsernameIgnoreCase(it) }
            ?: finalEmail?.let { accountRepository.findByEmailIgnoreCase(it) }
            ?: throw BadCredentialsException("User not found")

        if (!passwordEncoder.matches(
                plainPassword,
                user.passwordEncrypted
            )
        ) throw IncorrectCredentialsException("Bad credentials")

        val oauthToken = gitlabRestClient.userLoginOAuthToGitlab(user.username, plainPassword)
        val accountUpdate = user.copy(lastLogin = I18N.dateTime())
        val loggedAccount = accountRepository.save(accountUpdate)

        return Pair(loggedAccount, oauthToken)
    }

    @org.springframework.transaction.annotation.Transactional
    fun loginOAuthUser(
        externalAccountId: UUID,
        accessToken: String?,
        accessTokenExpiration: Instant?,
        refreshToken: String?,
        refreshTokenExpiration: Instant?,
    ): AccountToken? {
        val externalAccount = accountExternalRepository.findByIdOrNull(externalAccountId)
            ?: throw UserNotFoundException(userId = externalAccountId)

        val currentTokens = accountTokenRepository.findByAccountIdAndExpiresAtAfter(
            externalAccount.account.id,
            Instant.now().minusSeconds(60)
        ) + accountTokenRepository.findByAccountIdAndExpiresAtNull(externalAccount.account.id)

        accountExternalRepository.save(
            externalAccount.copy(
                accessToken = accessToken,
                accessTokenExpiresAt = accessTokenExpiration,
                refreshToken = refreshToken,
                refreshTokenExpiresAt = refreshTokenExpiration,
            )
        )

        return if (currentTokens.isNotEmpty()) {
            currentTokens.sortedByDescending { it.expiresAt }.first()
        } else {
            val clientSettings = oAuthClientSettingsStorage.getOAuthClientSettings(externalAccount.oauthClient)

            clientSettings?.let {
                val defaultTokenExpiration = Instant.now().plusSeconds(it.impersonateTokenLifetimeSec)
                val tokenLifeTime = accessTokenExpiration?.let {
                    if (it.isAfter(defaultTokenExpiration)) {
                        it
                    } else {
                        defaultTokenExpiration
                    }
                } ?: defaultTokenExpiration

                val gitlabToken = createGitlabToken(
                    externalAccount.account.gitlabId ?: throw InternalException("User ${externalAccount.account.id} is not connected to gitlab"),
                    externalAccount.account.username,
                    "${externalAccount.oauthClient}-${randomUUID()}",
                    tokenLifeTime,
                )

                accountTokenRepository.save(
                    AccountToken(
                        randomUUID(),
                        externalAccount.account.id,
                        gitlabToken.token ?: throw InternalException("Incorrect gitlab token created"),
                        gitlabToken.id,
                        gitlabToken.active,
                        gitlabToken.revoked,
                        gitlabToken.expiresAt?.toInstant(),
                    )
                )
            }
        }
    }

    @Transactional
    fun registerUser(
        plainPassword: String, username: String, email: String, name: String,
    ): Pair<Account, OAuthToken?> {
        val finalUserName = username.trim().toLowerCase().takeIf { it.isNotEmpty() } ?: throw BadParametersException("Username cannot be blank")
        val finalEmail = email.trim().takeIf { it.isNotEmpty() } ?: throw BadParametersException("Email cannot be blank")
        val finalName = name.trim()

        val byUsername: Account? = accountRepository.findByUsernameIgnoreCase(finalUserName)
        val byEmail: Account? = accountRepository.findByEmailIgnoreCase(finalEmail)

        byUsername?.let { throw UserAlreadyExistsException(username = username) }
        byEmail?.let { throw UserAlreadyExistsException(email = email) }
        finalUserName.tryToUUID()?.let { throw BadRequestException("Incorrect username $username. Username cannot be UUID") }
        finalUserName.toLongOrNull()?.let { throw BadRequestException("Incorrect username $username. Username cannot be number only") }

        val personSlug = checkAvailability(finalUserName)

        val newGitlabUser = createGitlabUser(username = finalUserName, email = finalEmail, password = plainPassword)
        createGitlabToken(newGitlabUser)

        val oauthToken = gitlabRestClient.userLoginOAuthToGitlab(finalUserName, plainPassword)

        val accountUuid = randomUUID()

        val encryptedPassword = passwordEncoder.encode(plainPassword)

        val newUser = Account(
            id = accountUuid,
            username = finalUserName,
            email = finalEmail,
            passwordEncrypted = encryptedPassword,
            name = finalName,
            slug = personSlug,
            gitlabId = newGitlabUser.id,
        )

        accountRepository.save(newUser)

        sendWelcomeMessage(newUser)

        return Pair(newUser, oauthToken)
    }

    @Transactional
    fun registerOAuthUser(
        oAuthClient: String,
        username: String?,
        email: String?,
        name: String?,
        externalId: String?,
        reposUrl: String? = null,
        avatarUrl: String? = null,
    ): AccountExternal {
        val finalUserName = username?.trim()?.toLowerCase()?.takeIf { it.isNotEmpty() }
        val finalEmail = email?.trim()?.takeIf { it.isNotEmpty() }
        val finalExternalId = externalId?.trim()?.takeIf { it.isNotEmpty() }
        val finalName = name?.trim()?.toLowerCase()?.takeIf { it.isNotEmpty() }

        finalExternalId ?: finalEmail ?: finalUserName ?: throw BadRequestException("Cannot register external user for $oAuthClient. No unique id is provided")

        val existAccountByUsername = userResolverService.resolveExternalAccount(oAuthClient, username = finalUserName)
        val existAccountByEmail = userResolverService.resolveExternalAccount(oAuthClient, email = finalEmail)
        val existAccountByExternalId = userResolverService.resolveExternalAccount(oAuthClient, externalId = finalExternalId)

        existAccountByUsername?.let { throw UserAlreadyExistsException(username = username) }
        existAccountByEmail?.let { throw UserAlreadyExistsException(email = email) }
        existAccountByExternalId?.let { throw UserAlreadyExistsException(message = "User is already registered by $oAuthClient") }

        val internalId = randomUUID()
        val internalUserName = "$oAuthClient-${finalUserName ?: finalExternalId ?: randomUUID()}-$internalId"
        val internalEmail = "$internalId@mlreef.com"
        val internalPassword = RandomUtils.generateRandomPassword(30, true)

        val personSlug = checkAvailability(internalUserName)

        val newGitlabUser = createGitlabUser(username = internalUserName, email = internalEmail, password = internalPassword)

        val encryptedPassword = passwordEncoder.encode(internalPassword)

        val newUser = accountRepository.save(
            Account(
                id = internalId,
                username = internalUserName,
                email = internalEmail,
                passwordEncrypted = encryptedPassword,
                name = finalName ?: internalUserName,
                slug = personSlug,
                gitlabId = newGitlabUser.id,
            )
        )

        val externalAccount = accountExternalRepository.save(
            AccountExternal(
                id = randomUUID(),
                oauthClient = oAuthClient,
                account = newUser,
                username = finalUserName,
                email = finalEmail,
                externalId = finalExternalId,
                reposUrl = reposUrl,
                accessToken = null,
                refreshToken = null,
                avatarUrl = avatarUrl,
            )
        )

        if (finalEmail != null) {
            sendWelcomeMessage(newUser.id, externalAccount.username ?: finalName ?: "user", finalEmail)
        }

        return externalAccount
    }

    @Transactional
    fun userProfileUpdate(
        accountId: UUID,
        tokenDetails: TokenDetails,
        username: String? = null,
        email: String? = null,
        userRole: UserRole? = null,
        hasNewsletters: Boolean? = null,
        termsAcceptedAt: Instant? = null
    ): Account {
        val user = accountRepository.findByIdOrNull(accountId)
            ?: throw UserNotFoundException(accountId)

        val finalUserName = username?.trim()?.toLowerCase()
        val finalEmail = email?.trim()

        val oldUserName = user.username

        if (user != (finalUserName?.let { accountRepository.findByUsernameIgnoreCase(it) } ?: user))
            throw ConflictException(ErrorCode.Conflict, "User with username $username is already registered")

        if (user != (finalEmail?.let { accountRepository.findByEmailIgnoreCase(it) } ?: user))
            throw ConflictException(ErrorCode.Conflict, "User with email $email is already registered")

        updateGitlabUser(
            user.gitlabId ?: throw BadParametersException("User ${user.username} is not connected to Gitlab"),
            finalUserName,
            finalEmail
        )

        val updatedUserInDb = accountRepository.save(
            user.copy(
                username = finalUserName ?: user.username,
                email = finalEmail ?: user.email,
                userRole = userRole ?: user.userRole,
                hasNewsletters = hasNewsletters ?: user.hasNewsletters,
                termsAcceptedAt = termsAcceptedAt ?: user.termsAcceptedAt,
            )
        )

        if (updatedUserInDb.username != user.username) {
            dataProjectsService.updateUserNameInProjects(oldUserName, updatedUserInDb.username, tokenDetails)
            codeProjectsService.updateUserNameInProjects(oldUserName, updatedUserInDb.username, tokenDetails)
        }

        return updatedUserInDb
    }

    @Transactional
    fun createUserAvatar(file: MultipartFile, owner: Account? = null, ownerId: UUID? = null): MlreefFile {
        val account = owner
            ?: userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(userId = ownerId)

        if (filesManagementService.findFileForAccountAndPurpose(owner = account, purposeId = USER_AVATAR_PURPOSE_ID).isNotEmpty()) {
            throw ConflictException("User already has an avatar")
        }

        account.avatar = filesManagementService.saveFile(
            file = file,
            owner = account,
            purposeId = USER_AVATAR_PURPOSE_ID,
            description = null,
        )

        accountRepository.save(account)

        return account.avatar ?: throw InternalException("Avatar was not saved")
    }

    @Transactional
    fun updateUserAvatar(file: MultipartFile, owner: Account? = null, ownerId: UUID? = null): MlreefFile {
        val account = owner
            ?: userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(userId = ownerId)

        val avatars = filesManagementService.findFileForAccountAndPurpose(owner = account, purposeId = USER_AVATAR_PURPOSE_ID).takeIf { it.isNotEmpty() }

        account.avatar = filesManagementService.saveFile(
            file = file,
            owner = account,
            purposeId = USER_AVATAR_PURPOSE_ID,
            description = null,
        )

        accountRepository.save(account)

        avatars?.forEach {
            filesManagementService.deleteFile(it, owner = account)
        }

        return account.avatar ?: throw InternalException("Avatar was not saved")
    }

    @Transactional
    fun deleteUserAvatars(owner: Account? = null, ownerId: UUID? = null) {
        val account = owner
            ?: userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(userId = ownerId)

        val avatars = filesManagementService.findFileForAccountAndPurpose(owner = account, purposeId = USER_AVATAR_PURPOSE_ID).takeIf { it.isNotEmpty() }
            ?: throw NotFoundException("User does not have an avatar")

        account.avatar = null

        accountRepository.save(account)

        avatars.forEach {
            filesManagementService.deleteFile(it, owner = account)
        }
    }

    private fun sendWelcomeMessage(account: Account) {
        sendWelcomeMessage(account.id, account.username, account.email)
    }

    private fun sendWelcomeMessage(accountId: UUID, username: String, email: String) {
        val variables = mapOf(
            EmailVariables.USER_NAME to username,
            EmailVariables.RECIPIENT_EMAIL to email,
            EmailVariables.SUBJECT to WELCOME_MESSAGE_SUBJECT
        )
        emailService.sendAsync(accountId, EmailMessageType.HTML, TemplateType.WELCOME_MESSAGE_TEMPLATE, variables)
    }

    fun checkUserInGitlab(token: String): GitlabUser {
        if (token.length < 30) {
            return gitlabRestClient.getUser(token)
        } else {
            val oauthTokenInfo = gitlabRestClient.userCheckOAuthTokenInGitlab(token)
            accountRepository.findAccountByGitlabId(oauthTokenInfo.resourceOwnerId)
                ?: throw UserNotFoundException(gitlabId = oauthTokenInfo.resourceOwnerId)
            return gitlabRestClient.getUser(token)
        }
    }

    @Transactional
    fun changePasswordForUser(account: Account, newPassword: String): Boolean {
        gitlabRestClient.adminResetUserPassword(
            account.gitlabId ?: throw UnknownUserException("User is not connected to Gitlab"),
            newPassword
        )

        val passwordEncrypted = passwordEncoder.encode(newPassword)

        accountRepository.save(
            account.copy(passwordEncrypted = passwordEncrypted)
        )

        return true
    }

    fun findGitlabUserViaToken(token: String): GitlabUser {
        return try {
            gitlabRestClient.getUser(token)
        } catch (e: ResourceAccessException) {
            throw GitlabConnectException(e.message ?: "Cannot execute gitlabRestClient.getUser")
        } catch (e: Exception) {
            log.error(e.message, e)
            throw ConflictException(ErrorCode.GitlabUserNotExisting, "Cannot find Gitlab user with this token ${token.censor()}")
        }
    }

    fun findGitlabUserViaGitlabId(id: Long): GitlabUser {
        return try {
            gitlabRestClient.adminGetUserById(id)
        } catch (e: ResourceAccessException) {
            throw GitlabConnectException(e.message ?: "Cannot execute gitlabRestClient.getUser")
        } catch (e: Exception) {
            log.error(e.message, e)
            throw UserNotFoundException(gitlabId = id)
        }
    }

    private fun createGitlabUser(username: String, email: String, password: String): GitlabUser {
        return try {
            log.info("Create user $username")
            gitlabRestClient.adminCreateUser(email = email, name = username, username = username, password = password)
        } catch (clientErrorException: RestException) {
            log.error("Already existing User. Error message: ${clientErrorException.message}")
            throw clientErrorException
        }
    }

    private fun createOrFindGitlabUser(username: String, email: String, password: String): GitlabUser {
        return try {
            log.info("Create user $username")
            gitlabRestClient.adminGetUsers(username = username).firstOrNull()
                ?: gitlabRestClient.adminGetUsers(searchNameEmail = email).find { it.username == username }
                ?: gitlabRestClient.adminCreateUser(
                    email = email,
                    name = username,
                    username = username,
                    password = password
                )
        } catch (clientErrorException: RestException) {
            log.info("Cannot create the user $username with email $email: ${clientErrorException.message}")
            throw RestException(
                ErrorCode.GitlabUserCreationFailedEmailUsed,
                "User could not be created in Gitlab: ${clientErrorException.message}"
            )
        }
    }

    private fun updateGitlabUser(id: Long, username: String?, email: String?): GitlabUser {
        return try {
            log.info("Update user $id with username ${username ?: ""} and email ${email ?: ""}")
            gitlabRestClient.adminUpdateUser(id, email = email, name = username, username = username)
        } catch (clientErrorException: RestException) {
            log.info("Cannot update user in Gitlab. Error message: ${clientErrorException.message}")
            throw clientErrorException
        }
    }

    private fun createGitlabToken(gitlabUser: GitlabUser): GitlabUserToken {
        val gitlabUserId = gitlabUser.id
        log.info("Create new Token for user ${gitlabUser.username}")
        return gitlabRestClient.adminCreateUserToken(gitlabUserId = gitlabUserId, tokenName = GITLAB_TOKEN_BOT)
    }

    private fun createGitlabToken(gitlabUserId: Long, username: String, tokenName: String? = null, expiresAt: Instant? = null): GitlabUserToken {
        log.info("Create new Token ${tokenName ?: GITLAB_TOKEN_BOT} for user $username")
        return gitlabRestClient.adminCreateUserToken(
            gitlabUserId = gitlabUserId,
            tokenName = tokenName ?: GITLAB_TOKEN_BOT,
            expiresAt = expiresAt
        )
    }

    private fun ensureGitlabToken(account: Account, gitlabUser: GitlabUser): GitlabUserToken? {
        val gitlabUserId = gitlabUser.id
        val username = gitlabUser.username
        val gitlabTokens = gitlabRestClient.adminGetUserTokens(gitlabUserId = gitlabUserId).filterNot { it.revoked }

        val savedTokens = accountTokenRepository.findAllByAccountId(account.id)
        var mustCreateNow = true
        val matchingGitlabTokens = gitlabTokens.filter { it.name == GITLAB_TOKEN_BOT }

        if (matchingGitlabTokens.isNotEmpty()) {
            val first = matchingGitlabTokens.first()
            val matchingSavedTokens = savedTokens.filter { it.gitlabId == first.id }
            if (matchingSavedTokens.isNotEmpty()) {
                mustCreateNow = false
            }
        }
        return if (mustCreateNow) {
            val token = createGitlabToken(gitlabUser)
            token
        } else {
            log.debug("Gitlab user $username already has a token: secret  ${matchingGitlabTokens.first().token}")
            log.warn("Token not freshly created, so no secret token will be available!")
            null
        }
    }

    fun createTokenDetails(token: String, account: Account, gitlabUser: GitlabUser): TokenDetails {
        var tokenDetails = TokenDetails(
            username = account.username,
            accessToken = token,
            accountId = account.id,
            gitlabUser = gitlabUser,
            valid = true,
            isVisitor = false,
            authorities = listOf(SimpleGrantedAuthority("USER"))
        )

        tokenDetails = injectGitlabInfoIntoTokenDetails(tokenDetails, account)

        return tokenDetails
    }

    private fun injectGitlabInfoIntoTokenDetails(tokenDetails: TokenDetails, account: Account): TokenDetails {
        tokenDetails.groups.putAll(groupService.getUserGroupsList(tokenDetails.accessToken, account.id).map { Pair(it.id, it.accessLevel) })
        tokenDetails.projects.putAll(dataProjectsService.getUserProjectsList(tokenDetails.accessToken, account.id).map { Pair(it.id, it.accessLevel) })
        tokenDetails.projects.putAll(codeProjectsService.getUserProjectsList(tokenDetails.accessToken, account.id).map { Pair(it.id, it.accessLevel) })
        return tokenDetails
    }

    fun createGuestDetails() = guestTokenDetails

    fun findAccountByToken(token: String): Account {
        val tokenInDb = accountTokenRepository.findOneByToken(token)

        if (tokenInDb != null) {
            return accountRepository.findByIdOrNull(tokenInDb.accountId)
                ?: throw BadCredentialsException("Token not attached to a Account in Database")
        } else {
            return findUserInGitlabAndCreateInternally(token)
        }
    }

    fun findAccountByGitlabId(gitlabId: Long) = userResolverService.resolveAccount(gitlabId = gitlabId)

    @Transactional
    fun findUserInGitlabAndCreateInternally(permanentToken: String): Account {
        val gitlabUser = findGitlabUserViaToken(permanentToken)
        val accountToken = accountTokenRepository.findOneByToken(permanentToken)
        var account = accountRepository.findOneByUsername(gitlabUser.username)
            ?: accountRepository.findOneByEmail(gitlabUser.email)
            ?: accountRepository.findAccountByGitlabId(gitlabUser.id)

        if (accountToken != null || account != null)
            throw NotConsistentInternalDb("Inconsistent state for Gitlab user[${gitlabUser.id}] ${gitlabUser.name} ${gitlabUser.email}. Possible it already exists locally")

        val password = passwordEncoder.encode(RandomUtils.generateRandomPassword(botPasswordLength))

        val accountUuid = randomUUID()

        account = Account(
            id = accountUuid,
            username = gitlabUser.username,
            email = gitlabUser.email,
            passwordEncrypted = password,
            slug = gitlabUser.username,
            name = gitlabUser.username,
            gitlabId = gitlabUser.id,
            userRole = UserRole.UNDEFINED,
            termsAcceptedAt = null,
            hasNewsletters = false
        )

        log.error("If an account is created here, we have some major problems going on!")
        log.error("Please check created account: ${account.id}: ${account.username}")
        accountRepository.save(account)

        return account
    }

    private fun ensureBotExistsOrCreateAccount(gitlabUser: GitlabUser, botPassword: String): Account {
        var account = accountRepository.findOneByUsername(gitlabUser.username)
            ?: accountRepository.findOneByEmail(gitlabUser.email)
            ?: accountRepository.findAccountByGitlabId(gitlabUser.id)

        if (account != null) {
            return account
        }

        val accountUuid = randomUUID()
        account = Account(
            id = accountUuid,
            username = gitlabUser.username,
            email = gitlabUser.email,
            passwordEncrypted = botPassword,
            slug = gitlabUser.username,
            name = gitlabUser.username,
            gitlabId = gitlabUser.id,
            userRole = UserRole.UNDEFINED,
            termsAcceptedAt = null,
            hasNewsletters = false
        )

        return accountRepository.save(account)
    }

    @Transactional
    fun ensureBotExistsWithToken(botName: String, botEmail: String, botPassword: String): Pair<GitlabUser, GitlabUserToken?> {
        val gitlabUser = createOrFindGitlabUser(botName, botEmail, botPassword)
        // save or find bot in local DB
        val account = ensureBotExistsOrCreateAccount(gitlabUser, botPassword)
        // create token ONCE on first try, otherwise return a optional null (no harm) of fail in pain
        val newToken = ensureGitlabToken(account, gitlabUser)
        return Pair(gitlabUser, newToken)
    }
}
