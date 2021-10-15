package com.mlreef.rest.api.v1

import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.*
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.UserRole
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.external_api.gitlab.dto.OAuthToken
import com.mlreef.rest.external_api.gitlab.dto.toUserDto
import com.mlreef.rest.feature.auth.AuthService
import com.mlreef.rest.feature.system.FilesManagementService
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.time.Instant
import java.util.*
import javax.validation.constraints.Email
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/auth") //, produces = ["application/json"], consumes = ["application/json"])
class AuthController(
    private val authService: AuthService,
    private val currentUserService: CurrentUserService,
    private val filesManagementService: FilesManagementService,
) {

    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): SecretUserDto = authService
        .loginUser(
            plainPassword = loginRequest.password,
            username = loginRequest.username,
            email = loginRequest.email
        )
        .let { (findUser: Account, oauthToken) ->
            findUser.toSecretUserDto(
                accessToken = oauthToken.accessToken,
                refreshToken = oauthToken.refreshToken,
                avatarUrl = filesManagementService.getDownloadLinkForFile(findUser.avatar),
            )
        }

    @PostMapping("/register")
    fun register(@RequestBody registerRequest: RegisterRequest): SecretUserDto = authService
        .registerUser(
            plainPassword = registerRequest.password,
            username = registerRequest.username,
            email = registerRequest.email,
            name = registerRequest.name,
        )
        .let { (newUser: Account, oauthToken: OAuthToken?) ->
            newUser.toSecretUserDto(
                accessToken = oauthToken?.accessToken,
                refreshToken = oauthToken?.refreshToken,
                avatarUrl = filesManagementService.getDownloadLinkForFile(newUser.avatar),
            )
        }


    @Deprecated("maybe we need an admin endpoint, but actually deprecated", ReplaceWith("updateOwnProfile"))
    @PutMapping("/update/{userId}")
    @PreAuthorize("isGitlabAdmin() || isUserItself(#userId)")
    fun updateProfile(
        @PathVariable userId: UUID,
        @RequestBody updateProfileRequest: UpdateRequest,
        token: TokenDetails
    ): UserDto = authService
        .userProfileUpdate(
            accountId = userId,
            tokenDetails = token,
            username = updateProfileRequest.username,
            email = updateProfileRequest.email,
            userRole = updateProfileRequest.userRole,
            termsAcceptedAt = updateProfileRequest.termsAcceptedAt,
            hasNewsletters = updateProfileRequest.hasNewsletters
        ).let { it.toUserDto(filesManagementService.getDownloadLinkForFile(it.avatar)) }

    @PutMapping("/user")
    @PreAuthorize("isUserItself(#token.accountId)")
    fun updateOwnProfile(
        @RequestBody updateProfileRequest: UpdateRequest,
        token: TokenDetails
    ): UserDto = authService
        .userProfileUpdate(
            accountId = token.accountId,
            tokenDetails = token,
            username = updateProfileRequest.username,
            email = updateProfileRequest.email,
            userRole = updateProfileRequest.userRole,
            termsAcceptedAt = updateProfileRequest.termsAcceptedAt,
            hasNewsletters = updateProfileRequest.hasNewsletters
        ).let { it.toUserDto(filesManagementService.getDownloadLinkForFile(it.avatar)) }

    @PostMapping("/user/avatar/create")
    @PreAuthorize("isUserItself(#token.accountId)")
    fun createUserAvatarFile(
        @RequestParam("file") file: MultipartFile,
        token: TokenDetails,
    ): MlreefFileDto {
        return authService.createUserAvatar(
            file,
            ownerId = token.accountId,
        ).toDto()
    }

    @PostMapping("/user/avatar/update")
    @PreAuthorize("isUserItself(#token.accountId)")
    fun updateUserAvatarFile(
        @RequestParam("file") file: MultipartFile,
        token: TokenDetails,
    ): MlreefFileDto {
        return authService.updateUserAvatar(
            file,
            ownerId = token.accountId,
        ).toDto()
    }

    @DeleteMapping("/user/avatar/delete")
    @PreAuthorize("isUserItself(#token.accountId)")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteUserAvatarFile(
        token: TokenDetails,
    ) {
        authService.deleteUserAvatars(
            ownerId = token.accountId,
        )
    }

    @GetMapping("/whoami")
    fun whoami(): UserDto = (
            currentUserService.accountOrNull()
                ?: currentUserService.visitorAccount()
            ).let { it.toUserDto(filesManagementService.getDownloadLinkForFile(it.avatar)) }

    // FIXME: Coverage says: missing tests
    @GetMapping("/check/token")
    fun checkToken(account: Account, token: TokenDetails): UserDto {
        return authService.checkUserInGitlab(token = token.accessToken).toUserDto(account.id)
    }
}

data class LoginRequest(
    val username: String?,
    @get:Email val email: String?,
    @get:NotEmpty val password: String
)

data class RegisterRequest(
    @get:NotEmpty val username: String,
    @get:Email @get:NotEmpty val email: String,
    @get:NotEmpty val password: String,
    @get:NotEmpty val name: String
)

data class UpdateRequest(
    @get:NotEmpty val username: String? = null,
    @get:Email @get:NotEmpty val email: String? = null,
    val name: String? = null,
    val userRole: UserRole? = null,
    val termsAcceptedAt: Instant? = null,
    val hasNewsletters: Boolean? = null
)
