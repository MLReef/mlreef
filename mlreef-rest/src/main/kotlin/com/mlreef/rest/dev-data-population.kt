package com.mlreef.rest

import com.mlreef.rest.feature.auth.AuthService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Component
import java.util.*
import java.util.UUID.randomUUID


@Profile(ApplicationProfiles.DEV)
@Component
internal class CommandLineAppStartupRunner(
    val dataPopulator: DataPopulator
) : CommandLineRunner {

    @Throws(Exception::class)
    override fun run(vararg args: String) {
        logger.info("Application started with command-line arguments: {} . \n To kill this application, press Ctrl + C.", Arrays.toString(args))
        dataPopulator.init()
    }

    companion object {
        private val logger = LoggerFactory.getLogger(CommandLineAppStartupRunner::class.java)
    }
}

@Profile(ApplicationProfiles.DEV)
@Component
internal class DataPopulator(
    val authService: AuthService,
    val dataProjectRepository: DataProjectRepository,
    val personRepository: PersonRepository,
    val accountTokenRepository: AccountTokenRepository,
    val accountRepository: AccountRepository,
    val codeProjectRepository: CodeProjectRepository,
    val dataProcessorRepository: DataProcessorRepository,
    val dataProcessorInstanceRepository: DataProcessorInstanceRepository,
    val processorParameterRepository: ProcessorParameterRepository,
    val parameterInstanceRepository: ParameterInstanceRepository,
    val experimentRepository: ExperimentRepository,
    @Value("\${mlreef.gitlab.mockUserToken}") val mockUserToken: String? = null
) {
    fun init() {
        try {
            val username = "mlreef"
            val email = "mlreef@example.org"
            val encryptedPassword = "$2a$10\$YYeURJweLZlrCHKyitID6ewdQlyK4rWwRTutvtcRMgvU8DMy6rab."
            val subjectId = UUID.fromString("9d0e1cae-f056-40c4-b51e-32eb1c7f54a1")
            val accountId = UUID.fromString("a607f780-b867-4d50-9e23-f045f3715d88")
            val accountTokenId = UUID.fromString("86c4ab09-12c1-4614-b85c-561afffd25d8")
            val dataProjectId = UUID.fromString("5d005488-afb6-4a0c-852a-f471153a04b5")
            val experimentId = UUID.fromString("77481b71-8d40-4a48-9117-8d0c5129d6ec")

            val person = Person(subjectId, username, username)
            val account = Account(accountId, username, email, encryptedPassword, person)
            val accountToken = AccountToken(accountTokenId, accountId, mockUserToken!!, 0)

            safeSave { personRepository.save(person) }
            safeSave { accountRepository.save(account) }
            safeSave { accountTokenRepository.save(accountToken) }
            val dataProject = DataProject(dataProjectId, "test-data-project", "url", person)
            safeSave { dataProjectRepository.save(dataProject) }

            val codeRepoId = randomUUID()
            val codeProject = CodeProject(codeRepoId, "slug", "url", owner = account.person)
            safeSave { codeProjectRepository.save(codeProject) }

            val dataOp1 = DataOperation(randomUUID(), "commons-data-operation1", "name", DataType.ANY, DataType.ANY)
            val dataOp2 = DataAlgorithm(randomUUID(), "commons-algorithm", "name", DataType.ANY, DataType.ANY)
            val dataOp3 = DataVisualization(randomUUID(), "commons-data-visualisation", "name", DataType.ANY)

            dataProcessorRepository.save(dataOp1)
            dataProcessorRepository.save(dataOp2)
            dataProcessorRepository.save(dataOp3)

            processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "stringParam", ParameterType.STRING))
            processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "floatParam", ParameterType.FLOAT))
            processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "integerParam", ParameterType.INTEGER))
            processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "stringList", ParameterType.LIST))

            processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp2.id, "booleanParam", ParameterType.BOOLEAN))
            processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp2.id, "complexName", ParameterType.COMPLEX))

            processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp3.id, "tupleParam", ParameterType.TUPLE))
            processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp3.id, "hashParam", ParameterType.DICTIONARY))

            val processorInstance = DataProcessorInstance(randomUUID(), dataOp1)

            val experiment = Experiment(experimentId, dataProjectId, "branch", preProcessing = arrayListOf(processorInstance))
            safeSave { experimentRepository.save(experiment) }
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
    }


}

internal fun safeSave(f: () -> Unit) {
    try {
        f.invoke()
    } catch (e: DataIntegrityViolationException) {
        e.printStackTrace()
    }
}
