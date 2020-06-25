package com.mlreef.rest

import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID


@Repository
interface AccountRepository : KtCrudRepository<Account, UUID> {
    fun findOneByUsername(username: String): Account?
    fun findOneByEmail(email: String): Account?
    fun findByChangeAccountToken(token: String): Account?

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

interface ProjectRepositoryCustom {
    fun <T : Project> findAccessible(
        clazz: Class<T>,
        pageable: Pageable,
        ids: List<UUID>?,
        slugs: List<String>? = null,
        searchableType: SearchableType,
        inputDataTypes: List<DataType>? = null,
        outputDataTypes: List<DataType>? = null,
        tags: List<SearchableTag>? = null
    ): List<Project>
}

@Repository
interface ProjectRepository : KtCrudRepository<Project, UUID>, ProjectRepositoryCustom {
    fun findByGlobalSlugAndVisibilityScope(slug: String, visibilityScope: VisibilityScope): Project?

    fun findAllByVisibilityScope(visibilityScope: VisibilityScope, pageable: Pageable): List<Project>

//    @Query("select e from Project e join DataProcessor dp on e.id = dp.codeProjectId join CodeProject cp on dp.codeProjectId = cp.id where cp.id IN :ids")
//    fun findAccessibleProcessors(ids: List<UUID>, pageable: Pageable): List<Project>

    @Query("select e from Project e where e.id IN :ids")
    fun findAccessibleProjects(ids: List<UUID>, pageable: Pageable): List<Project>

//    @Query("select e from Project e join DataProcessor dp on e.id = dp.codeProjectId join CodeProject cp on dp.codeProjectId = cp.id where cp.id IN :ids and e.globalSlug LIKE :slug")
//    fun findAccessibleProcessor(ids: List<UUID>, slug: String): Project?

    @Query("select e from Project e  where e.id IN :ids and e.globalSlug LIKE :slug")
    fun findAccessibleProject(ids: List<UUID>, slug: String): Project?

//    @Modifying()
//    @Query("UPDATE mlreef_project SET document = to_tsvector(name || '. ' || description) WHERE id = :id", nativeQuery = true)
//    fun updateFulltext(id: UUID)

    /**
     * Requires the "update_fts_document" PSQL TRIGGER and "project_fts_index" gin index
     *
     * Currently Fulltext search is implemented via psql and _relies_ on that, be aware of that when you change DB!
     */
    @Query(value = "SELECT CAST(id as TEXT) as id, CAST(ts_rank(document, to_tsquery('english', :query)) as FLOAT) as rank FROM marketplace_entry WHERE id in :ids ORDER BY rank DESC", nativeQuery = true)
    fun fulltextSearch(query: String, ids: Set<UUID>): List<IdRankInterface>

    interface IdRankInterface {
        val id: String
        val rank: Double
    }
}

@Repository
interface SearchableTagRepository : KtCrudRepository<SearchableTag, UUID> {
    fun findAllByPublicTrueOrOwnerIdIn(ids: List<UUID>): List<SearchableTag>

    //    fun findAllByPublicTrueAndNameEquals(name: String): List<SearchableTag>
    fun findAllByPublicTrueAndNameIsIn(names: List<String>): List<SearchableTag>
}

@Repository
interface EmailRepository : KtCrudRepository<Email, UUID>
