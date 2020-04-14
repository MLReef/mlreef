package com.mlreef.rest

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import org.hibernate.annotations.LazyCollection
import org.hibernate.annotations.LazyCollectionOption
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.DiscriminatorColumn
import javax.persistence.Embeddable
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.Table

enum class DataProcessorType {
    ALGORITHM,
    OPERATION,
    VISUALISATION
}

enum class MetricType {
    RECALL,
    PRECISION,
    F1_SCORE,
    UNDEFINED
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
    @Enumerated(EnumType.STRING)
    @Column(name = "PROCESSOR_TYPE", insertable = false, updatable = false)
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

    @Embedded
    @Column(name = "metric_schema_")
    val metricSchema: MetricSchema,

    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : AuditEntity(id, version, createdAt, updatedAt), EPFAnnotation {

    fun isChainable(): Boolean {
        return type != DataProcessorType.ALGORITHM
    }

    abstract fun withParameters(
        parameters: List<ProcessorParameter>,
        metricSchema: MetricSchema): DataProcessor
}

@Embeddable
class MetricSchema(
    @Column(name = "metric_schema_type")
    var metricType: MetricType,
    @Column(name = "metric_schema_ground_truth")
    var groundTruth: String = "",
    @Column(name = "metric_schema_prediction")
    var prediction: String = "",
    @Column(name = "metric_schema_json_blob")
    var jsonBlob: String = ""
) : EPFAnnotation
