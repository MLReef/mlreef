package com.mlreef.rest.feature.email

import com.mlreef.rest.EmailRepository
import com.mlreef.rest.domain.Email
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.scheduling.TaskScheduler
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID
import java.util.concurrent.atomic.AtomicReference
import javax.mail.internet.MimeMessage

interface EmailService {
    fun sendAsync(accountId: UUID,
                  messageType: EmailMessageType,
                  template: TemplateType,
                  variables: Map<EmailVariables, Any>): Email

    fun sendSync(accountId: UUID,
                 messageType: EmailMessageType,
                 template: TemplateType,
                 variables: Map<EmailVariables, Any>): Email
}

enum class EmailVariables {
    RECIPIENT_EMAIL,
    USER_NAME,
    REDIRECT_URL,
    SUBJECT,
    SCHEDULED_AT
}

@Service
class MlReefEmailService(
    private val mailSender: JavaMailSender,
    private val templateService: TemplateService,
    private val scheduler: TaskScheduler,
    private val emailRepository: EmailRepository,
    @Value("\${mlreef.email.send-attempts-on-fail:1}") val failAttempts: Int,
    @Value("\${mlreef.email.pause-between-failed-attempts-sec:60}") val pauseAttempts: Long
) : EmailService {

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
    }

    override fun sendAsync(accountId: UUID,
                           messageType: EmailMessageType,
                           template: TemplateType,
                           variables: Map<EmailVariables, Any>): Email {
        val scheduledAt = variables[EmailVariables.SCHEDULED_AT] as Instant?

        val task = prepareTask(accountId, scheduledAt, messageType, template, variables)

        scheduler.schedule(task, scheduledAt ?: Instant.now())

        return task.getEmail()
    }

    override fun sendSync(accountId: UUID,
                          messageType: EmailMessageType,
                          template: TemplateType,
                          variables: Map<EmailVariables, Any>): Email {
        val scheduledAt = variables[EmailVariables.SCHEDULED_AT] as Instant?

        val task = prepareTask(accountId, scheduledAt, messageType, template, variables)

        scheduler.schedule(task, scheduledAt ?: Instant.now()).get()

        return task.getEmail()
    }

    private fun prepareTask(accountId: UUID,
                            scheduledAt: Instant?,
                            messageType: EmailMessageType,
                            template: TemplateType,
                            variables: Map<EmailVariables, Any>): SendEmailTask {
        val email = Email(
            UUID.randomUUID(),
            accountId,
            variables[EmailVariables.USER_NAME] as String,
            variables[EmailVariables.RECIPIENT_EMAIL] as String,
            null,
            variables[EmailVariables.SUBJECT] as String,
            null,
            if (scheduledAt!=null) ZonedDateTime.ofInstant(scheduledAt, ZoneId.systemDefault()) else null
        )

        var textMessage: Pair<SimpleMailMessage, String>? = null
        var htmlMessage: Pair<MimeMessage, String>? = null

        when (messageType) {
            EmailMessageType.HTML -> htmlMessage = generateHtmlMessage(email, template, variables)
            EmailMessageType.TEXT -> textMessage = generateTextMessage(email, template, variables)
        }

        val emailCopy = emailRepository.save(
            email.copy(message = htmlMessage?.second ?: textMessage?.second)
        )

        return SendEmailTask(emailCopy, textMessage?.first, htmlMessage?.first)
    }

    private fun generateHtmlMessage(email: Email, template: TemplateType, variables: Map<EmailVariables, Any>): Pair<MimeMessage, String> {
        val mailMessage = mailSender.createMimeMessage()
        val messageHelper = MimeMessageHelper(mailMessage, true, "UTF-8")

        val messageBodyHtml = generateHtmlFromTemplate(template, variables)
        val messageBodyText = generateTextFromTemplate(template, variables)

        messageHelper.setFrom("MLReef", "MLReef");
        messageHelper.setTo(email.recipientEmail);
        messageHelper.setSubject(email.subject);
        messageHelper.setText(messageBodyText, messageBodyHtml);

        return Pair(mailMessage, messageBodyHtml)
    }

    private fun generateTextMessage(email: Email, template: TemplateType, variables: Map<EmailVariables, Any>): Pair<SimpleMailMessage, String> {
        val simpleMessage = SimpleMailMessage()
        simpleMessage.setTo(email.recipientEmail)
        simpleMessage.subject = email.subject
        simpleMessage.text = generateTextFromTemplate(template, variables)
        return Pair(simpleMessage, simpleMessage.text)
    }

    private fun generateHtmlFromTemplate(template: TemplateType, variables: Map<EmailVariables, Any>): String {
        return when (template) {
            TemplateType.PASSWORD_RESET_TEMPLATE -> templateService.createPasswordResetTemplateHtml(variables)
            TemplateType.WELCOME_MESSAGE_TEMPLATE -> templateService.createWelcomeMessageTemplateHtml(variables)
            else -> ""
        }
    }

    private fun generateTextFromTemplate(template: TemplateType, variables: Map<EmailVariables, Any>): String {
        return when (template) {
            TemplateType.PASSWORD_RESET_TEMPLATE -> templateService.createPasswordResetTemplateText(variables)
            TemplateType.WELCOME_MESSAGE_TEMPLATE -> templateService.createWelcomeMessageTemplateText(variables)
            else -> ""
        }
    }

    inner class SendEmailTask(email: Email,
                              private val textMessage: SimpleMailMessage? = null,
                              private val htmlMessage: MimeMessage? = null,
                              private val attempt: Int = 0) : Runnable {
        private var email: AtomicReference<Email> = AtomicReference(email)

        override fun run() {
            try {
                when {
                    textMessage != null -> mailSender.send(textMessage)
                    htmlMessage != null -> mailSender.send(htmlMessage)
                }

                email.set(
                    emailRepository.save(
                        email.get().copy(sentAt = ZonedDateTime.now())
                    )
                )

                log.debug("Email was sent successfully. Subject: ${email.get().subject} Recipient: ${email.get().recipientEmail}. Attempts: ${attempt+1}")
            } catch (ex: Exception) {
                log.error("Unable to send email ${email.get().id}. Subject: ${email.get().subject} Recipient: ${email.get().recipientEmail}. Attempts: ${attempt+1} Exception: $ex")
                val logDateTime = DateTimeFormatter.ISO_INSTANT.format(Instant.now())
                val failedMessage = "${email.get().failMessages ?: ""}${System.lineSeparator()}[$logDateTime}] ${ex}".trim()

                email.set(
                    emailRepository.save(
                        email.get().copy(failMessages = failedMessage)
                    )
                )

                val newAttempt = attempt + 1

                if (newAttempt < failAttempts) {
                    val task = SendEmailTask(email.get(), this.textMessage, this.htmlMessage, newAttempt)
                    scheduler.schedule(task, Instant.now().plusSeconds(pauseAttempts))
                }
            }
        }

        fun getEmail(): Email = email.get()
    }
}


enum class EmailMessageType {
    HTML,
    TEXT
}