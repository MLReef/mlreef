@file:Suppress("SqlResolve")

package com.mlreef.rest

import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
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
interface SubjectRepository : KtCrudRepository<Subject, UUID> {
    fun findByGitlabId(gitlabId: Long): Subject?
    fun findBySlug(path: String): Subject?
}

@Repository
interface PersonRepository : KtCrudRepository<Person, UUID> {
    //FIXME dangerous!! Multiple names should be ok!
    fun findByName(name: String): Person?
    fun findByGitlabId(gitlabId: Long): Person?

}

@Repository
interface GroupRepository : KtCrudRepository<Group, UUID> {
    fun findByGitlabId(gitlabId: Long): Group?
    fun findAllBySlug(slug: String): List<Group>
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
    fun findOneByDataProjectIdAndNumber(dataProjectId: UUID, number: Int): Experiment?
    fun countByDataProjectId(dataProjectId: UUID): Int

    @Query("SELECT max(e.number) FROM Experiment e WHERE e.dataProjectId = :dataProjectId")
    fun maxNumberByDataProjectId(dataProjectId: UUID): Int?
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
interface ProcessorVersionRepository : KtCrudRepository<ProcessorVersion, UUID> {
    @Query("SELECT v FROM ProcessorVersion v WHERE v.dataProcessor.slug LIKE %:processorSlug% ORDER BY v.number DESC ")
    fun findAllBySlug(processorSlug: String): List<ProcessorVersion>

    @Query("SELECT v FROM ProcessorVersion v WHERE v.dataProcessor.id = :id ORDER BY v.number DESC ")
    fun findAllByDataProcessorId(id: UUID): List<ProcessorVersion>

    @Query("SELECT v FROM ProcessorVersion v WHERE v.dataProcessor.slug LIKE %:processorSlug% ORDER BY v.number DESC ")
    fun findAllBySlug(processorSlug: String, pageable: Pageable): List<ProcessorVersion>

    @Query("SELECT v FROM ProcessorVersion v WHERE v.dataProcessor.slug LIKE %:processorSlug% AND v.branch LIKE %:branch% ORDER BY v.number DESC nulls first ")
    fun findBySlugAndBranch(processorSlug: String, branch: String, pageable: Pageable): List<ProcessorVersion>
}

@Repository
interface DataOperationRepository : KtCrudRepository<DataOperation, UUID>

@Repository
interface DataVisualizationRepository : KtCrudRepository<DataVisualization, UUID>

@Repository
interface DataAlgorithmRepository : KtCrudRepository<DataAlgorithm, UUID>

@Repository
interface ProcessorParameterRepository : ReadOnlyRepository<ProcessorParameter, UUID> {
    fun findByProcessorVersionIdAndName(id: UUID, name: String): ProcessorParameter?
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
        tags: List<SearchableTag>? = null,
        minStars: Int? = null,
        maxStars: Int? = null
    ): List<Project>
}

@Repository
interface ProjectBaseRepository<T : Project> : CrudRepository<T, UUID> {
    fun findByGlobalSlugAndVisibilityScope(slug: String, visibilityScope: VisibilityScope): T?
//    fun findAllByVisibilityScope(visibilityScope: VisibilityScope, pageable: Pageable): List<T>
    fun findAllByOwnerId(ownerId: UUID, pageable: Pageable?): Page<T>
    fun findOneByOwnerIdAndSlug(ownerId: UUID, slug: String): T?
    fun findAllByOwnerIdAndType(ownerId: UUID, type: ProjectType, pageable: Pageable?): Page<T>

    @Query("select p from Project p WHERE p.ownerId=:ownerId OR p.visibilityScope=:scope OR p.id in :projectIds")
    fun findAccessibleProjectsForOwner(ownerId: UUID, projectIds:List<UUID>, pageable: Pageable?, scope: VisibilityScope = VisibilityScope.PUBLIC): Page<T>

    @Query("select p from Project p WHERE p.type='DATA_PROJECT' AND (p.ownerId=:ownerId OR p.visibilityScope=:scope OR p.id in :projectIds)")
    fun findAccessibleDataProjectsForOwner(ownerId: UUID, projectIds:List<UUID>, pageable: Pageable?, scope: VisibilityScope = VisibilityScope.PUBLIC): Page<T>

    @Query("select p from Project p WHERE p.visibilityScope=:scope")
    fun findAccessibleProjectsForVisitor(pageable: Pageable?, scope: VisibilityScope = VisibilityScope.PUBLIC): Page<T>

    @Query("select p from Project p WHERE p.type='DATA_PROJECT' AND p.visibilityScope=:scope")
    fun findAccessibleDataProjectsForVisitor(pageable: Pageable?, scope: VisibilityScope = VisibilityScope.PUBLIC): Page<T>

    @Query("select p from Project p JOIN Star s on s.projectId = p.id where (p.ownerId=:ownerId or p.visibilityScope=:scope OR p.id IN :ids) AND s.subjectId = :ownerId")
    fun findAccessibleStarredProjectsForUser(ownerId: UUID, ids: List<UUID>, pageable: Pageable?, scope: VisibilityScope = VisibilityScope.PUBLIC): Page<T>

    fun findAllByIdIn(ids: Iterable<UUID>, pageable: Pageable?): Page<T>

    fun findAllByVisibilityScope(visibilityScope: VisibilityScope = VisibilityScope.PUBLIC, pageable: Pageable? = null): Page<T>

    @Query("select e from Project e JOIN Star s on s.projectId = e.id where e.id IN :ids AND s.subjectId = :ownerId")
    fun findAccessibleStarredProjects(ownerId: UUID, ids: List<UUID>, pageable: Pageable): List<T>

    fun findByGitlabId(gitlabId: Long): T?

    @Query("SELECT p FROM Project p WHERE p.gitlabPathWithNamespace LIKE %:namespace%")
    fun findByNamespace(namespace: String): List<T>

    @Query("SELECT p FROM Project p WHERE p.gitlabPathWithNamespace LIKE %:namespace%")
    fun findByNamespaceLike(namespace: String, pageable: Pageable?): Page<T>

    @Query("SELECT p FROM Project p WHERE p.gitlabNamespace LIKE %:namespace% AND (p.gitlabPath LIKE %:path% OR p.slug LIKE %:path%)")
    fun findByNamespaceAndPath(namespace: String, path: String): T?

    fun findBySlug(slug: String, pageable: Pageable?): Page<T>

    @Query("SELECT p FROM Project p WHERE p.gitlabNamespace LIKE %:namespace% AND p.slug LIKE %:slug%")
    fun findNamespaceAndSlug(namespace: String, slug: String): T?
}

@Repository
interface ProjectRepository : ProjectBaseRepository<Project>, ProjectRepositoryCustom {

    @Query("select e from Project e where e.id IN :ids")
    fun findAccessibleProjects(ids: List<UUID>, pageable: Pageable): List<Project>

    @Query("select e from Project e where e.id IN :ids and e.globalSlug LIKE :slug")
    fun findAccessibleProject(ids: List<UUID>, slug: String): Project?

    @Query("SELECT p FROM Project p WHERE p.gitlabPathWithNamespace LIKE %:namespace%")
    override fun findByNamespace(namespace: String): List<Project>

    @Query("SELECT p FROM Project p WHERE p.gitlabNamespace LIKE %:namespace% AND (p.gitlabPath LIKE %:path% OR p.slug LIKE %:path%)")
    override fun findByNamespaceAndPath(namespace: String, path: String): Project?

    /**
     * Requires the "update_fts_document" PSQL TRIGGER and "project_fts_index" gin index
     *
     * Currently Fulltext search is implemented via psql and _relies_ on that, be aware of that when you change DB!
     */
    @Query(value = "SELECT CAST(id as TEXT) as id, CAST(coalesce(ts_rank(document, to_tsquery('english', :query)),0.0) as FLOAT) as rank FROM mlreef_project WHERE id in :ids ORDER BY rank DESC", nativeQuery = true)
    fun fulltextSearch(query: String, ids: Set<UUID>): List<IdRankInterface>

    interface IdRankInterface {
        val id: String
        val rank: Double
    }
}

@Repository
interface DataProjectRepository : ProjectBaseRepository<DataProject> {
    @Deprecated("Use findByNamespace instead")
    fun findByGitlabPathWithNamespace(pathWithNamespace: String): DataProject?

    @Query("SELECT p FROM DataProject p WHERE p.gitlabPathWithNamespace LIKE %:namespace%")
    override fun findByNamespace(namespace: String): List<DataProject>

    @Query("SELECT p FROM DataProject p WHERE p.gitlabNamespace LIKE %:namespace% AND (p.gitlabPath LIKE %:path% OR p.slug LIKE %:path%)")
    override fun findByNamespaceAndPath(namespace: String, path: String): DataProject?
}

@Repository
interface CodeProjectRepository : ProjectBaseRepository<CodeProject> {
    @Deprecated("Use findByNamespace instead")
    fun findByGitlabPathWithNamespace(pathWithNamespace: String): CodeProject?

    @Query("SELECT p FROM CodeProject p WHERE p.gitlabPathWithNamespace LIKE %:namespace%")
    override fun findByNamespace(namespace: String): List<CodeProject>

    @Query("SELECT p FROM CodeProject p WHERE p.gitlabNamespace LIKE %:namespace% AND (p.gitlabPath LIKE %:path% OR p.slug LIKE %:path%)")
    override fun findByNamespaceAndPath(namespace: String, path: String): CodeProject?
}

@Repository
interface SearchableTagRepository : KtCrudRepository<SearchableTag, UUID> {
    fun findAllByPublicTrueOrOwnerIdIn(ids: List<UUID>): List<SearchableTag>

    //    fun findAllByPublicTrueAndNameEquals(name: String): List<SearchableTag>
    fun findAllByPublicTrueAndNameIsIn(names: List<String>): List<SearchableTag>

    fun findAllByNameIsIn(names: List<String>): List<SearchableTag>
    fun findAllByNameIsInIgnoreCase(names: List<String>): List<SearchableTag>
    fun findByNameIgnoreCase(name: String): SearchableTag
}

@Repository
interface EmailRepository : KtCrudRepository<Email, UUID>

@Repository
interface BaseEnvironmentsRepository : KtCrudRepository<BaseEnvironments, UUID>
