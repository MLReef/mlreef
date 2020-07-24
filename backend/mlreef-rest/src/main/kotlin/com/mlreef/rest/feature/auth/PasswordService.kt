package com.mlreef.rest.feature.auth

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.exceptions.BadParametersException
import com.mlreef.rest.exceptions.UnknownUserException
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.feature.email.EmailMessageType
import com.mlreef.rest.feature.email.EmailService
import com.mlreef.rest.feature.email.EmailVariables
import com.mlreef.rest.feature.email.TemplateType
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

interface PasswordService {
    fun resetPasswordStart(email: String? = null, userName: String? = null, userId: UUID? = null)
    fun passwordResetConfirm(token: String, password: String): Boolean
}

@Service
class MlReefPasswordService(
    private val accountRepository: AccountRepository,
    private val emailService: EmailService,
    private val authService: AuthService,
    @Value("\${mlreef.password-management.reset-password-send-email-interval-sec:600}") val sendPasswordResetPause: Long,
    @Value("\${mlreef.password-management.password-reset-url}") val passwordResetUrl: String,
    @Value("\${mlreef.password-management.password-reset-confirm-url}") val passwordResetConfirmUrl: String?,
    @Value("\${mlreef.password-management.reset-password-token-valid-sec:600}") val passwordRestTokenValidSec: Long
) : PasswordService {

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
        private const val RESET_PASSWORD_SUBJECT = "Password reset"

    }

    override fun resetPasswordStart(email: String?, userName: String?, userId: UUID?) {
        val account: Account

        when {
            email != null -> account = accountRepository.findOneByEmail(email)
                ?: throw UserNotFoundException(email = email)
            userName != null -> account = accountRepository.findOneByUsername(userName)
                ?: throw UserNotFoundException(userName = userName)
            userId != null -> account = accountRepository.findByIdOrNull(userId)
                ?: throw UserNotFoundException(userId = userId)
            else -> throw BadParametersException("Any search parameter should be presented")
        }

        if (account.changeAccountToken!=null &&
            account.changeAccountTokenCreatedAt!=null &&
            account.changeAccountTokenCreatedAt!!.plusSeconds(sendPasswordResetPause).isAfter(ZonedDateTime.now())) {
            val nextSendTime = DateTimeFormatter.ISO_ZONED_DATE_TIME.format(account.changeAccountTokenCreatedAt!!.plusSeconds(sendPasswordResetPause))
            log.warn("Password reset email has already been sent. The next sending possible after $nextSendTime")
            return
        }

        val savedAccount = accountRepository.save(
            account.copyWithToken(UUID.randomUUID().toString(), ZonedDateTime.now())
        )

        val resetPasswordUrl = "$passwordResetUrl/${account.changeAccountToken}"

        val variables = mapOf(
            EmailVariables.USER_NAME to savedAccount.username,
            EmailVariables.RECIPIENT_EMAIL to savedAccount.email,
            EmailVariables.SUBJECT to RESET_PASSWORD_SUBJECT,
            EmailVariables.REDIRECT_URL to resetPasswordUrl
        )

        emailService.sendAsync(savedAccount.id, EmailMessageType.HTML, TemplateType.PASSWORD_RESET_TEMPLATE, variables)
    }

    override fun passwordResetConfirm(token: String, password: String): Boolean {
        val account = accountRepository.findByChangeAccountToken(token)
            ?: throw UnknownUserException("User has not password reset requested")

        if (account.changeAccountTokenCreatedAt==null ||
            account.changeAccountTokenCreatedAt!!.plusSeconds(passwordRestTokenValidSec).isBefore(ZonedDateTime.now())) {
            throw BadParametersException("Reset password operation is expired. Please request a new one")
        }

        val savedAccount = accountRepository.save(account.copyWithToken(null, null))

        return authService.changePasswordForUser(savedAccount, password)
    }
}