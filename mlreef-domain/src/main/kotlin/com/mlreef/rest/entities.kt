@file:Suppress("JpaObjectClassSignatureInspection", "JpaDataSourceORMInspection")

package com.mlreef.rest

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import org.hibernate.annotations.LazyCollection
import org.hibernate.annotations.LazyCollectionOption
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.domain.Persistable
import java.io.Serializable
import java.time.LocalDateTime
import java.time.ZonedDateTime
import java.util.*
import java.util.UUID.randomUUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.DiscriminatorColumn
import javax.persistence.DiscriminatorValue
import javax.persistence.Embeddable
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.JoinColumn
import javax.persistence.JoinColumns
import javax.persistence.ManyToOne
import javax.persistence.MappedSuperclass
import javax.persistence.NamedAttributeNode
import javax.persistence.NamedEntityGraph
import javax.persistence.NamedEntityGraphs
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.PostLoad
import javax.persistence.PostPersist
import javax.persistence.PrePersist
import javax.persistence.PreUpdate
import javax.persistence.Table
import javax.persistence.Transient
import javax.persistence.Version

@MappedSuperclass
abstract class BaseEntity(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) private val id: UUID
) : Persistable<UUID> {

    @Version var version: Long? = 0

    @CreatedDate
    @Column(name = "created_at") var createdAt: ZonedDateTime? = null

    @LastModifiedDate
    @Column(name = "updated_at") var updatedAt: ZonedDateTime? = null

    @Transient
    private var persisted: Boolean = version ?: 0 > 0

    override fun getId(): UUID = id
    override fun isNew(): Boolean = !persisted
    override fun hashCode(): Int = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is BaseEntity -> false
            else -> getId() == other.getId()
        }
    }

    @PostPersist
    @PostLoad
    private fun setPersisted() {
        persisted = true
    }

    @PrePersist
    private fun onPrePersist() {
        createdAt = I18N.dateTime()
    }

    @PreUpdate
    private fun onPreUpdate() {
        updatedAt = I18N.dateTime()
    }
}

@Table(name = "subject")
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
class Subject(
    id: UUID,
    val slug: String,
    val name: String
) : BaseEntity(id)

@Entity
@Table(name = "membership")
class Membership(
    id: UUID,
    @Column(name = "person_id")
    val personId: UUID,
    @Column(name = "group_id")
    val groupId: UUID
) : BaseEntity(id)

@Entity
class Person(
    id: UUID,
    slug: String,
    name: String,
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.REMOVE])
    @JoinColumn(name = "person_id")
    @Fetch(value = FetchMode.SUBSELECT)
//    @LazyCollection(LazyCollectionOption.FALSE)
    val memberships: List<Membership> = listOf()
) : Subject(id, slug, name)

@Entity
class Group(
    id: UUID,
    slug: String,
    name: String,
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.REMOVE])
    @JoinColumn(name = "group_id")
    @Fetch(value = FetchMode.SUBSELECT)
//    @LazyCollection(LazyCollectionOption.FALSE)
    val members: List<Membership> = listOf()
) : Subject(id, slug, name)

@Entity
@Table(name = "account")
class Account(
    id: UUID,
    val username: String,
    val email: String,
    val passwordEncrypted: String,
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "person_id")
    val person: Person,
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "account_id")
    val tokens: List<AccountToken> = listOf(),
    @Column(name = "gitlab_id")
    val gitlabId: Int? = null
) : BaseEntity(id)

@Entity
@Table(name = "account_token")
class AccountToken(
    id: UUID,
    @Column(name = "account_id")
    val accountId: UUID,
    @Column(unique = true)
    val token: String,
    @Column(name = "gitlab_id")
    val gitlabId: Int? = null,
    val active: Boolean = true,
    val revoked: Boolean = false,
    @Column(name = "expires_at")
    val expiresAt: LocalDateTime? = null
) : BaseEntity(id)


enum class VisibilityScope {
    PRIVATE,
    PUBLIC,
    TEAM;

    companion object {
        fun default(): VisibilityScope = TEAM
    }
}

/**
 * Symbolize a Gitlab repository which is used in the context of MLReef.
 * Most properties are transient, semantic will be added
 */
interface MLProject {
    val slug: String
    val url: String
    val ownerId: UUID
}

/**
 * A Machine Learning Repository Project describes the association of data and experiments.
 * A repo can also be described with an DataType, for example a MLDataRepository using Images a data set
 */
@Entity
@Table(name = "data_project")
class DataProject(
    id: UUID,
    override val slug: String,
    override val url: String,

    @Column(name = "owner_id")
    override val ownerId: UUID,

    @Column(name = "gitlab_group")
    val gitlabGroup: String,

    @Column(name = "gitlab_project")
    val gitlabProject: String,

    @Column(name = "gitlab_id")
    val gitlabId: Int,

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinColumn(name = "data_project_id")
    val experiments: List<Experiment> = listOf()
) : BaseEntity(id), MLProject

/**
 * A Code Repository is used for the working Code like Data Operations,
 * Algorithms, or soon Visualisations.
 *
 * A
 */
@Entity
@Table(name = "code_project")
class CodeProject(
    id: UUID,
    override val slug: String,
    override val url: String,

    @Column(name = "owner_id")
    override val ownerId: UUID,

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "code_project_id")
    val dataProcessor: DataProcessor? = null

) : BaseEntity(id), MLProject

/**
 * Descriptor of an Output, which could be a Gitlab Artifact, an S3 Bucket or many more.
 *
 *
 */

@Entity
@Table(name = "output_file")
class OutputFile(
    id: UUID,

    @Column(name = "experiment_id")
    val experimentId: UUID?,

    @Column(name = "data_processor_id")
    val dataProcessorId: UUID?
) : BaseEntity(id)

enum class ExperimentStatus(private val stage: Int) {
    CREATED(1),
    PENDING(2),
    RUNNING(3),
    SKIPPED(3),
    SUCCESS(4),
    FAILED(4),
    CANCELED(4),
    ARCHIVED(5);

    fun isDone() {
        this == SUCCESS || this == FAILED
    }

    fun canUpdateTo(next: ExperimentStatus): Boolean {
        return next.stage > this.stage
    }
}

/**
 * An Experiment is a instance of a ProcessingChain with Data
 */
@Entity
@Table(name = "experiment")
class Experiment(
    id: UUID,
    @Column(name = "data_project_id")
    val dataProjectId: UUID,

    @Column(name = "source_branch")
    val sourceBranch: String,

    @Column(name = "target_branch")
    val targetBranch: String,

    @Embedded
    val performanceMetrics: PerformanceMetrics = PerformanceMetrics(),

    @OneToMany(fetch = FetchType.EAGER)
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(name = "experiment_id")
    val outputFiles: List<OutputFile> = arrayListOf(),

    /**
     * Has DataOps and DataVisuals
     */
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(name = "experimentPreProcessingId")
    val preProcessing: MutableList<DataProcessorInstance> = arrayListOf(),
    /**
     * Has DataOps and maybe DataVisuals
     */
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(name = "experimentPostProcessingId")
    val postProcessing: MutableList<DataProcessorInstance> = arrayListOf(),
    /**
     * Contains exactly 1 Algorithm (could be implement as DataExecutionInstance as well)
     */
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "experimentProcessingId")
    protected var processing: DataProcessorInstance? = null,

    @Enumerated(EnumType.STRING)
    val status: ExperimentStatus = ExperimentStatus.CREATED

) : BaseEntity(id) {

    fun addPreProcessor(processorInstance: DataProcessorInstance) {
        preProcessing.add(processorInstance)
        processorInstance.experimentPreProcessingId = this.id
    }

    fun addPostProcessor(processorInstance: DataProcessorInstance) {
        postProcessing.add(processorInstance)
        processorInstance.experimentPostProcessingId = this.id
    }

    fun setProcessor(processorInstance: DataProcessorInstance) {
        processing = (processorInstance)
        processorInstance.experimentProcessingId = this.id
    }

    fun getProcessor() = this.processing

    fun copy(
        sourceBranch: String? = null,
        targetBranch: String? = null,
        performanceMetrics: PerformanceMetrics? = null,
        outputFiles: List<OutputFile>? = null,
        preProcessing: MutableList<DataProcessorInstance>? = null,
        postProcessing: MutableList<DataProcessorInstance>? = null,
        processing: DataProcessorInstance? = null,
        status: ExperimentStatus? = null
    ): Experiment {
        return Experiment(
            id = id,
            dataProjectId = dataProjectId,
            sourceBranch = sourceBranch ?: this.sourceBranch,
            targetBranch = targetBranch ?: this.targetBranch,
            performanceMetrics = performanceMetrics ?: this.performanceMetrics,
            outputFiles = outputFiles ?: this.outputFiles,
            preProcessing = preProcessing ?: this.preProcessing,
            postProcessing = postProcessing ?: this.postProcessing,
            processing = processing ?: this.processing,
            status = status ?: this.status
        )
    }
}

@Embeddable
class PerformanceMetrics(
    var jobStartedAt: ZonedDateTime? = null,
    var jobUpdatedAt: ZonedDateTime? = null,
    var jobFinishedAt: ZonedDateTime? = null,
    var jsonBlob: String = ""
)

enum class DataProcessorType {
    ALGORITHM,
    OPERATION,
    VISUALISATION
}

/**
 * A DataProcessor can be applied onto Data to filter or manipulate the Data.
 * The result of DataOperation over Data is Data again, or in special cases, Visualisation output
 *
 * The source and input DataTypes must be defined to be usable for the community
 * The List of Parameters is ordered and names must be uniqe.
 *
 * DataOperations can be chained in a execution
 */
@Table(name = "data_processor")
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@NamedEntityGraphs(
    NamedEntityGraph(name = "DataProcessor-full", attributeNodes = [
        NamedAttributeNode("parameters"),
//        NamedAttributeNode("output"),
        NamedAttributeNode("author")
    ])

)
@DiscriminatorColumn(name = "PROCESSOR_TYPE")
class DataProcessor(
    id: UUID,
    val slug: String,
    val name: String,
    val command: String,
    @Enumerated(EnumType.STRING)
    val inputDataType: DataType,
    @Enumerated(EnumType.STRING)
    val outputDataType: DataType,
    val type: DataProcessorType,
    @Enumerated(EnumType.STRING)
    val visibilityScope: VisibilityScope = VisibilityScope.default(),
    @Column(length = 1024)
    val description: String = "",

    @Column(name = "code_project_id")
    val codeProjectId: UUID? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id")
    val author: Subject? = null,

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "data_processor_id")
    @Fetch(value = FetchMode.SUBSELECT)
    val parameters: List<ProcessorParameter> = arrayListOf(),

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "data_processor_id")
    @Fetch(value = FetchMode.SUBSELECT)
    @LazyCollection(LazyCollectionOption.FALSE)
    val outputFiles: List<OutputFile> = listOf()
) : BaseEntity(id), Serializable {

    fun isChainable(): Boolean {
        return type != DataProcessorType.ALGORITHM
    }
}


/**
 * DataOperation perform on Data and create Data.
 * Therefore they must be chainable
 */
@Entity
@DiscriminatorValue("OPERATION")
class DataOperation(
    id: UUID,
    slug: String,
    name: String,
    command: String,
    inputDataType: DataType,
    outputDataType: DataType,
    visibilityScope: VisibilityScope = VisibilityScope.default(),
    description: String = "",
    author: Subject? = null,
    codeProjectId: UUID? = null,
    parameters: List<ProcessorParameter> = listOf()
) : DataProcessor(id, slug, name, command, inputDataType, outputDataType, DataProcessorType.OPERATION,
    visibilityScope, description, codeProjectId, author, parameters) {

    override fun isChainable(): Boolean = true
}

@Entity
@DiscriminatorValue("VISUALISATION")
class DataVisualization(
    id: UUID,
    slug: String,
    name: String,
    command: String,
    inputDataType: DataType,
    visibilityScope: VisibilityScope = VisibilityScope.default(),
    description: String = "",
    author: Subject? = null,
    codeProjectId: UUID? = null,
    parameters: List<ProcessorParameter> = listOf()
) : DataProcessor(id, slug, name, command, inputDataType, DataType.NONE, DataProcessorType.VISUALISATION,
    visibilityScope, description, codeProjectId, author, parameters) {
    override fun isChainable(): Boolean = true
}

/**
 * Proposal: Model DataAlgorithm as a Data processor, even if it not chainable
 */
@Entity
@DiscriminatorValue("ALGORITHM")
class DataAlgorithm(
    id: UUID,
    slug: String,
    name: String,
    command: String,
    inputDataType: DataType,
    outputDataType: DataType,
    visibilityScope: VisibilityScope = VisibilityScope.default(),
    description: String = "",
    author: Subject? = null,
    codeProjectId: UUID? = null,
    parameters: List<ProcessorParameter> = listOf()
) : DataProcessor(id, slug, name, command, inputDataType, outputDataType, DataProcessorType.ALGORITHM,
    visibilityScope, description, codeProjectId, author, parameters) {
    override fun isChainable(): Boolean = false
}

/**
 * An Instance of DataOperation or DataVisualisation contains instantiated values of Parameters
 */
@Entity
@Table(name = "data_processor_instance")
class DataProcessorInstance(
    id: UUID,

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumns(
        JoinColumn(name = "data_processor_id", referencedColumnName = "id"),
        JoinColumn(name = "data_processor_version", referencedColumnName = "version")
    )
    val dataProcessor: DataProcessor,
    val slug: String = dataProcessor.slug,
    val name: String = dataProcessor.name,

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "data_processor_instance_id")
    val parameterInstances: MutableList<ParameterInstance> = arrayListOf(),

    @Column(name = "parent_id")
    val parentId: UUID? = null,

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    val children: MutableList<DataProcessorInstance> = arrayListOf(),

    var experimentPreProcessingId: UUID? = null,

    var experimentPostProcessingId: UUID? = null,

    var experimentProcessingId: UUID? = null

) : BaseEntity(id) {

    fun addParameterInstances(processorParameter: ProcessorParameter, value: String): ParameterInstance {
        val parameterInstance = ParameterInstance(randomUUID(), processorParameter, this.id, value)
        this.parameterInstances.add(parameterInstance)
        return parameterInstance
    }
}


/**
 * A Parameter describes a native data type (e.g. floating number in python), with a title and descriptions.
 * To support more features, nullable and defaultValues could be provided
 */
@Entity
@Table(name = "processor_parameter")
class ProcessorParameter(
    id: UUID,
    @Column(name = "data_processor_id")
    val dataProcessorId: UUID,
    val name: String,
    @Enumerated(EnumType.STRING)
    val type: ParameterType,
    val required: Boolean = true,
    val defaultValue: String? = null,
    @Column(name = "parameter_group")
    val group: String = "",
    @Column(length = 1024)
    val description: String? = null
) : BaseEntity(id)

@Entity
@Table(name = "parameter_instance")
class ParameterInstance(
    id: UUID,
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parameter_id")
    val processorParameter: ProcessorParameter,
    @Column(name = "data_processor_instance_id")
    val dataProcessorInstanceId: UUID,
    val value: String,
    val name: String = processorParameter.name,
    val type: ParameterType = processorParameter.type
) : BaseEntity(id)

/**
 * ParameterTypes are typical simple data types.
 * Lists and Objects should be supported, but cannot be interfered in a global scope.
 */
enum class ParameterType {
    BOOLEAN,
    STRING,
    INTEGER,
    COMPLEX,
    FLOAT,
    LIST,
    TUPLE,
    DICTIONARY,
    OBJECT,
}

/**
 * DataTypes describe the Data of a MLDataProject on a higher level.
 * Some DataOperations will support Images, other just EventStreams, Arrays, Matrices or plain Numbers.
 *
 * Note: The singular/plural concept does not apply here, more the high semantic concept of the Machine Learning purpose
 *
 */
enum class DataType {
    ANY,
    NUMPY_ARRAY,
    IMAGE,
    VIDEO,
    SENSOR,
    NUMBER,
    TABULAR,
    TEXT,
    BINARY,
    MODEL,


    NONE
}
