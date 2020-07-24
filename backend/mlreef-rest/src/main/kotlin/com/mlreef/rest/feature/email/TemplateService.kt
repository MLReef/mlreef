package com.mlreef.rest.feature.email

import org.springframework.expression.ExpressionParser
import org.springframework.expression.common.TemplateParserContext
import org.springframework.expression.spel.standard.SpelExpressionParser
import org.springframework.expression.spel.support.StandardEvaluationContext
import org.springframework.stereotype.Service
import org.thymeleaf.TemplateEngine
import org.thymeleaf.context.Context
import java.io.BufferedReader
import java.io.FileNotFoundException
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets
import java.util.logging.Logger
import javax.annotation.PostConstruct
import kotlin.streams.toList


interface TemplateService {
    fun createPasswordResetTemplateHtml(variables: Map<EmailVariables, Any>): String
    fun createPasswordResetTemplateText(variables: Map<EmailVariables, Any>): String
    fun createWelcomeMessageTemplateHtml(variables: Map<EmailVariables, Any>): String
    fun createWelcomeMessageTemplateText(variables: Map<EmailVariables, Any>): String
}

@Service
class EmailTemplateService(
    private val templateEngine: TemplateEngine
) : TemplateService {

    companion object {
        private val log: Logger = Logger.getLogger(this::class.simpleName)

        private const val PASSWORD_RESET_TEMPLATE_NAME_HTML = "html/password_reset.html"
        private const val PASSWORD_RESET_TEMPLATE_NAME_TEXT = "text/password_reset.txt"

        private const val WELCOME_MESSAGE_TEMPLATE_NAME_HTML = "html/welcome.html"
        private const val WELCOME_MESSAGE_TEMPLATE_NAME_TEXT = "text/welcome.txt"
    }

    @PostConstruct
    fun init() {
        log.info("Email template service created...")
    }

    override fun createPasswordResetTemplateHtml(variables: Map<EmailVariables, Any>): String {
        return generateHtmlTemplate(PASSWORD_RESET_TEMPLATE_NAME_HTML, variables)
    }

    override fun createPasswordResetTemplateText(variables: Map<EmailVariables, Any>): String {
        return generateTextTemplate(PASSWORD_RESET_TEMPLATE_NAME_TEXT, variables)
    }

    override fun createWelcomeMessageTemplateHtml(variables: Map<EmailVariables, Any>): String {
        return generateHtmlTemplate(WELCOME_MESSAGE_TEMPLATE_NAME_HTML, variables)
    }

    override fun createWelcomeMessageTemplateText(variables: Map<EmailVariables, Any>): String {
        return generateTextTemplate(WELCOME_MESSAGE_TEMPLATE_NAME_TEXT, variables)
    }

    private fun generateHtmlTemplate(templatePath: String, variables: Map<EmailVariables, Any>): String {
        val context = Context()

        context.setVariable(EmailVariables.SUBJECT.name, variables[EmailVariables.SUBJECT])
        context.setVariable(EmailVariables.USER_NAME.name, variables[EmailVariables.USER_NAME])
        context.setVariable(EmailVariables.REDIRECT_URL.name, variables[EmailVariables.REDIRECT_URL])

        return templateEngine.process(PASSWORD_RESET_TEMPLATE_NAME_HTML, context)
    }

    private fun generateTextTemplate(templatePath: String, params: Map<EmailVariables, Any>): String {
        val input = this.javaClass.classLoader.getResourceAsStream("templates/$templatePath")
            ?: throw FileNotFoundException("Cannot read file $templatePath")

        val lines = BufferedReader(InputStreamReader(input, StandardCharsets.UTF_8))
            .lines()
            .toList()
            .joinToString(System.lineSeparator())

        val expressionParser: ExpressionParser = SpelExpressionParser()
        val context = StandardEvaluationContext()
        context.setVariables(params.mapKeys { it.key.name })

        val expression = expressionParser.parseExpression(lines, TemplateParserContext())
        return expression.getValue(context) as String
    }
}



enum class TemplateType {
    PASSWORD_RESET_TEMPLATE
}
