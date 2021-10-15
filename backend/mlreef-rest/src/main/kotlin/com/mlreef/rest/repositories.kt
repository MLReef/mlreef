@file:Suppress("SqlResolve")

package com.mlreef.rest

import com.mlreef.rest.domain.*
import com.mlreef.rest.domain.marketplace.SearchableTag
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Component
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.*
import javax.persistence.EntityManager
import javax.persistence.EntityManagerFactory
import javax.persistence.LockModeType
import javax.persistence.PersistenceUnit

@Component
class JpaHelper(
    @PersistenceUnit
    private val entityManagerFactory: EntityManagerFactory
) {
    fun <T> withinTransaction(commit: Boolean = true, func: (em: EntityManager) -> T?): T? {
        val em = entityManagerFactory.createEntityManager()
        em.transaction.begin()
        val result = try {
            val res = func.invoke(em)
            if (commit) {
                em.transaction.commit()
            } else {
                em.transaction.rollback()
            }
            res
        } catch (ex: Exception) {
            em.transaction.rollback()
            throw ex
        } finally {
            em.close()
        }
        return result
    }
}

@Repository
interface AccountRepository : KtCrudRepository<Account, UUID> {
    fun findOneByUsername(username: String): Account?
    fun findOneByEmail(email: String): Account?
    fun findByChangeAccountToken(token: String): Account?
    fun findByUsernameIgnoreCase(username: String): Account?
    fun findByEmailIgnoreCase(email: String): Account?
    fun findBySlug(slug: String): Account?

    @Query("SELECT a FROM Account a WHERE a.gitlabId = :gitlabId")
    fun findAccountByGitlabId(gitlabId: Long): Account?
}

@Repository
interface AccountExternalRepository : KtCrudRepository<AccountExternal, UUID> {
    fun findByUsername(username: String): List<AccountExternal>
    fun findByUsernameAndOauthClient(username: String, oauthClient: String): AccountExternal?
    fun findByEmail(email: String): List<AccountExternal>
    fun findByEmailAndOauthClient(email: String, oauthClient: String): AccountExternal?
    fun findByAccessToken(token: String): AccountExternal?
    fun findByAccount(account: Account): AccountExternal?
    fun findByExternalIdAndOauthClient(externalId: String, oauthClient: String): AccountExternal?
}

@Repository
interface AccountTokenRepository : ReadOnlyRepository<AccountToken, UUID> {
    fun findAllByAccountId(id: UUID): List<AccountToken>
    fun findOneByToken(token: String): AccountToken?
    fun findByAccountIdAndExpiresAtAfter(id: UUID, expiresAt: Instant): List<AccountToken>
    fun findByAccountIdAndExpiresAtNull(id: UUID): List<AccountToken>
}

@Repository
@Deprecated("To be deleted", replaceWith = ReplaceWith("Account and Group"))
interface SubjectRepository : KtCrudRepository<Subject, UUID> {
    fun findByGitlabId(gitlabId: Long): Subject?
    fun findBySlug(path: String): Subject?
}

@Repository
@Deprecated("To be deleted", replaceWith = ReplaceWith("Account"))
interface PersonRepository : KtCrudRepository<Person, UUID> {
    //FIXME dangerous!! Multiple names should be ok!
    fun findByName(name: String): Person?
    fun findByGitlabId(gitlabId: Long): Person?
    fun findBySlug(slug: String): Person?
}

@Repository
interface GroupRepository : KtCrudRepository<Group, UUID> {
    fun findByGitlabId(gitlabId: Long): Group?
    fun findBySlug(slug: String): Group?
    fun findByName(name: String): List<Group>
}

@Repository
interface MembershipRepository : KtCrudRepository<Membership, UUID> {
    fun findByGroupId(groupId: UUID): List<Membership>
    fun findByPersonId(personId: UUID): List<Membership>
    fun findByPersonIdAndGroupId(personId: UUID, groupId: UUID): Membership?
}

@Repository
interface ExperimentRepository : KtCrudRepository<Experiment, UUID> {
    fun findAllByDataProject(dataProject: DataProject): List<Experiment>
    fun findOneByDataProjectAndSlug(dataProject: DataProject, slug: String): Experiment?
    fun findOneByDataProjectAndId(dataProject: DataProject, id: UUID): Experiment?
    fun findOneByDataProjectAndNumber(dataProject: DataProject, number: Int): Experiment?
    fun countByDataProject(dataProject: DataProject): Int
    fun findByPipeline(pipeline: Pipeline): List<Experiment>
    fun findByPipelineAndSlug(pipeline: Pipeline, slug: String): Experiment?

    @Query("SELECT max(e.number) FROM Experiment e WHERE e.dataProject = :dataProject")
    fun maxNumberByDataProjectId(dataProject: DataProject): Int?
}

@Repository
interface PipelineConfigurationRepository : KtCrudRepository<PipelineConfiguration, UUID> {
    fun findAllByDataProject(dataProject: DataProject): List<PipelineConfiguration>
    fun findOneByDataProjectAndId(dataProject: DataProject, id: UUID): PipelineConfiguration?
    fun findOneByDataProjectAndSlug(dataProject: DataProject, slug: String): PipelineConfiguration?
}

@Repository
interface PipelinesRepository : KtCrudRepository<Pipeline, UUID> {
    fun findAllByPipelineConfiguration(pipelineConfiguration: PipelineConfiguration): List<Pipeline>
    fun findOneByPipelineConfigurationAndId(pipelineConfiguration: PipelineConfiguration, id: UUID): Pipeline?
    fun findOneByPipelineConfigurationAndSlug(pipelineConfiguration: PipelineConfiguration, slug: String): Pipeline?
    fun findByStatusIn(statuses: Collection<PipelineStatus>): List<Pipeline>

    @Query("SELECT max(p.number) FROM Pipeline p WHERE p.pipelineConfiguration = :pipelineConfig")
    fun maxNumberByPipelineConfig(pipelineConfig: PipelineConfiguration): Int?
}

interface ProjectRepositoryCustom {
//    fun <T : Project> findAccessible(
//        clazz: Class<T>,
//        pageable: Pageable,
//        ids: List<UUID>?,
//        slugs: List<String>? = null,
//        searchableType: SearchableType,
//        inputDataTypes: List<OldDataType>? = null,
//        outputDataTypes: List<OldDataType>? = null,
//        tags: List<SearchableTag>? = null,
//        minStars: Int? = null,
//        maxStars: Int? = null
//    ): List<Project>
}

@Repository
interface ProjectBaseRepository<T : Project> : CrudRepository<T, UUID> {
    fun findByGlobalSlugAndVisibilityScope(slug: String, visibilityScope: VisibilityScope): T?

    //    fun findAllByVisibilityScope(visibilityScope: VisibilityScope, pageable: Pageable): List<T>
    fun findAllByOwnerId(ownerId: UUID, pageable: Pageable?): Page<T>
    fun findAllByOwnerId(ownerId: UUID): List<T>
    fun findOneByOwnerIdAndSlug(ownerId: UUID, slug: String): T?
    fun findAllByOwnerIdAndType(ownerId: UUID, type: ProjectType, pageable: Pageable?): Page<T>
    fun findAllByOwnerIdAndType(ownerId: UUID, type: ProjectType): List<T>

    @Query("select p from Project p WHERE p.ownerId=:ownerId OR p.visibilityScope=:scope OR p.id in :projectIds")
    fun findAccessibleProjectsForOwner(
        ownerId: UUID,
        projectIds: List<UUID>,
        pageable: Pageable?,
        scope: VisibilityScope = VisibilityScope.PUBLIC
    ): Page<T>

    @Query("select p from Project p WHERE p.type='DATA_PROJECT' AND (p.ownerId=:ownerId OR p.visibilityScope=:scope OR p.id in :projectIds)")
    fun findAccessibleDataProjectsForOwner(
        ownerId: UUID,
        projectIds: List<UUID>,
        pageable: Pageable?,
        scope: VisibilityScope = VisibilityScope.PUBLIC
    ): Page<T>

    @Query("select p from Project p WHERE p.visibilityScope=:scope")
    fun findAccessibleProjectsForVisitor(pageable: Pageable?, scope: VisibilityScope = VisibilityScope.PUBLIC): Page<T>

    @Query("select p from Project p WHERE p.type='DATA_PROJECT' AND p.visibilityScope=:scope")
    fun findAccessibleDataProjectsForVisitor(
        pageable: Pageable?,
        scope: VisibilityScope = VisibilityScope.PUBLIC
    ): Page<T>

    @Query("select p from Project p JOIN Star s on s.projectId = p.id where (p.ownerId=:ownerId or p.visibilityScope=:scope OR p.id IN :ids) AND s.subjectId = :ownerId")
    fun findAccessibleStarredProjectsForUser(
        ownerId: UUID,
        ids: List<UUID>,
        pageable: Pageable?,
        scope: VisibilityScope = VisibilityScope.PUBLIC
    ): Page<T>

    fun findAllByIdIn(ids: Iterable<UUID>, pageable: Pageable?): Page<T>

    fun findAllByVisibilityScope(
        visibilityScope: VisibilityScope = VisibilityScope.PUBLIC,
        pageable: Pageable? = null
    ): Page<T>

    @Query("select e from Project e JOIN Star s on s.projectId = e.id where e.id IN :ids AND s.subjectId = :ownerId")
    fun findAccessibleStarredProjects(ownerId: UUID, ids: List<UUID>, pageable: Pageable): List<T>

    fun findByGitlabId(gitlabId: Long): T?

    fun findByNameIgnoreCase(name: String): T?

    @Query("SELECT p FROM Project p WHERE p.gitlabPathWithNamespace LIKE %:namespace%")
    fun findByNamespace(namespace: String): List<T>

    @Query("SELECT p FROM Project p WHERE p.gitlabPathWithNamespace LIKE %:namespace%")
    fun findByNamespaceLike(namespace: String, pageable: Pageable?): Page<T>

    @Query("SELECT p FROM Project p WHERE p.gitlabNamespace LIKE %:namespace% AND (p.gitlabPath LIKE %:path% OR p.slug LIKE %:path%)")
    fun findByNamespaceAndPath(namespace: String, path: String): T?

    fun findBySlug(slug: String, pageable: Pageable?): Page<T>

    @Query("SELECT p FROM Project p WHERE p.gitlabNamespace=:namespace AND p.slug=:slug")
    fun findByNamespaceAndSlug(namespace: String, slug: String): T?

    fun findByOwnerIdAndForkParent(ownerId: UUID, parent: Project): T?

    fun findByForkParent(parent: Project, pageable: Pageable?): Page<T>

    @Query("SELECT p.id FROM Project p WHERE p.ownerId=:ownerId AND p.forkParent=:parent")
    fun getProjectIdByOwnerAndForkedParent(ownerId: UUID, parent: Project): UUID?
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
    @Query(
        value = "SELECT CAST(id as TEXT) as id, CAST(coalesce(ts_rank(document, to_tsquery('english', :query)),0.0) as FLOAT) as rank FROM mlreef_project WHERE id in :ids ORDER BY rank DESC",
        nativeQuery = true
    )
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

    override fun findByOwnerIdAndForkParent(ownerId: UUID, parent: Project): DataProject?

    override fun findByForkParent(parent: Project, pageable: Pageable?): Page<DataProject>
}

@Repository
interface CodeProjectRepository : ProjectBaseRepository<CodeProject> {
    @Deprecated("Use findByNamespace instead")
    fun findByGitlabPathWithNamespace(pathWithNamespace: String): CodeProject?

    @Query("SELECT p FROM CodeProject p WHERE p.gitlabPathWithNamespace LIKE %:namespace%")
    override fun findByNamespace(namespace: String): List<CodeProject>

    @Query("SELECT p FROM CodeProject p WHERE p.gitlabNamespace LIKE %:namespace% AND (p.gitlabPath LIKE %:path% OR p.slug LIKE %:path%)")
    override fun findByNamespaceAndPath(namespace: String, path: String): CodeProject?

    override fun findByOwnerIdAndForkParent(ownerId: UUID, parent: Project): CodeProject?

    override fun findByForkParent(parent: Project, pageable: Pageable?): Page<CodeProject>
}

@Repository
interface ProcessorsRepository : KtCrudRepository<Processor, UUID> {
    @Query("SELECT p FROM Processor p WHERE p.slug=:processorSlug ORDER BY p.publishedAt DESC ")
    fun findExactBySlug(processorSlug: String): Processor?

    @Query("SELECT p FROM Processor p WHERE p.slug LIKE %:processorSlug% ORDER BY p.publishedAt DESC ")
    fun findAllBySlug(processorSlug: String): List<Processor>

    fun getByCodeProject(codeProject: CodeProject, pageable: Pageable): Page<Processor>
    fun getByCodeProject(codeProject: CodeProject): List<Processor>
    fun getByCodeProjectAndSlug(codeProject: CodeProject, slug: String): Processor?

    fun getByCodeProjectAndBranch(codeProject: CodeProject, branch: String, pageable: Pageable): Page<Processor>
    fun getByCodeProjectAndBranch(codeProject: CodeProject, branch: String): List<Processor>

    fun getByCodeProjectAndVersion(codeProject: CodeProject, version: String, pageable: Pageable): Page<Processor>
    fun getByCodeProjectAndVersion(codeProject: CodeProject, version: String): List<Processor>

    fun getByCodeProjectAndStatusIn(codeProject: CodeProject, statuses: List<PublishStatus>): List<Processor>
    fun getByCodeProjectAndBranchAndStatusIn(codeProject: CodeProject, branch: String, statuses: List<PublishStatus>): List<Processor>

    fun getByStatusIn(statuses: Collection<PublishStatus>): List<Processor>
    fun getByStatusInAndUpdatedTimesLessThan(statuses: Collection<PublishStatus>, updatedTimes: Int): List<Processor>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Processor p WHERE p.status IN :statuses")
    fun getByStatusInLock(statuses: Collection<PublishStatus>): List<Processor>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Processor p WHERE p.status IN :statuses AND p.updatedTimes<:lessUpdatedTimes")
    fun getByStatusInAndUpdatedTimesLessThanLock(statuses: Collection<PublishStatus>, lessUpdatedTimes: Int): List<Processor>


    fun getByCodeProjectAndBranchAndVersionIgnoreCase(
        codeProject: CodeProject,
        branch: String,
        version: String
    ): Processor?

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Processor p WHERE p.codeProject=:codeProject AND p.branch=:branch AND p.version=:version")
    fun getByCodeProjectAndBranchAndVersionIgnoreCaseLock(
        codeProject: CodeProject,
        branch: String,
        version: String
    ): Processor?

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Processor p WHERE p.id=:id")
    fun getByIdLock(id: UUID): Processor?

    @Query("SELECT p.codeProject.id, p.branch, COUNT(p) FROM Processor p GROUP BY p.codeProject.id, p.branch HAVING COUNT(p)>:maxProcessors")
    fun getProjectIdWithProcessorsExceedNumber(maxProcessors: Long): List<Array<Any>>

    @Query("SELECT p.codeProject.id, p.branch, COUNT(p) FROM Processor p WHERE p.status in :statuses GROUP BY p.codeProject.id, p.branch HAVING COUNT(p)>:maxProcessors")
    fun getProjectIdWithProcessorsExceedNumberAndStatuses(maxProcessors: Long, statuses: Collection<PublishStatus>): List<Array<Any>>

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

interface ParametersRepository : KtCrudRepository<Parameter, UUID> {
    fun findByProcessorAndName(processor: Processor, name: String): Parameter?
}

interface ParameterInstancesRepository : KtCrudRepository<ParameterInstance, UUID> {
    fun findByParameterAndProcessorInstance(parameter: Parameter, processorInstance: ProcessorInstance): ParameterInstance?
    fun findByProcessorInstance(processorInstance: ProcessorInstance): List<ParameterInstance>
}

interface ProcessorInstancesRepository : KtCrudRepository<ProcessorInstance, UUID> {
    fun findByProcessor(processor: Processor): List<ProcessorInstance>
    fun findByPipelineConfiguration(pipelineConfiguration: PipelineConfiguration): List<ProcessorInstance>
    fun findByPipelineConfigurationAndProcessor(
        pipelineConfiguration: PipelineConfiguration,
        processor: Processor
    ): ProcessorInstance?

    fun findByName(name: String): List<ProcessorInstance>
    fun findBySlug(slug: String): List<ProcessorInstance>
    fun findByNameAndSlug(name: String, slug: String): List<ProcessorInstance>
}

@Repository
interface EmailRepository : KtCrudRepository<Email, UUID>

@Repository
interface BaseEnvironmentsRepository : KtCrudRepository<BaseEnvironments, UUID> {
    fun findByTitle(title: String): BaseEnvironments?
    fun findByDockerImage(imageName: String): List<BaseEnvironments>
}

@Repository
interface RecentProjectsRepository : KtCrudRepository<RecentProject, UUID> {
    fun findByUserOrderByUpdateDateDesc(user: Account): List<RecentProject>
    fun findByUserOrderByUpdateDateDesc(user: Account, page: Pageable): Page<RecentProject>

    @Query("SELECT r FROM RecentProject r WHERE r.user=:user AND r.project.type=:projectType ORDER BY r.updateDate DESC")
    fun findRecentDataProjectsByUserAndType(user: Account, projectType: ProjectType, page: Pageable): Page<RecentProject>

    fun findByProjectOrderByUpdateDateDesc(project: Project): List<RecentProject>
    fun findByProjectAndUser(project: Project, user: Account): RecentProject?
}

@Repository
interface MlreefFilesRepository : KtCrudRepository<MlreefFile, UUID> {
    fun findByOwner(owner: Account): List<MlreefFile>
    fun findByOwnerAndPurpose(owner: Account, purpose: FilePurpose): List<MlreefFile>
    fun findByStorageFileName(fileName: String): MlreefFile?
}

@Repository
interface DriveExternalRepository : KtCrudRepository<DriveExternal, UUID> {
    fun findByAccountAndAlias(account: Account, alias: String): DriveExternal?
}

@Repository
interface FilePurposesRepository : KtCrudRepository<FilePurpose, UUID> {
    fun findByPurposeName(name:String): FilePurpose?
}





