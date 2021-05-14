package com.mlreef.rest.domain

import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Table

@Entity
@Table(name = "processor_types")
data class ProcessorType(
    override var id: UUID,
    override var name: String,
) : ListBaseClass(id, name)

@Entity
@Table(name = "data_types")
data class DataType(
    override var id: UUID,
    override var name: String,
) : ListBaseClass(id, name)

@Entity
@Table(name = "parameter_types")
data class ParameterType(
    override var id: UUID,
    override var name: String,
) : ListBaseClass(id, name)

@Entity
@Table(name = "metric_types")
data class MetricType(
    override var id: UUID,
    override var name: String,
) : ListBaseClass(id, name)

@Entity
@Table(name = "pipeline_types")
data class PipelineType(
    override var id: UUID,
    override var name: String,
) : ListBaseClass(id, name)


