package com.mlreef.rest

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.domain.Persistable
import java.time.LocalDateTime
import java.util.*
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Embeddable
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.MappedSuperclass
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

    @Version
    var version: Long? = 0

    @CreatedDate
    @Column(name = "created_at")
    var createdAt: LocalDateTime? = null

    @LastModifiedDate
    @Column(name = "updated_at")
    var updatedAt: LocalDateTime? = null

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
        createdAt = LocalDateTime.now()
    }

    @PreUpdate
    private fun onPreUpdate() {
        updatedAt = LocalDateTime.now()
    }
}

@Table(name = "subject")
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
open class Subject(
    id: UUID,
    val slug: String,
    val name: String
) : BaseEntity(id)

@Entity
@Table(name = "person")
open class Person(
    id: UUID,
    slug: String,
    name: String,
    @OneToMany(mappedBy = "person") val memberships: List<Membership> = listOf()
) : Subject(id, slug, name)

@Entity
@Table(name = "account")
open class Account(
    id: UUID,
    val username: String,
    val email: String,
    val passwordEncrypted: String,
    @OneToOne(fetch = FetchType.EAGER) @JoinColumn(name = "person_id") val person: Person,
    @OneToMany(mappedBy = "account") val tokens: List<AccountToken> = listOf()
) : BaseEntity(id)

@Entity
@Table(name = "account_token")
open class AccountToken(
    id: UUID,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id") val account: Account,
    val token: String,
    @Column(name = "gitlab_id")
    val gitlabId: Int,
    val active: Boolean = true,
    val revoked: Boolean = false,
    @Column(name = "expires_at")
    val expiresAt: LocalDateTime? = null
) : BaseEntity(id)


@Entity
@Table(name = "group")
open class Group(
    id: UUID,
    slug: String,
    name: String,
    @OneToMany(mappedBy = "group") val memberships: List<Membership> = listOf()
) : Subject(id, slug, name)

@Entity
@Table(name = "membership")
open class Membership(
    id: UUID,
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "person_id") val person: Person,
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "group_id") val group: Group
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
    val owner: Subject?
}

/**
 * A Machine Learning Repository Project describes the association of data and experiments.
 * A repo can also be described with an DataType, for example a MLDataRepository using Images a data set
 */
@Entity
@Table(name = "data_project")
open class DataProject(
    id: UUID,
    override val slug: String,
    override val url: String,
    @ManyToOne(fetch = FetchType.LAZY, targetEntity = Subject::class) @JoinColumn(name = "owner_id") override val owner: Subject,
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "dataProject", targetEntity = Experiment::class) val experiments: List<Experiment> = listOf()
//        @ElementCollection val dataTypes: List<DataType> = listOf()
) : BaseEntity(id), MLProject

/**
 * A Code Repository is used for the working Code like Data Operations,
 * Algorithms, or soon Visualisations.
 *
 * A
 */
@Entity
@Table(name = "code_project")
open class CodeProject(
    id: UUID,
    override val slug: String,
    override val url: String,
    @ManyToOne(fetch = FetchType.LAZY, targetEntity = Subject::class) @JoinColumn(name = "owner_id") override val owner: Subject,
    @OneToOne(mappedBy = "codeProject", fetch = FetchType.LAZY) val operation: Operation? = null
) : BaseEntity(id), MLProject

/**
 * Descriptor of an Output, which could be a Gitlab Artifact, an S3 Bucket or many more.
 *
 *
 */

@Entity
@Table(name = "output_file")
open class OutputFile(
    id: UUID,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "experiment_id") val experiment: Experiment?,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "processor_id") val dataProcessor: DataProcessor?
) : BaseEntity(id)

/**
 * An Experiment is a instance of a ProcessingChain with Data
 */
@Entity
@Table(name = "experiment")
open class Experiment(
    id: UUID,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "data_project_id") val dataProject: DataProject,
    @Embedded val performanceMetrics: PerformanceMetrics? = null,
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "experiment") val outputFile: List<OutputFile> = arrayListOf(),

    /**
     * Has DataOps and DataVisuals
     */
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "experimentPreProcessing") val preProcessing: List<DataProcessorInstance> = arrayListOf(),
    /**
     * Has DataOps and maybe DataVisuals
     */
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "experimentPostProcessing") val postProcessing: List<DataProcessorInstance> = arrayListOf(),
    /**
     * Contains exactly 1 Algorithm (could be implement as DataExecutionInstance as well)
     */
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "experimentProcessing") val processing: DataProcessorInstance? = null
) : BaseEntity(id)

@Embeddable
open class PerformanceMetrics(
    val jsonBlob: String? = "",
    val startedAt: Long? = 0,
    val finishedAt: Long? = 0
)

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
abstract class DataProcessor(
    id: UUID,
    val slug: String,
    val name: String,
    val visibilityScope: VisibilityScope = VisibilityScope.default(),
    val description: String = "",
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "code_project_id") val codeProject: CodeProject? = null,
    @ManyToOne(fetch = FetchType.LAZY, targetEntity = Subject::class) @JoinColumn(name = "author_id") val author: Subject? = null,
    @OneToMany(fetch = FetchType.LAZY, targetEntity = ProcessorParameter::class, mappedBy = "dataProcessor") val parameters: List<ProcessorParameter> = listOf(),
    @OneToMany(fetch = FetchType.LAZY, targetEntity = OutputFile::class, mappedBy = "dataProcessor") val output: List<OutputFile> = listOf()
) : BaseEntity(id)

interface DataProcessorWithInput {
    val inputDataType: DataType
}

interface DataProcessorWithOutput {
    val outputDataType: DataType
}

/**
 * DataOperation perform on Data and create Data.
 * Therefore they must be chainable
 */
@Entity
@Table(name = "operation")
open class Operation(
    id: UUID,
    slug: String,
    name: String,
    override val inputDataType: DataType,
    override val outputDataType: DataType,
    visibilityScope: VisibilityScope = VisibilityScope.default()
) : DataProcessor(id, slug, name, visibilityScope), DataProcessorWithInput, DataProcessorWithOutput

@Entity
@Table(name = "visualization")
open class Visualization(
    id: UUID,
    slug: String,
    name: String,
    override val inputDataType: DataType,
    visibilityScope: VisibilityScope = VisibilityScope.default()
) : DataProcessor(id, slug, name, visibilityScope), DataProcessorWithInput

/**
 * Proposal: Model DataAlgorithm as a Data processor, even if it not chainable
 */
@Entity
@Table(name = "model")
open class Model(
    id: UUID,
    slug: String,
    name: String,
    override val outputDataType: DataType,
    visibilityScope: VisibilityScope = VisibilityScope.default()

) : DataProcessor(id, slug, name, visibilityScope), DataProcessorWithOutput

/**
 * An Instance of DataOperation or DataVisualisation contains instantiated values of Parameters
 */
@Entity
@Table(name = "data_processor_instance")
open class DataProcessorInstance(
    id: UUID,
    @OneToMany(targetEntity = ParameterInstance::class, fetch = FetchType.EAGER, mappedBy = "dataProcessorInstance", cascade = [CascadeType.REMOVE]) val parameterInstances: List<ParameterInstance>,
    @ManyToOne(targetEntity = DataProcessorInstance::class, fetch = FetchType.LAZY) @JoinColumn(name = "parent_id") val parent: DataProcessorInstance?,
    @OneToMany(targetEntity = DataProcessorInstance::class, fetch = FetchType.LAZY, mappedBy = "parent") val children: List<DataProcessorInstance>,
    @ManyToOne(targetEntity = Experiment::class, fetch = FetchType.LAZY) @JoinColumn(name = "experiment_preprocessing_id") val experimentPreProcessing: Experiment?,
    @ManyToOne(targetEntity = Experiment::class, fetch = FetchType.LAZY) @JoinColumn(name = "experiment_postprocessing_id") val experimentPostProcessing: Experiment?,
    @OneToOne(targetEntity = Experiment::class, fetch = FetchType.LAZY) @JoinColumn(name = "experiment_processing_id") val experimentProcessing: Experiment?
) : BaseEntity(id)


/**
 * A Parameter describes a native data type (e.g. floating number in python), with a title and descriptions.
 * To support more features, nullable and defaultValues could be provided
 */
@Entity
@Table(name = "processor_parameter")
open class ProcessorParameter(
    id: UUID,
    @ManyToOne(fetch = FetchType.LAZY, targetEntity = DataProcessor::class) @JoinColumn(name = "data_processor_id") val dataProcessor: DataProcessor,
    val name: String,
    val type: ParameterType,
    val description: String? = null,
    val nullable: Boolean = false,
    val defaultValue: String? = null
) : BaseEntity(id)

@Entity
@Table(name = "parameter_instance")
open class ParameterInstance(
    id: UUID,
    @OneToOne(fetch = FetchType.EAGER) @JoinColumn(name = "parameter_id") val processorParameter: ProcessorParameter? = null,
    @ManyToOne @JoinColumn(name = "data_processor_instance_id") val dataProcessorInstance: DataProcessorInstance? = null,
    val value: String? = null
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
    MODEL
}
