package com.mlreef.rest.api

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataAlgorithmRepository
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataOperationRepository
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.DataVisualizationRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ParameterInstanceRepository
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.api.v1.ExperimentCreateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PerformanceMetricsDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.restdocs.RestDocumentationExtension
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.*
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.*
import org.springframework.test.annotation.Rollback
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.*
import java.util.UUID.randomUUID
import javax.transaction.Transactional


@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest
class ExperimentsApiTest : RestApiTest() {

    private lateinit var dataOp1: DataOperation
    private lateinit var dataOp2: DataAlgorithm
    private lateinit var dataOp3: DataVisualization
    private lateinit var subject: Person
    private lateinit var dataProject: DataProject
    val rootUrl = "/api/v1/data-projects"

    @Autowired private lateinit var experimentRepository: ExperimentRepository
    @Autowired private lateinit var dataProjectRepository: DataProjectRepository
    @Autowired private lateinit var codeProjectRepository: CodeProjectRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var parameterInstanceRepository: ParameterInstanceRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository
    @Autowired private lateinit var dataOperationRepository: DataOperationRepository
    @Autowired private lateinit var dataAlgorithmRepository: DataAlgorithmRepository
    @Autowired private lateinit var dataVisualizationRepository: DataVisualizationRepository
    @Autowired private lateinit var dataProcessorRepository: DataProcessorRepository

    @BeforeEach
    @AfterEach
    fun clearRepo() {

        parameterInstanceRepository.deleteAll()
        dataProcessorInstanceRepository.deleteAll()
        experimentRepository.deleteAll()

        processorParameterRepository.deleteAll()
        dataProcessorRepository.deleteAll()

        dataProjectRepository.deleteAll()
        codeProjectRepository.deleteAll()

        personRepository.deleteAll()
        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()

        account = createMockUser()
        subject = account.person
        dataProject = DataProject(UUID.fromString("aaaa0001-0000-0000-0000-dbdbdbdbdbdb"), "slug", "url", owner = account.person)
        dataProjectRepository.save(dataProject)
        val codeRepoId = randomUUID()
        val codeProject = CodeProject(codeRepoId, "slug", "url", owner = account.person)
        codeProjectRepository.save(codeProject)

        dataOp1 = DataOperation(UUID.randomUUID(), "commons-data-operation1", "name", DataType.ANY, DataType.ANY)
        dataOp2 = DataAlgorithm(randomUUID(), "commons-algorithm", "name", DataType.ANY, DataType.ANY)
        dataOp3 = DataVisualization(randomUUID(), "commons-data-visualisation", "name", DataType.ANY)

        dataOperationRepository.save(dataOp1)
        dataAlgorithmRepository.save(dataOp2)
        dataVisualizationRepository.save(dataOp3)

        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "stringParam", type = ParameterType.STRING))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "floatParam", type = ParameterType.FLOAT))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "integerParam", type = ParameterType.INTEGER))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "stringList", type = ParameterType.LIST))

        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp2.id, "booleanParam", type = ParameterType.BOOLEAN))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp2.id, "complexName", type = ParameterType.COMPLEX))

        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp3.id, "tupleParam", type = ParameterType.TUPLE))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp3.id, "hashParam", type = ParameterType.DICTIONARY))
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create new Experiment`() {
        val request = ExperimentCreateRequest(
            branch = "branch",
            preProcessing = listOf(
                DataProcessorInstanceDto("commons-data-operation1", listOf(
                    ParameterInstanceDto("stringParam", type = ParameterType.STRING.name, value = "string value"),
                    ParameterInstanceDto("floatParam", type = ParameterType.FLOAT.name, value = "0.01"),
                    ParameterInstanceDto("integerParam", type = ParameterType.INTEGER.name, value = "10"),
                    ParameterInstanceDto("stringList", type = ParameterType.LIST.name, value = "[\"asdf\",\"asdf\",\"asdf\"]")
                ))
            ),
            processing = DataProcessorInstanceDto("commons-algorithm", listOf(
                ParameterInstanceDto("booleanParam", type = ParameterType.BOOLEAN.name, value = "true"),
                ParameterInstanceDto("complexName", type = ParameterType.COMPLEX.name, value = "(1.0, 2.0)")
            )),
            postProcessing = listOf(
                DataProcessorInstanceDto("commons-data-visualisation", listOf(
                    ParameterInstanceDto("tupleParam", type = ParameterType.TUPLE.name, value = "(\"asdf\", 1.0)"),
                    ParameterInstanceDto("hashParam", type = ParameterType.DICTIONARY.name, value = "{\"key\":\"value\"}")
                ))))
        val url = "$rootUrl/${dataProject.id}/experiments"
        val returnedResult: ExperimentDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(post(url))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andDo(document(
                "experiment-create-success",
                requestFields(experimentCreateRequestFields())
                    .and(dataProcessorFields("preProcessing[]."))
                    .and(dataProcessorFields("postProcessing[]."))
                    .and(dataProcessorFields("processing.")),
                responseFields(experimentDtoResponseFields())
                    .and(dataProcessorFields("preProcessing[]."))
                    .and(dataProcessorFields("postProcessing[]."))
                    .and(dataProcessorFields("processing."))
            ))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, ExperimentDto::class.java)
            }

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all own Experiments`() {

        val experiment1 = Experiment(randomUUID(), dataProjectId = dataProject.id, branch = "branch")
        val experiment2 = Experiment(randomUUID(), dataProjectId = dataProject.id, branch = "branch")
        experimentRepository.save(experiment1)
        experimentRepository.save(experiment2)

        val returnedResult: List<ExperimentDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${dataProject.id}/experiments")))
            .andExpect(status().isOk)
            .andDo(document(
                "experiment-retrieve-all",
                responseFields(experimentDtoResponseFields("[]."))))
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, ExperimentDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(2)

    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own Experiment`() {
        val dataProcessorInstance = DataProcessorInstance(randomUUID(), dataOp1)
        dataProcessorInstanceRepository.save(dataProcessorInstance)
        val experiment1 = Experiment(randomUUID(), dataProjectId = dataProject.id, branch = "branch",
            preProcessing = arrayListOf(dataProcessorInstance))
        experimentRepository.save(experiment1)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${dataProject.id}/experiments/${experiment1.id}")))
            .andExpect(status().isOk)
            .andDo(document(
                "experiment-retrieve-one",
                responseFields(experimentDtoResponseFields())
                    .and(dataProcessorFields("preProcessing[]."))
                    .and(dataProcessorFields("postProcessing[]."))
                    .and(dataProcessorFields("processing."))))

    }

    @Transactional
    @Rollback
    @Test
    fun `Can update own Experiment's PerformanceMetrics`() {
        val experiment1 = Experiment(randomUUID(), dataProjectId = dataProject.id, branch = "branch")
        experimentRepository.save(experiment1)

        val request = PerformanceMetricsDto()
        val url = "$rootUrl/${dataProject.id}/experiments/${experiment1.id}/metrics"
        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentAuth(put(url))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andDo(document(
                "experiment-update-metrics",
                requestFields(experimentMetricsDtoResponseFields()),
                responseFields(experimentMetricsDtoResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, PerformanceMetricsDto::class.java)
            }

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve own Experiment's PerformanceMetrics`() {
        val experiment1 = Experiment(randomUUID(), dataProjectId = dataProject.id, branch = "branch")
        experimentRepository.save(experiment1)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/metrics")))
            .andExpect(status().isOk)
            .andDo(document(
                "experiment-retrieve-one-metrics",
                responseFields(experimentMetricsDtoResponseFields())))

    }

    private fun experimentDtoResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("UUID"),
//            fieldWithPath(prefix + "authorId").type(JsonFieldType.STRING).description("Id of a Subject which authors this Experiment"),
            fieldWithPath(prefix + "dataProjectId").type(JsonFieldType.STRING).description("Id of DataProject"),
            fieldWithPath(prefix + "performanceMetrics").type(JsonFieldType.OBJECT).optional().description("Optional embedded PerformanceMetric"),
            fieldWithPath(prefix + "performanceMetrics.jobStartedAt").type(JsonFieldType.NUMBER).optional().description("Timestamp when the job was started"),
            fieldWithPath(prefix + "performanceMetrics.jobUpdatedAt").type(JsonFieldType.NUMBER).optional().description("Timestamp when the job was updated"),
            fieldWithPath(prefix + "performanceMetrics.jobFinishedAt").type(JsonFieldType.NUMBER).optional().description("Optional timestamp when the job was finished "),
            fieldWithPath(prefix + "performanceMetrics.jsonBlob").type(JsonFieldType.STRING).optional().description("Json object describing specific metrics"),
            fieldWithPath(prefix + "preProcessing").optional().type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing"),
            fieldWithPath(prefix + "postProcessing").optional().type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PostProcessing"),
            fieldWithPath(prefix + "processing").optional().type(JsonFieldType.OBJECT).optional().description("An optional DataAlgorithm"),
            fieldWithPath(prefix + "branch").type(JsonFieldType.STRING).description("Branch name")
        )
    }

    private fun dataProcessorFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).optional().description("Unique slug of this DataProcessor"),
            fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).optional().description("Optional Name of this DataProcessor ( not needed in Inputs)"),
            fieldWithPath(prefix + "parameters[].name").type(JsonFieldType.STRING).optional().description("Name of Parameter"),
            fieldWithPath(prefix + "parameters").type(JsonFieldType.ARRAY).optional().description("Name of Parameter"),
            fieldWithPath(prefix + "parameters[].type").type(JsonFieldType.STRING).optional().description("Provided ParameterType of this Parameter"),
            fieldWithPath(prefix + "parameters[].value").type(JsonFieldType.STRING).optional().description("Provided value (as parsable String) of Parameter ")
        )
    }

    private fun experimentMetricsDtoResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "jsonBlob").type(JsonFieldType.STRING).optional().description("Json object describing specific metrics"),
            fieldWithPath(prefix + "jobStartedAt").type(JsonFieldType.NUMBER).optional().description("Timestamp when the job was started"),
            fieldWithPath(prefix + "jobUpdatedAt").type(JsonFieldType.NUMBER).optional().description("Timestamp when the job was updated"),
            fieldWithPath(prefix + "jobFinishedAt").type(JsonFieldType.NUMBER).optional().description("Optional timestamp when the job was finished ")
        )
    }

    private fun experimentCreateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("branch").type(JsonFieldType.STRING).description("Branch name"),
            fieldWithPath("preProcessing").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing"),
            fieldWithPath("postProcessing").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PostProcessing"),
            fieldWithPath("processing").type(JsonFieldType.OBJECT).optional().description("An optional DataAlgorithm")
        )
    }


}
