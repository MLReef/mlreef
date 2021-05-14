package com.mlreef.rest.domain.repositories

import com.mlreef.rest.domain.DataType
import com.mlreef.rest.domain.KtCrudRepository
import com.mlreef.rest.domain.MetricType
import com.mlreef.rest.domain.ParameterType
import com.mlreef.rest.domain.PipelineType
import com.mlreef.rest.domain.ProcessorType
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ProcessorTypeRepository : KtCrudRepository<ProcessorType, UUID> {
    fun findByNameIgnoreCase(name: String): ProcessorType?
}

@Repository
interface DataTypesRepository : KtCrudRepository<DataType, UUID> {
    fun findByNameIgnoreCase(name: String): DataType?
}

@Repository
interface ParameterTypesRepository : KtCrudRepository<ParameterType, UUID> {
    fun findByNameIgnoreCase(name: String): ParameterType?
}

@Repository
interface MetricTypesRepository : KtCrudRepository<MetricType, UUID> {
    fun findByNameIgnoreCase(name: String): MetricType?
}

@Repository
interface PipelineTypesRepository : KtCrudRepository<PipelineType, UUID> {
    fun findByNameIgnoreCase(name: String): PipelineType?
}