package com.mlreef.rest

import org.springframework.stereotype.Repository
import java.util.*


@Repository interface AccountRepository : KtCrudRepository<Account, UUID> {
    fun findOneByUsername(username: String): Account?
    fun findOneByEmail(email: String): Account?
}

@Repository interface AccountTokenRepository : KtCrudRepository<AccountToken, UUID> {
    fun findAllByAccountId(id: UUID): List<AccountToken>
    fun findOneByToken(token:String): AccountToken?
}

@Repository interface SubjectRepository : KtCrudRepository<Subject, UUID>

@Repository interface PersonRepository : KtCrudRepository<Person, UUID>

@Repository interface GroupRepository : KtCrudRepository<Group, UUID>

@Repository interface ExperimentRepository : KtCrudRepository<Experiment, UUID> {
    fun findAllByDataProjectId(dataProjectId: UUID): List<Experiment>
    fun findOneByDataProjectIdAndId(dataProjectId: UUID, id: UUID): Experiment?
}

@Repository interface DataProjectRepository : KtCrudRepository<DataProject, UUID> {
    fun findAllByOwnerId(ownerId: UUID): List<DataProject>
    fun findOneByOwnerIdAndId(ownerId: UUID, id: UUID): DataProject?
    fun findOneByOwnerIdAndSlug(ownerId: UUID, slug: String): DataProject?
}

@Repository interface CodeProjectRepository : KtCrudRepository<CodeProject, UUID> {
    fun findAllByOwnerId(ownerId: UUID): List<CodeProject>
    fun findOneByOwnerIdAndId(ownerId: UUID, id: UUID): CodeProject?
}

@Repository interface OutputFileRepository : KtCrudRepository<OutputFile, UUID>

@Repository interface DataProcessorRepository : KtCrudRepository<DataProcessor, UUID> {
    fun findBySlug(processorSlug: String): DataProcessor?
}

@Repository interface DataOperationRepository : KtCrudRepository<DataOperation, UUID>

@Repository interface DataVisualizationRepository : KtCrudRepository<DataVisualization, UUID>

@Repository interface DataAlgorithmRepository : KtCrudRepository<DataAlgorithm, UUID>

@Repository interface ProcessorParameterRepository : KtCrudRepository<ProcessorParameter, UUID> {
    fun findByDataProcessorIdAndName(id: UUID, name: String): ProcessorParameter?
}

@Repository interface ParameterInstanceRepository : KtCrudRepository<ParameterInstance, UUID>
@Repository interface DataProcessorInstanceRepository : KtCrudRepository<DataProcessorInstance, UUID>
