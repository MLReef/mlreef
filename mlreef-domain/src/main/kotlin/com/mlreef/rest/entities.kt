@file:Suppress("JpaObjectClassSignatureInspection", "JpaDataSourceORMInspection")

package com.mlreef.rest

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import org.hibernate.annotations.LazyCollection
import org.hibernate.annotations.LazyCollectionOption
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.domain.Persistable
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
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.PrePersist
import javax.persistence.PreUpdate
import javax.persistence.Table
import javax.persistence.UniqueConstraint
import javax.persistence.Version

@MappedSuperclass
abstract class AuditEntity(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    private val id: UUID,
    copyVersion: Long?,
    copyCreatedAt: ZonedDateTime?,
    copyUpdatedAt: ZonedDateTime?
) : Persistable<UUID> {

    @Version var version: Long? = copyVersion

    @CreatedDate
    @Column(name = "created_at")
    var createdAt: ZonedDateTime? = copyCreatedAt

    @LastModifiedDate
    @Column(name = "updated_at")
    var updatedAt: ZonedDateTime? = copyUpdatedAt

    override fun getId(): UUID = id
    override fun isNew(): Boolean = createdAt == null
    override fun hashCode(): Int = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is AuditEntity -> false
            else -> getId() == other.getId()
        }
    }

    @PrePersist
    private fun onPrePersist() = handleSaveUpdate()

    @PreUpdate
    private fun onPreUpdate() = handleSaveUpdate()

    private fun handleSaveUpdate() {
        if (createdAt == null) {
            createdAt = I18N.dateTime()
        } else {
            updatedAt = I18N.dateTime()
        }
        version = (version ?: -1) + 1
    }
}


/**
@Id @Column(name = "id", length = 16, unique = true, nullable = false) val@Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,
.... own properties
// Auditing
@Version val version: Long? = null,
@CreatedDate @Column(name = "created_at", nullable = false, updatable = false)
createdAt: ZonedDateTime = I18N.dateTime(),
@LastModifiedDate @Column(name = "updated_at")
val updatedAt: ZonedDateTime? = null
 */

@Table(name = "subject")
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
abstract class Subject(
    id: UUID,
    val slug: String,
    val name: String,
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : AuditEntity(id, version, createdAt, updatedAt)

@Entity
@Table(name = "membership")
class Membership(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,
    @Column(name = "person_id")
    val personId: UUID,
    @Column(name = "group_id")
    val groupId: UUID
)

@Entity
class Person(
    id: UUID,
    override val slug: String,
    override val name: String,
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.REMOVE])
    @JoinColumn(name = "person_id")
    @Fetch(value = FetchMode.SUBSELECT)
//    @LazyCollection(LazyCollectionOption.FALSE)
    val memberships: List<Membership> = listOf(),
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : Subject(id, slug, name, version, createdAt, updatedAt) {
    fun copy(
        slug: String? = null,
        name: String? = null,
        memberships: List<Membership>? = null
    ): Person = Person(
        id = this.id,
        slug = slug ?: this.slug,
        name = name ?: this.name,
        memberships = memberships ?: this.memberships,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

@Entity
class Group(
    id: UUID,
    override val slug: String,
    override val name: String,
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.REMOVE])
    @JoinColumn(name = "group_id")
    @Fetch(value = FetchMode.SUBSELECT)
//    @LazyCollection(LazyCollectionOption.FALSE)
    val members: List<Membership> = listOf(),
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : Subject(id, slug, name, version, createdAt, updatedAt) {
    fun copy(
        slug: String? = null,
        name: String? = null,
        members: List<Membership>? = null
    ): Group = Group(
        id = this.id,
        slug = slug ?: this.slug,
        name = name ?: this.name,
        members = members ?: this.members,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

@Entity
@Table(name = "account")
class Account(
    id: UUID,
    val username: String,
    val email: String,
    val passwordEncrypted: String,
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH])
    @JoinColumn(name = "person_id")
    val person: Person,
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "account_id")
    val tokens: MutableList<AccountToken> = arrayListOf(),
    @Column(name = "gitlab_id")
    val gitlabId: Int? = null,
    val lastLogin: ZonedDateTime? = null,
    // Auditing
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : AuditEntity(id, version, createdAt, updatedAt) {
    fun copy(
        id: UUID? = null,
        username: String? = null,
        email: String? = null,
        passwordEncrypted: String? = null,
        person: Person? = null,
        tokens: MutableList<AccountToken>? = null,
        gitlabId: Int? = null,
        lastLogin: ZonedDateTime? = null
    ): Account = Account(
        id = this.id,
        username = username ?: this.username,
        email = email ?: this.email,
        passwordEncrypted = passwordEncrypted ?: this.passwordEncrypted,
        person = person ?: this.person,
        gitlabId = gitlabId ?: this.gitlabId,
        lastLogin = lastLogin ?: this.lastLogin,
        tokens = tokens ?: this.tokens,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

@Entity
@Table(
    name = "account_token",
    uniqueConstraints = [UniqueConstraint(name = "unique-token", columnNames = ["token", "active"])])
data class AccountToken(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,
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
)


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
    val name: String
    val ownerId: UUID
    val gitlabGroup: String
    val gitlabProject: String
    val gitlabId: Int
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
    override val name: String,

    @Column(name = "owner_id")
    override val ownerId: UUID,

    @Column(name = "gitlab_group")
    override val gitlabGroup: String,

    @Column(name = "gitlab_project")
    override val gitlabProject: String,

    @Column(name = "gitlab_id")
    override val gitlabId: Int,

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinColumn(name = "data_project_id")
    val experiments: List<Experiment> = listOf(),

    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : AuditEntity(id, version, createdAt, updatedAt), MLProject {

    fun copy(
        url: String? = null,
        slug: String? = null,
        name: String? = null,
        gitlabGroup: String? = null,
        gitlabProject: String? = null,
        gitlabId: Int? = null,
        experiments: List<Experiment>? = null,
        version: Long? = null,
        createdAt: ZonedDateTime? = null,
        updatedAt: ZonedDateTime? = null
    ): DataProject {
        return DataProject(
            id = this.id,
            slug = slug ?: this.slug,
            url = url ?: this.url,
            name = name ?: this.name,
            ownerId = this.ownerId,
            gitlabGroup = gitlabGroup ?: this.gitlabGroup,
            gitlabProject = gitlabProject ?: this.gitlabProject,
            gitlabId = gitlabId ?: this.gitlabId,
            experiments = this.experiments,
            version = version ?: this.version,
            createdAt = createdAt ?: this.createdAt,
            updatedAt = updatedAt ?: this.updatedAt
        )
    }
}

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
    override val name: String,
    @Column(name = "owner_id")
    override val ownerId: UUID,

    @Column(name = "gitlab_group")
    override val gitlabGroup: String,

    @Column(name = "gitlab_project")
    override val gitlabProject: String,

    @Column(name = "gitlab_id")
    override val gitlabId: Int,

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "code_project_id")
    val dataProcessor: DataProcessor? = null,

    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null

) : AuditEntity(id, version, createdAt, updatedAt), MLProject {
    fun copy(
        url: String? = null,
        slug: String? = null,
        name: String? = null,
        gitlabGroup: String? = null,
        gitlabProject: String? = null,
        gitlabId: Int? = null,
        dataProcessor: DataProcessor? = null,
        version: Long? = null,
        createdAt: ZonedDateTime? = null,
        updatedAt: ZonedDateTime? = null
    ): CodeProject {
        return CodeProject(
            id = this.id,
            slug = slug ?: this.slug,
            url = url ?: this.url,
            name = name ?: this.name,
            ownerId = this.ownerId,
            gitlabGroup = gitlabGroup ?: this.gitlabGroup,
            gitlabProject = gitlabProject ?: this.gitlabProject,
            gitlabId = gitlabId ?: this.gitlabId,
            dataProcessor = dataProcessor ?: this.dataProcessor,
            version = version ?: this.version,
            createdAt = createdAt ?: this.createdAt,
            updatedAt = updatedAt ?: this.updatedAt
        )
    }
}

/**
 * Descriptor of an Output, which could be a Gitlab Artifact, an S3 Bucket or many more.
 *
 *
 */

@Entity
@Table(name = "output_file")
class OutputFile(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,

    @Column(name = "experiment_id")
    val experimentId: UUID?,

    @Column(name = "data_processor_id")
    val dataProcessorId: UUID?
)

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
data class Experiment(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,
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

) {

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

    fun smartCopy(
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
@DiscriminatorColumn(name = "PROCESSOR_TYPE")
abstract class DataProcessor(
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
    val visibilityScope: VisibilityScope,
    @Column(length = 1024)
    val description: String,

    @Column(name = "code_project_id")
    val codeProjectId: UUID?,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id")
    val author: Subject?,

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "data_processor_id")
    @Fetch(value = FetchMode.SUBSELECT)
    val parameters: List<ProcessorParameter>,

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "data_processor_id")
    @Fetch(value = FetchMode.SUBSELECT)
    @LazyCollection(LazyCollectionOption.FALSE)
    val outputFiles: List<OutputFile>,

    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : AuditEntity(id, version, createdAt, updatedAt) {


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
    parameters: List<ProcessorParameter> = listOf(),
    outputFiles: List<OutputFile> = listOf(),
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : DataProcessor(id, slug, name, command, inputDataType, outputDataType, DataProcessorType.OPERATION,
    visibilityScope, description, codeProjectId, author, parameters, outputFiles, version, createdAt, updatedAt) {

    override fun isChainable(): Boolean = true

    fun copy(
        slug: String? = null,
        name: String? = null,
        command: String? = null,
        inputDataType: DataType? = null,
        outputDataType: DataType? = null,
        visibilityScope: VisibilityScope? = null,
        description: String? = null,
        author: Subject? = null,
        outputFiles: List<OutputFile>? = null

    ): DataOperation = DataOperation(
        slug = slug ?: this.slug,
        name = name ?: this.name,
        command = command ?: this.command,
        inputDataType = inputDataType ?: this.inputDataType,
        outputDataType = outputDataType ?: this.outputDataType,
        visibilityScope = visibilityScope ?: this.visibilityScope,
        description = description ?: this.description,
        author = author ?: this.author,
        outputFiles = outputFiles ?: this.outputFiles,
        id = id,
        codeProjectId = codeProjectId ?: this.codeProjectId,
        parameters = parameters,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
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
    parameters: List<ProcessorParameter> = listOf(),
    outputFiles: List<OutputFile> = listOf(),
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : DataProcessor(id, slug, name, command, inputDataType, DataType.NONE, DataProcessorType.VISUALISATION,
    visibilityScope, description, codeProjectId, author, parameters, outputFiles, version, createdAt, updatedAt) {

    override fun isChainable(): Boolean = true

//    override fun equals(other: Any?): Boolean {
//        if (other === this) return true
//        if (other !is DataVisualization) return false
//        return this.id == other.id
//    }
//
//    override fun hashCode(): Int {
//        return super.hashCode()
//    }

    fun copy(
        slug: String? = null,
        name: String? = null,
        command: String? = null,
        inputDataType: DataType? = null,
        outputDataType: DataType? = null,
        visibilityScope: VisibilityScope? = null,
        description: String? = null,
        author: Subject? = null,
        outputFiles: List<OutputFile>? = null
    ): DataVisualization = DataVisualization(
        slug = slug ?: this.slug,
        name = name ?: this.name,
        command = command ?: this.command,
        inputDataType = inputDataType ?: this.inputDataType,
        visibilityScope = visibilityScope ?: this.visibilityScope,
        description = description ?: this.description,
        author = author ?: this.author,
        outputFiles = outputFiles ?: this.outputFiles,
        id = id,
        codeProjectId = codeProjectId ?: this.codeProjectId,
        parameters = parameters,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

/**
 * Proposal: Model DataAlgorithm as a Data processor, even if it not chainable
 */
@Entity
@DiscriminatorValue("ALGORITHM")
class DataAlgorithm(
    id: UUID,
    override val slug: String,
    override val name: String,
    override val command: String,
    override val inputDataType: DataType,
    override val outputDataType: DataType,
    override val visibilityScope: VisibilityScope = VisibilityScope.default(),
    override val description: String = "",
    override val author: Subject? = null,
    override val codeProjectId: UUID? = null,
    override val parameters: List<ProcessorParameter> = listOf(),
    override val outputFiles: List<OutputFile> = listOf(),
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : DataProcessor(id, slug, name, command, inputDataType, outputDataType, DataProcessorType.ALGORITHM,
    visibilityScope, description, codeProjectId, author, parameters, outputFiles, version, createdAt, updatedAt) {

    override fun isChainable(): Boolean = false

    fun copy(
        slug: String? = null,
        name: String? = null,
        command: String? = null,
        inputDataType: DataType? = null,
        outputDataType: DataType? = null,
        visibilityScope: VisibilityScope? = null,
        description: String? = null,
        author: Subject? = null,
        outputFiles: List<OutputFile>? = null

    ): DataAlgorithm = DataAlgorithm(
        slug = slug ?: this.slug,
        name = name ?: this.name,
        command = command ?: this.command,
        inputDataType = inputDataType ?: this.inputDataType,
        outputDataType = outputDataType ?: this.outputDataType,
        visibilityScope = visibilityScope ?: this.visibilityScope,
        description = description ?: this.description,
        author = author ?: this.author,
        outputFiles = outputFiles ?: this.outputFiles,
        id = id,
        codeProjectId = codeProjectId ?: this.codeProjectId,
        parameters = parameters,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

/**
 * An Instance of DataOperation or DataVisualisation contains instantiated values of Parameters
 */
@Entity
@Table(name = "data_processor_instance")
data class DataProcessorInstance(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,

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

) {

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
data class ProcessorParameter(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,
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
)

@Entity
@Table(name = "parameter_instance")
data class ParameterInstance(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parameter_id")
    val processorParameter: ProcessorParameter,
    @Column(name = "data_processor_instance_id")
    val dataProcessorInstanceId: UUID,
    val value: String,
    val name: String = processorParameter.name,
    val type: ParameterType = processorParameter.type
)

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
