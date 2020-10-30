package com.mlreef.rest

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.ForeignKey
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.Table

@Table(name = "processor_version")
@Entity
data class ProcessorVersion(
    @Id
    val id: UUID,

    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.REFRESH])
    @Fetch(value = FetchMode.JOIN)
    @JoinColumn(
        name = "data_processor_id",
        referencedColumnName = "id",
        foreignKey = ForeignKey(name = "processorversion_dataprocessor_data_processor_id_fkey"))
    val dataProcessor: DataProcessor,

    @OneToOne(fetch = FetchType.EAGER)
    @Fetch(value = FetchMode.JOIN)
    @JoinColumn(
        name = "publisher_id",
        referencedColumnName = "id",
        foreignKey = ForeignKey(name = "processorversion_subject_publisher_id_fkey"))
    val publisher: Subject?,

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "processor_version_id", foreignKey = ForeignKey(name = "processorparameter_dataprocessor_data_processor_id_fkey"))
    @Fetch(value = FetchMode.SUBSELECT)
    val parameters: List<ProcessorParameter> = listOf(),

    val number: Long,
    val branch: String = defaults.branchName(),
    val command: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "base_environment")
    val baseEnvironment: BaseEnvironment = BaseEnvironment.default(),

    @Column(name = "metric_schema_")
    @Embedded
    val metricSchema: MetricSchema = MetricSchema.undefined(),

    @Embedded
    val pipelineJobInfo: PipelineJobInfo? = null,

    @Column(name = "published_at")
    val publishedAt: ZonedDateTime = ZonedDateTime.now(),

    val gitlabPath: String? = null,

    ) : EPFAnnotation