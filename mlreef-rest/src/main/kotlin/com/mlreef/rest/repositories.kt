package com.mlreef.rest

import com.mlreef.rest.marketplace.MarketplaceEntry
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID


@Repository
interface AccountRepository : KtCrudRepository<Account, UUID> {
    fun findOneByUsername(username: String): Account?
    fun findOneByEmail(email: String): Account?

    @Query("SELECT a FROM Account a WHERE a.person.gitlabId = :gitlabId")
    fun findAccountByGitlabId(gitlabId: Long): Account?

    @Query("SELECT a FROM Account a WHERE a.person.id = :personId")
    fun findAccountByPersonId(personId: UUID): Account?
}

@Repository
interface AccountTokenRepository : ReadOnlyRepository<AccountToken, UUID> {
    fun findAllByAccountId(id: UUID): List<AccountToken>
    fun findOneByToken(token: String): AccountToken?
}

@Repository
interface SubjectRepository : KtCrudRepository<Subject, UUID>

@Repository
interface PersonRepository : KtCrudRepository<Person, UUID> {
    fun findByName(name: String): Person?
}

@Repository
interface GroupRepository : KtCrudRepository<Group, UUID> {
    fun findByGitlabId(gitlabId: Long): Group?
}

@Repository
interface MembershipRepository : KtCrudRepository<Membership, UUID> {
    fun findByGroupId(groupId: UUID): List<Membership>
    fun findByPersonId(personId: UUID): List<Membership>
    fun findByPersonIdAndGroupId(personId: UUID, groupId: UUID): Membership?
}

@Repository
interface ExperimentRepository : KtCrudRepository<Experiment, UUID> {
    fun findAllByDataProjectId(dataProjectId: UUID): List<Experiment>
    fun findOneByDataProjectIdAndSlug(dataProjectId: UUID, slug: String): Experiment?
    fun findOneByDataProjectIdAndId(dataProjectId: UUID, id: UUID): Experiment?
}

@Repository
interface DataProjectRepository : KtCrudRepository<DataProject, UUID> {
    fun findAllByOwnerId(ownerId: UUID): List<DataProject>
    fun findOneByOwnerIdAndId(ownerId: UUID, id: UUID): DataProject?
    fun findOneByOwnerIdAndSlug(ownerId: UUID, slug: String): DataProject?
    fun findByGitlabId(gitlabId: Long): DataProject?

    @Deprecated("Use findByNamespace instead")
    fun findByGitlabPathWithNamespace(pathWithNamespace: String): DataProject?
    fun findBySlug(slug: String): List<DataProject>

    @Query("SELECT p FROM DataProject p WHERE p.gitlabPathWithNamespace LIKE %:namespace%")
    fun findByNamespace(namespace: String): List<DataProject>

}

@Repository
interface PipelineConfigRepository : KtCrudRepository<PipelineConfig, UUID> {
    fun findAllByDataProjectId(dataProjectId: UUID): List<PipelineConfig>
    fun findOneByDataProjectIdAndId(dataProjectId: UUID, id: UUID): PipelineConfig?
    fun findOneByDataProjectIdAndSlug(dataProjectId: UUID, slug: String): PipelineConfig?
}

@Repository
interface PipelineInstanceRepository : KtCrudRepository<PipelineInstance, UUID> {
    fun findAllByPipelineConfigId(dataProjectId: UUID): List<PipelineInstance>
    fun findOneByPipelineConfigIdAndId(dataProjectId: UUID, id: UUID): PipelineInstance?
    fun findOneByPipelineConfigIdAndSlug(dataProjectId: UUID, slug: String): PipelineInstance?
}

@Repository
interface CodeProjectRepository : KtCrudRepository<CodeProject, UUID> {
    fun findAllByOwnerId(ownerId: UUID): List<CodeProject>
    fun findOneByOwnerIdAndId(ownerId: UUID, id: UUID): CodeProject?
    fun findByGitlabId(gitlabId: Long): CodeProject?

    @Deprecated("Use findByNamespace instead")
    fun findByGitlabPathWithNamespace(pathWithNamespace: String): CodeProject?
    fun findBySlug(slug: String): List<CodeProject>

    @Query("SELECT p FROM CodeProject p WHERE p.gitlabPathWithNamespace LIKE %:namespace%")
    fun findByNamespace(namespace: String): List<CodeProject>
}

@Repository
interface DataProcessorRepository : KtCrudRepository<DataProcessor, UUID> {
    fun findBySlug(processorSlug: String): DataProcessor?
    fun findOneByAuthorIdAndId(ownerId: UUID, id: UUID): DataProcessor?
    fun findAllByTypeAndInputDataTypeAndOutputDataType(
        type: DataProcessorType?,
        inputDataType: DataType?,
        outputDataType: DataType?): List<DataProcessor>

    fun findAllByType(type: DataProcessorType): List<DataProcessor>
    fun findAllByCodeProjectId(codeProjectId: UUID): List<DataProcessor>
}

@Repository
interface DataOperationRepository : KtCrudRepository<DataOperation, UUID>

@Repository
interface DataVisualizationRepository : KtCrudRepository<DataVisualization, UUID>

@Repository
interface DataAlgorithmRepository : KtCrudRepository<DataAlgorithm, UUID>

@Repository
interface ProcessorParameterRepository : ReadOnlyRepository<ProcessorParameter, UUID> {
    fun findByDataProcessorIdAndName(id: UUID, name: String): ProcessorParameter?
}

@Repository
interface ParameterInstanceRepository : ReadOnlyRepository<ParameterInstance, UUID>

@Repository
interface DataProcessorInstanceRepository : KtCrudRepository<DataProcessorInstance, UUID>

@Repository
interface MarketplaceEntryRepository : KtCrudRepository<MarketplaceEntry, UUID> {
    fun findBySearchableId(id: UUID): MarketplaceEntry?
    fun findBySearchableType(searchableType: SearchableType): List<MarketplaceEntry>
    fun findByGlobalSlugAndVisibilityScope(slug: String, visibilityScope: VisibilityScope): MarketplaceEntry?
    fun findAllByVisibilityScope(visibilityScope: VisibilityScope): List<MarketplaceEntry>

    @Query("select e from MarketplaceEntry e join DataProcessor dp on e.searchableId = dp.id join CodeProject cp on dp.codeProjectId = cp.id where cp.id IN :ids")
    fun findAccessibleProcessors(ids: List<UUID>): List<MarketplaceEntry>

    @Query("select e from MarketplaceEntry e join DataProject dp on e.searchableId = dp.id where dp.id IN :ids")
    fun findAccessibleDataProjects(ids: List<UUID>): List<MarketplaceEntry>

    @Query("select e from MarketplaceEntry e join DataProcessor dp on e.searchableId = dp.id join CodeProject cp on dp.codeProjectId = cp.id where cp.id IN :ids and e.globalSlug LIKE :slug")
    fun findAccessibleProcessor(ids: List<UUID>, slug: String): MarketplaceEntry?

    @Query("select e from MarketplaceEntry e join DataProject dp on e.searchableId = dp.id where dp.id IN :ids and e.globalSlug LIKE :slug")
    fun findAccessibleDataProject(ids: List<UUID>, slug: String): MarketplaceEntry?

}

@Repository
interface SearchableTagRepository : KtCrudRepository<SearchableTag, UUID> {
    fun findAllByPublicTrueOrOwnerIdIn(ids: List<UUID>): List<SearchableTag>
}
