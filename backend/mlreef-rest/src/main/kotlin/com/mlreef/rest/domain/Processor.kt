package com.mlreef.rest.domain

import com.mlreef.rest.domain.converters.PairListConverter
import com.mlreef.rest.utils.Slugs
import java.time.Instant
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Convert
import javax.persistence.Embeddable
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.PrePersist
import javax.persistence.PreUpdate
import javax.persistence.Table
import javax.persistence.Transient
import javax.persistence.UniqueConstraint
import kotlin.math.absoluteValue
import kotlin.random.Random


@Entity
@Table(
    name = "processors", uniqueConstraints = [
        UniqueConstraint(columnNames = ["code_project_id", "branch", "version"])
    ]
)
data class Processor(
    @Id
    val id: UUID,

    //We use nullable=false with Kotlin nullable type together to be able to create the entity uninitialized and fill data after creation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "code_project_id", nullable = false)
    var codeProject: CodeProject? = null,

    @Column(name = "main_script_path", nullable = false)
    var mainScriptPath: String? = null,

    @Column(name = "requirements_file_path")
    var requirementsFilePath: String? = null,

    var name: String? = null,
    var slug: String? = null,
    var description: String? = null,
    var branch: String = "master",
    var version: String? = null,
    var commitSha: String? = null,
    var secret: String? = null,

    @Column(name = "content_sha_256")
    var contentSha256: String? = null,

    @Column(name = "published_at", nullable = false)
    var publishedAt: Instant? = null,
    var jobStartedAt: Instant? = null,
    var jobFinishedAt: Instant? = null,

    @Enumerated(EnumType.STRING)
    var status: PublishStatus = PublishStatus.PUBLISH_CREATED,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "published_by")
    var publisher: Account? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "environment_id")
    var baseEnvironment: BaseEnvironments? = null,

    @OneToMany(
        mappedBy = "processor",
        fetch = FetchType.EAGER
    ) //, cascade = [CascadeType.PERSIST]) //NEVER!!! cascade it. Because of Stupid hibernate
    val parameters: MutableSet<Parameter> = mutableSetOf(),

    @OneToMany(mappedBy = "processor", fetch = FetchType.EAGER) //PipelineConfiguration is responsible for cascade
    val instances: MutableSet<ProcessorInstance> = mutableSetOf(),

    @Column(name = "metric_schema_")
    @Embedded
    var metricSchema: MetricsSchema? = null,

    @Convert(converter = PairListConverter::class)
    var log: MutableList<Pair<String, String>> = mutableListOf(),

    var imageName: String? = null,

    val termsAcceptedById: UUID? = null,
    val termsAcceptedAt: Instant? = null,
    val licenceName: String? = null,
    val licenceText: String? = null,

    var gitlabPipelineId: Long? = null,

//    @Version
    var updatedTimes: Int = 0,

    var republish: Boolean = false,
) : EPFAnnotation {
    val type: ProcessorType?
        @Transient get() = this.codeProject?.processorType



    fun addInstance(
        slug: String? = null,
        name: String? = null,
        pipelineConfiguration: PipelineConfiguration? = null
    ): ProcessorInstance {
        val processorInstance = ProcessorInstance(
            UUID.randomUUID(),
            this,
            slug = slug ?: this.slug,
            name = name ?: this.name,
            pipelineConfiguration = pipelineConfiguration
        )
        this.instances.add(processorInstance)
        pipelineConfiguration?.processorInstances?.add(processorInstance)
        return processorInstance
    }

    fun addParameter(
        name: String? = null,
        type: ParameterType? = null,
        defaultValue: String? = null,
        description: String? = null,
        order: Int? = null,
        required: Boolean? = null,
    ): Parameter {
        val processorParameter = Parameter(
            id = UUID.randomUUID(),
            processor = this,
            name = name ?: "param${Random.nextLong().absoluteValue}",
            parameterType = type,
            defaultValue = defaultValue ?: "",
            description = description,
            order = order ?: this.parameters.size + 1,
            required = required ?: true
        )
        this.parameters.add(processorParameter)
        return processorParameter
    }

    override fun hashCode() = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is Processor -> false
            else -> this.id == other.id
        }
    }

    override fun toString(): String {
        return "Processor(id=$id, codeProject=${codeProject?.id}, mainScriptPath=$mainScriptPath, name=$name, slug=$slug, description=$description, branch='$branch', version=$version, commitSha=$commitSha, secret=$secret, contentSha256=$contentSha256, publishedAt=$publishedAt, jobStartedAt=$jobStartedAt, jobFinishedAt=$jobFinishedAt, status=$status, publisher=$publisher, baseEnvironment=$baseEnvironment, parameters=${
            parameters.map { it.id }.joinToString("; ")
        }}, instances=${
            instances.map { it.id }.joinToString("; ")
        }}, metricSchema=$metricSchema, log=$log, imageName=$imageName, termsAcceptedById=$termsAcceptedById, termsAcceptedAt=$termsAcceptedAt, licenceName=$licenceName, licenceText=$licenceText)"
    }

    @PrePersist
    fun prePersist() {
        this.name = if (this.name != null) this.name else "${this.codeProject?.name}-processor-$version"
        this.slug = if (this.slug != null) this.slug else Slugs.toSlug("${this.codeProject?.slug}-processor-$branch-$version")
        updatedTimes += 1
    }

    @PreUpdate
    private fun onPreUpdate() {
        updatedTimes += 1
    }

    fun addLog(logMessage: String) {
        this.log.add(Instant.now().toString() to logMessage)
    }
}

@Embeddable
class MetricsSchema(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metric_schema_type_id")
    var metricType: MetricType,
    @Column(name = "metric_schema_ground_truth")
    var groundTruth: String = "",
    @Column(name = "metric_schema_prediction")
    var prediction: String = "",
    @Column(name = "metric_schema_json_blob")
    var jsonBlob: String = "",
) : EPFAnnotation