package com.mlreef.rest

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Embeddable
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.ForeignKey
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.Table

@Table(name = "processor_version")
@Entity
data class ProcessorVersion(
    @Id
    val id: UUID,

    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.REFRESH, CascadeType.MERGE, CascadeType.PERSIST])
    @Fetch(value = FetchMode.JOIN)
    @JoinColumn(
        name = "data_processor_id",
        referencedColumnName = "id",
        foreignKey = ForeignKey(name = "processorversion_dataprocessor_data_processor_id_fkey"))
    val dataProcessor: DataProcessor,

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "processor_version_id", foreignKey = ForeignKey(name = "processorparameter_dataprocessor_data_processor_id_fkey"))
    @Fetch(value = FetchMode.SUBSELECT)
    val parameters: List<ProcessorParameter> = listOf(),

    val number: Long,
    val branch: String = defaults.branchName(),
    val command: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "environment_id", updatable = false, insertable = false)
    val baseEnvironment: BaseEnvironments? = null,

    @Column(name = "environment_id")
    val baseEnvironmentId: UUID? = baseEnvironment?.id,

    @Column(name = "metric_schema_")
    @Embedded
    val metricSchema: MetricSchema = MetricSchema.undefined(),

    @Embedded
    val pipelineJobInfo: PipelineJobInfo? = null,

    val path: String? = null,

    val modelType: String? = null,
    val mlCategory: String? = null,

    val publishingInfo: PublishingInfo? = null,

    @Column(name = "content_sha_256")
    val contentSha256: String? = null,

    ) : EPFAnnotation

/**
 * Stores the information about publishing.
 */
@Embeddable
data class PublishingInfo(
    @Column(name = "publish_commit_sha")
    var commitSha: String? = null,

    @Column(name = "published_at")
    val publishedAt: ZonedDateTime? = null,

    @Column(name = "publish_secret")
    val secret: String? = null,

    @OneToOne(fetch = FetchType.EAGER)
    @Fetch(value = FetchMode.JOIN)
    @JoinColumn(
        name = "publisher_id",
        referencedColumnName = "id",
        foreignKey = ForeignKey(name = "processorversion_subject_publisher_id_fkey"))
    val publisher: Subject? = null,
)
