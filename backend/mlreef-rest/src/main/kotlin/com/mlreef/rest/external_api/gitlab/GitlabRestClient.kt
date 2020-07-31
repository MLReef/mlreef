package com.mlreef.rest.external_api.gitlab

import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.ApplicationConfiguration
import com.mlreef.rest.config.censor
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabAuthenticationFailedException
import com.mlreef.rest.exceptions.GitlabBadGatewayException
import com.mlreef.rest.exceptions.GitlabBadRequestException
import com.mlreef.rest.exceptions.GitlabCommonException
import com.mlreef.rest.exceptions.GitlabConflictException
import com.mlreef.rest.exceptions.GitlabConnectException
import com.mlreef.rest.exceptions.GitlabNotFoundException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.external_api.gitlab.dto.Branch
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabGroupInProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabNamespace
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabProjectSimplified
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserInGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserInProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserToken
import com.mlreef.rest.external_api.gitlab.dto.GitlabVariable
import com.mlreef.rest.external_api.gitlab.dto.GroupVariable
import com.mlreef.rest.external_api.gitlab.dto.OAuthToken
import com.mlreef.rest.external_api.gitlab.dto.OAuthTokenInfo
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import org.springframework.web.client.HttpStatusCodeException
import org.springframework.web.client.ResourceAccessException
import org.springframework.web.client.RestTemplate
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference

inline fun <reified T : Any> typeRef(): ParameterizedTypeReference<T> = object : ParameterizedTypeReference<T>() {}

@Component
class GitlabRestClient(
    private val conf: ApplicationConfiguration,
    private val builder: RestTemplateBuilder
) {
    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Suppress("LeakingThis")
    val gitlabServiceRootUrl = "${conf.gitlab.rootUrl}/api/v4"

    @Suppress("LeakingThis")
    val gitlabOAuthUrl = "${conf.gitlab.rootUrl}/oauth/"

    val gitlabDateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault())

    val oAuthAdminToken: AtomicReference<Pair<Long, String>?> = AtomicReference(null)

    private val isAdminTokenOAuth: AtomicBoolean = AtomicBoolean(false)

    companion object {
        val log = LoggerFactory.getLogger(GitlabRestClient::class.java)

        private const val OAUTH_TOKEN_HEADER = "Authorization"
        private const val PERMANENT_TOKEN_HEADER = "PRIVATE-TOKEN"
        private const val OAUTH_TOKEN_VALUE_PREFIX = "Bearer "
        private const val PERMANENT_TOKEN_VALUE_PREFIX = ""
        private const val IS_ADMIN_INTERNAL_HEADER = "is-admin"

        private const val REPEAT_REQUESTS_WHEN_GITLAB_UNAVAILABLE = 3
        private const val PAUSE_BETWEEN_REPEAT_WHEN_GITLAB_UNAVAILABLE_MS = 1500L
        private const val GITLAB_FAILED_LIMIT_REACHED_ERROR_MESSAGE_EMPTY = "\"limit_reached\":[]"
    }

    fun restTemplate(builder: RestTemplateBuilder): RestTemplate = builder.build()

    fun createProject(
        token: String,
        slug: String,
        name: String,
        description: String,
        visibility: String,
        defaultBranch: String,
        nameSpaceId: Long? = null,
        initializeWithReadme: Boolean = false,
        autoDevopsEnabled: Boolean = false,
        buildTimeout: Int = 18000
    ): GitlabProject {
        return GitlabCreateProjectRequest(
            name = name,
            path = slug,
            description = description,
            visibility = visibility,
            namespaceId = nameSpaceId,
            defaultBranch = defaultBranch,
            ciConfigPath = ".mlreef.yml",
            initializeWithReadme = initializeWithReadme,
            autoDevopsEnabled = autoDevopsEnabled,
            buildTimeout = buildTimeout
        )
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(409, ErrorCode.GitlabProjectAlreadyExists, "Cannot create project $name in gitlab. Project already exists")
            .addErrorDescription(400, ErrorCode.GitlabProjectAlreadyExists, "Cannot create project $name in gitlab. Possible project already exists")
            .addErrorDescription(ErrorCode.GitlabProjectCreationFailed, "Cannot create project $name in gitlab")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body ?: throw Exception("GitlabRestClient.createProject($slug): Gitlab response does not contain a body.")
    }

    fun adminGetProjects(): List<GitlabProject> {
        return GitlabHttpEntity<String>("body", createAdminHeaders())
            .addErrorDescription(ErrorCode.NotFound, "Cannot find projects")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, typeRef<List<GitlabProject>>())
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminGetProject(projectId: Long): GitlabProject {
        return GitlabHttpEntity<String>("body", createAdminHeaders())
            .addErrorDescription(404, ErrorCode.GitlabProjectNotExists, "Cannot find project $projectId in gitlab")
            .addErrorDescription(ErrorCode.GitlabCommonError, "Cannot find project $projectId")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, GitlabProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun userGetProjectMembers(token: String, projectId: Long): List<GitlabUserInProject> {
        return GitlabHttpEntity<String>("body", createUserHeaders(token))
            .addErrorDescription(404, ErrorCode.GitlabProjectNotExists, "Cannot find project $projectId in gitlab")
            .addErrorDescription(ErrorCode.GitlabCommonError, "Cannot get users for project $projectId")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/members"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, typeRef<List<GitlabUserInProject>>())
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminGetProjectMembers(projectId: Long): List<GitlabUserInProject> {
        return GitlabHttpEntity<String>("body", createAdminHeaders())
            .addErrorDescription(404, ErrorCode.GitlabProjectNotExists, "Cannot find project $projectId in gitlab")
            .addErrorDescription(ErrorCode.GitlabCommonError, "Cannot get users for project $projectId")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/members/all"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, typeRef<List<GitlabUserInProject>>())
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminGetProjectMember(projectId: Long, userId: Long): GitlabUserInProject {
        return GitlabHttpEntity<String>("body", createAdminHeaders())
            .addErrorDescription(404, ErrorCode.GitlabProjectNotExists, "Cannot find project $projectId in gitlab")
            .addErrorDescription(ErrorCode.GitlabCommonError, "Cannot get users for project $projectId")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/members/$userId"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, GitlabUserInProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminAddUserToProject(projectId: Long, userId: Long, accessLevel: GroupAccessLevel = GroupAccessLevel.DEVELOPER, expiresAt: Instant? = null): GitlabUserInProject {
        val expiresDate = if (expiresAt != null) gitlabDateTimeFormatter.format(expiresAt) else null
        return GitlabAddUserToProjectRequest(userId, accessLevel.accessCode, expiresDate)
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(404, ErrorCode.UserNotExisting, "Cannot add user to project. The project or user doesn't exist")
            .addErrorDescription(409, ErrorCode.UserAlreadyExisting, "Cannot add user to project. User already is in the project")
            .addErrorDescription(ErrorCode.GitlabUserAddingToGroupFailed, "Cannot add user to the project")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/members"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabUserInProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminAddGroupToProject(projectId: Long, groupId: Long, accessLevel: GroupAccessLevel = GroupAccessLevel.GUEST, expiresAt: Instant? = null): GitlabGroupInProject {
        val expiresDate = if (expiresAt != null) gitlabDateTimeFormatter.format(expiresAt) else null
        return GitlabAddGroupToProjectRequest(groupId, accessLevel.accessCode, expiresDate)
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(404, ErrorCode.UserNotExisting, "Cannot add group to project. The project or user doesn't exist")
            .addErrorDescription(409, ErrorCode.UserAlreadyExisting, "Cannot add user to project. User already is in the project")
            .addErrorDescription(ErrorCode.GitlabUserAddingToGroupFailed, "Cannot add user to the project")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/share"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabGroupInProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun userAddUserToProject(token: String, projectId: Long, userId: Long, accessLevel: GroupAccessLevel = GroupAccessLevel.DEVELOPER): GitlabUserInProject {
        return GitlabAddUserToProjectRequest(userId, accessLevel.accessCode)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(404, ErrorCode.UserNotExisting, "Cannot add user to project. The project or user doesn't exist")
            .addErrorDescription(409, ErrorCode.UserAlreadyExisting, "Cannot add user to project. User already is in the project")
            .addErrorDescription(ErrorCode.GitlabUserAddingToGroupFailed, "Cannot add user to the project")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/members"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabUserInProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminEditUserInProject(projectId: Long, userId: Long, accessLevel: GroupAccessLevel = GroupAccessLevel.DEVELOPER, expiresAt: Instant? = null): GitlabUserInProject {
        val expiresDate = if (expiresAt != null) gitlabDateTimeFormatter.format(expiresAt) else null
        return GitlabAddUserToProjectRequest(userId, accessLevel.accessCode, expiresDate)
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(404, ErrorCode.UserNotExisting, "Cannot add user to project. The project or user doesn't exist")
            .addErrorDescription(409, ErrorCode.UserAlreadyExisting, "Cannot add user to project. User already is in the project")
            .addErrorDescription(ErrorCode.GitlabUserAddingToGroupFailed, "Cannot add user to the project")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/members/$userId"
                restTemplate(builder).exchange(url, HttpMethod.PUT, it, GitlabUserInProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun userEditUserInProject(token: String, projectId: Long, userId: Long, accessLevel: GroupAccessLevel = GroupAccessLevel.DEVELOPER): GitlabUserInProject {
        return GitlabAddUserToProjectRequest(userId, accessLevel.accessCode)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(404, ErrorCode.UserNotExisting, "Cannot add user to project. The project or user doesn't exist")
            .addErrorDescription(409, ErrorCode.UserAlreadyExisting, "Cannot add user to project. User already is in the project")
            .addErrorDescription(ErrorCode.GitlabUserAddingToGroupFailed, "Cannot add user to the project")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/members/$userId"
                restTemplate(builder).exchange(url, HttpMethod.PUT, it, GitlabUserInProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun userDeleteUserFromProject(token: String, projectId: Long, userId: Long) {
        GitlabHttpEntity(null, createUserHeaders(token))
            .addErrorDescription(ErrorCode.GitlabMembershipDeleteFailed, "Cannot revoke user's membership from project $projectId")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/members/$userId"
                restTemplate(builder).exchange(url, HttpMethod.DELETE, it, Any::class.java)
            }
            .also { logGitlabCall(it) }
    }

    fun adminDeleteUserFromProject(projectId: Long, userId: Long) {
        GitlabHttpEntity(null, createAdminHeaders())
            .addErrorDescription(ErrorCode.GitlabMembershipDeleteFailed, "Cannot revoke user's $userId membership from project $projectId")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/members/$userId"
                restTemplate(builder).exchange(url, HttpMethod.DELETE, it, Any::class.java)
            }
            .also { logGitlabCall(it) }
    }

    fun adminDeleteGroupFromProject(projectId: Long, groupId: Long) {
        GitlabHttpEntity(null, createAdminHeaders())
            .addErrorDescription(404, ErrorCode.GitlabMembershipDeleteFailed, "Group $groupId is not member of project $projectId")
            .addErrorDescription(ErrorCode.GitlabMembershipDeleteFailed, "Cannot revoke group's $groupId membership from project $projectId")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/share/$groupId"
                restTemplate(builder).exchange(url, HttpMethod.DELETE, it, Any::class.java)
            }
            .also { logGitlabCall(it) }
    }

    fun userGetUserInProject(token: String, projectId: Long, userId: Long): GitlabUserInProject {
        return GitlabHttpEntity<String>("", createUserHeaders(token))
            .addErrorDescription(404, ErrorCode.UserNotExisting, "Cannot find user in project. User or project does not exist")
            .addErrorDescription(ErrorCode.GitlabCommonError, "Cannot find user in project. User or project does not exist")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/members/$userId"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, GitlabUserInProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminGetUserInProject(projectId: Long, userId: Long): GitlabUserInProject {
        return GitlabHttpEntity<String>("", createAdminHeaders())
            .addErrorDescription(404, ErrorCode.UserNotExisting, "Cannot find user in project. User or project does not exist")
            .addErrorDescription(ErrorCode.GitlabCommonError, "Cannot find user in project. User or project does not exist")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/members/$userId"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, GitlabUserInProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun userUpdateProject(id: Long, token: String, name: String? = null, description: String? = null, visibility: String? = null): GitlabProject {
        return GitlabUpdateProjectRequest(name = name, description = description, visibility = visibility)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(ErrorCode.GitlabProjectUpdateFailed, "Cannot update project with $id in gitlab")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$id"
                restTemplate(builder).exchange(url, HttpMethod.PUT, it, GitlabProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminUpdateProject(id: Long, name: String, description: String, visibility: String): GitlabProject {
        return GitlabUpdateProjectRequest(name = name)
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(ErrorCode.GitlabProjectUpdateFailed, "Cannot update project with $id in gitlab")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$id"
                restTemplate(builder).exchange(url, HttpMethod.PUT, it, GitlabProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun deleteProject(id: Long, token: String) {
        GitlabHttpEntity(null, createUserHeaders(token))
            .addErrorDescription(ErrorCode.GitlabProjectDeleteFailed, "Cannot delete project with id $id in gitlab")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$id"
                restTemplate(builder).exchange(url, HttpMethod.DELETE, it, Any::class.java)
            }
            .also { logGitlabCall(it) }
    }


    fun createBranch(token: String, projectId: Long, targetBranch: String, sourceBranch: String): Branch {
        return GitlabCreateBranchRequest(branch = targetBranch, ref = sourceBranch)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(409, ErrorCode.GitlabBranchCreationFailed, "Cannot create branch $targetBranch in project with id $projectId. Branch exists")
            .addErrorDescription(ErrorCode.GitlabBranchCreationFailed, "Cannot create branch $sourceBranch -> $targetBranch in project with id $projectId")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/repository/branches"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, Branch::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun deleteBranch(token: String, projectId: Long, targetBranch: String) {
        GitlabHttpEntity(null, createUserHeaders(token))
            .addErrorDescription(ErrorCode.GitlabBranchDeletionFailed, "Cannot delete branch $targetBranch in project with id $projectId")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/repository/branches/$targetBranch"
                restTemplate(builder).exchange(url, HttpMethod.DELETE, it, Any::class.java)
            }
            .also { logGitlabCall(it) }
    }

    fun commitFiles(
        token: String,
        projectId: Long,
        targetBranch: String,
        commitMessage: String,
        fileContents: Map<String, String>,
        action: String
    ): Commit {
        val actionList = fileContents.map { GitlabCreateCommitAction(filePath = it.key, content = it.value, action = action) }
        return GitlabCreateCommitRequest(branch = targetBranch, actions = actionList, commitMessage = commitMessage)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(ErrorCode.GitlabCommitFailed, "Cannot commit .mlreef.yml in $targetBranch")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/repository/commits"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, Commit::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun createPipeline(token: String, projectId: Long, commitRef: String, variables: List<GitlabVariable>): GitlabPipeline {
        return GitlabCreatePipelineRequest(
            ref = commitRef,
            variables = variables)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(ErrorCode.GitlabCommitFailed, "Cannot start pipeline for commit  $commitRef")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/pipeline"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabPipeline::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    // GET /projects/:id/pipelines/:pipeline_id
    fun getPipeline(token: String, projectId: Long, pipelineId: Long): GitlabPipeline {
        return GitlabHttpEntity<String>("", createUserHeaders(token))
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/pipelines/$pipelineId"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, GitlabPipeline::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    // GET /projects/:id/pipelines/:pipeline_id/variables
    fun getPipelineVariables(token: String, projectId: Long, pipelineId: Long): List<GitlabVariable> {
        return GitlabHttpEntity<String>("", createUserHeaders(token))
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/pipelines/$pipelineId/variables"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, typeRef<List<GitlabVariable>>())
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun getUser(token: String): GitlabUser {
        return GitlabHttpEntity<String>("body", createUserHeaders(token))
            .addErrorDescription(404, ErrorCode.GitlabUserNotExisting, "Cannot find user by token as user. User does not exist")
            .addErrorDescription(ErrorCode.GitlabUserNotExisting, "Cannot find user by token as user")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/user"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, GitlabUser::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    // https://docs.gitlab.com/ee/api/projects.html#list-user-projects
    fun adminGetUserOwnProjects(userId: Long): List<GitlabProject> {
        return GitlabHttpEntity<String>("body", createAdminHeaders())
            .addErrorDescription(404, ErrorCode.GitlabUserNotExisting, "Cannot find user by tid. User does not exist")
            .addErrorDescription(ErrorCode.GitlabUserNotExisting, "Unable to get users projects")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/users/$userId/projects"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, typeRef<List<GitlabProject>>())
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    // https://docs.gitlab.com/ee/api/projects.html#list-all-projects
    fun userGetUserAllProjects(token: String): List<GitlabProject> {
        return GitlabHttpEntity<String>("body", createUserHeaders(token))
            .addErrorDescription(ErrorCode.GitlabUserNotExisting, "Unable to get users projects")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects?membership=true"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, typeRef<List<GitlabProject>>())
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    // https://docs.gitlab.com/ee/api/projects.html#list-all-projects
    fun unauthenticatedGetAllPublicProjects(): List<GitlabProjectSimplified> {
        return GitlabHttpEntity<String>("body", createEmptyHeaders())
            .addErrorDescription(ErrorCode.GitlabCommonError, "Unable to get projects list")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects?simple=true"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, typeRef<List<GitlabProjectSimplified>>())
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    // https://docs.gitlab.com/ee/api/namespaces.html#search-for-namespace
    fun findNamespace(token: String, name: String): GitlabNamespace {
        return GitlabHttpEntity<String>("body", createUserHeaders(token))
            .addErrorDescription(ErrorCode.GitlabCommonError, "Cannot find namespace with name $name")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/namespace?search=$name"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, GitlabNamespace::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminGetUsers(): List<GitlabUser> {
        return GitlabHttpEntity<String>("body", createAdminHeaders())
            .addErrorDescription(404, ErrorCode.GitlabUserNotExisting, "Cannot find user by token as admin. User does not exist")
            .addErrorDescription(ErrorCode.GitlabUserNotExisting, "Cannot find user by token as admin")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/users"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, typeRef<List<GitlabUser>>())
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminGetUserById(id: Long): GitlabUser {
        return GitlabHttpEntity<String>("body", createAdminHeaders())
            .addErrorDescription(404, ErrorCode.GitlabUserNotExisting, "Cannot find user by id as admin. User does not exist")
            .addErrorDescription(ErrorCode.GitlabUserNotExisting, "Cannot find user by token as admin")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/users/$id"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, GitlabUser::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun assertConnection(): String? {
        log.info("HEALTH-CHECK: GITLAB_ROOT_URL is set to ${conf.gitlab.rootUrl.censor()}")
        log.info("HEALTH-CHECK: GITLAB_ADMIN_TOKEN is set to ${conf.gitlab.adminUserToken.censor()}")
        if (conf.gitlab.rootUrl.isBlank()) {
            throw Error("FATAL: GITLAB_ROOT_URL is empty: ${conf.gitlab.rootUrl}")
        }
        if (conf.gitlab.adminUserToken.isBlank()) {
            throw Error("FATAL: GITLAB_ADMIN_TOKEN is empty: $conf.gitlab.adminUserToken")
        }
        try {
            val adminGetUsers = adminGetUsers()
            val returnInfo = "SUCCESS: Found ${adminGetUsers.size} users on connected Gitlab"
            log.info(returnInfo)
            return returnInfo
        } catch (e: ResourceAccessException) {
            logFatal(e)
            val returnInfo = "WARNING: Gitlab is not available currently! CHECK GITLAB_ROOT_URL or just wait ..."
            log.error(returnInfo, e)
            return returnInfo
        } catch (e: GitlabCommonException) {
            logFatal(e)
            if (e.statusCode == 403) {
                throw Error("FATAL: Provided GITLAB_ADMIN_TOKEN is not allowed: ${conf.gitlab.adminUserToken.censor()}", e)
            }
        } catch (e: HttpServerErrorException) {
            logFatal(e)
            val returnInfo = "WARNING: Gitlab is not working correctly, fix this: ${e.message}"
            log.error(returnInfo, e)
            return returnInfo
        } catch (e: Exception) {
            val returnInfo = "WARNING: Another error during gitlab assertConnection: ${e.message}"
            log.error(returnInfo, e)
            return returnInfo
        }
        return null
    }

    fun userLoginOAuthToGitlab(userName: String, password: String): OAuthToken {
        return GitlabLoginOAuthTokenRequest(grantType = "password", username = userName, password = password)
            .let { GitlabHttpEntity(it, createEmptyHeaders()) }
            .addErrorDescription(401, ErrorCode.UserBadCredentials, "Username or password is incorrect")
            .makeRequest {
                val url = "$gitlabOAuthUrl/token"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, OAuthToken::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun userCheckOAuthTokenInGitlab(accessToken: String): OAuthTokenInfo {
        return GitlabOAuthTokenInfoRequest()
            .let { GitlabHttpEntity(it, createOAuthHeaders(accessToken)) }
            .addErrorDescription(401, ErrorCode.UserBadCredentials, "Token is incorrect")
            .makeRequest {
                val url = "$gitlabOAuthUrl/token/info"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, OAuthTokenInfo::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }


    fun adminCreateGroup(groupName: String, path: String): GitlabGroup {
        return GitlabCreateGroupRequest(name = groupName, path = path)
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(409, ErrorCode.GitlabGroupCreationFailed, "Cannot create group $groupName in gitlab as admin. Group already exists")
            .addErrorDescription(ErrorCode.GitlabGroupCreationFailed, "Cannot create group as admin")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabGroup::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun userCreateGroup(token: String, groupName: String, path: String): GitlabGroup {
        return GitlabCreateGroupRequest(name = groupName, path = path)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(409, ErrorCode.GitlabGroupCreationFailed, "Cannot create group $groupName in gitlab as user. Group already exists")
            .addErrorDescription(ErrorCode.GitlabGroupCreationFailed, "Cannot create group as user")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabGroup::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminUpdateGroup(groupId: Long, groupName: String?, path: String?): GitlabGroup {
        return GitlabUpdateGroupRequest(name = groupName, path = path)
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(404, ErrorCode.GitlabGroupCreationFailed, "Cannot update group $groupName in gitlab. Group not exists")
            .addErrorDescription(ErrorCode.GitlabGroupCreationFailed, "Cannot create group")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups/$groupId"
                restTemplate(builder).exchange(url, HttpMethod.PUT, it, GitlabGroup::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminDeleteGroup(groupId: Long) {
        GitlabHttpEntity(null, createAdminHeaders())
            .addErrorDescription(ErrorCode.GitlabMembershipDeleteFailed, "Cannot remove group $groupId in Gitlab")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups/$groupId"
                restTemplate(builder).exchange(url, HttpMethod.DELETE, it, Any::class.java)
            }
            .also { logGitlabCall(it) }
    }


    fun userCreateGroupVariable(token: String, groupId: Long, name: String, value: String): GroupVariable {
        return GitlabCreateGroupVariableRequest(key = name, value = value)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(409, ErrorCode.GitlabVariableCreationFailed, "Cannot create group variable as user. Variable already exists")
            .addErrorDescription(ErrorCode.GitlabVariableCreationFailed, "Cannot create group variable as user")
            .makeRequest {
                restTemplate(builder).exchange(
                    "$gitlabServiceRootUrl/groups/$groupId/variables",
                    HttpMethod.POST,
                    it,
                    GroupVariable::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminCreateUser(email: String, username: String, name: String, password: String): GitlabUser {
        return GitlabCreateUserRequest(email = email, username = username, name = name, password = password)
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(409, ErrorCode.UserAlreadyExisting, "Cannot create user $username in gitlab. User already exists")
            .addErrorDescription(ErrorCode.GitlabUserCreationFailed, "Cannot create user $username in gitlab")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/users"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabUser::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminResetUserPassword(gitlabUserId: Long, password: String): GitlabUser {
        return GitlabModifyUserRequest(password = password)
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(404, ErrorCode.GitlabUserNotExisting, "User with id $gitlabUserId not found")
            .addErrorDescription(ErrorCode.GitlabUserModificationFailed, "Cannot modify user with id $gitlabUserId in gitlab")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/users/$gitlabUserId"
                restTemplate(builder).exchange(url, HttpMethod.PUT, it, GitlabUser::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }


    fun adminGetUserToken(gitlabUserId: Long, token: Int): GitlabUserToken {
        return GitlabGetUserTokenRequest()
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(ErrorCode.GitlabCommonError, "Cannot get token for user $gitlabUserId in gitlab")
            .makeRequest {
                restTemplate(builder).exchange(
                    "$gitlabServiceRootUrl/users/$gitlabUserId/impersonation_tokens/$token",
                    HttpMethod.GET,
                    it,
                    GitlabUserToken::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminCreateUserToken(gitlabUserId: Long, tokenName: String): GitlabUserToken {
        return GitlabCreateUserTokenRequest(name = tokenName)
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(409, ErrorCode.GitlabUserTokenCreationFailed, "Cannot create token $tokenName for user in gitlab. Token with the name already exists")
            .addErrorDescription(ErrorCode.GitlabUserTokenCreationFailed, "Cannot create token for user in gitlab")
            .makeRequest {
                restTemplate(builder).exchange(
                    "$gitlabServiceRootUrl/users/$gitlabUserId/impersonation_tokens",
                    HttpMethod.POST,
                    it,
                    GitlabUserToken::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    /**
     * Return user's group. To get user's group you need to make request with user's token
     */
    fun userGetUserGroups(token: String): List<GitlabGroup> {
        return GitlabHttpEntity<String>("body", createUserHeaders(token))
            .addErrorDescription(404, ErrorCode.GitlabUserNotExisting, "Cannot find user by id. User does not exist")
            .addErrorDescription(ErrorCode.GitlabUserNotExisting, "Unable to get user's groups")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, typeRef<List<GitlabGroup>>())
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    /**
     * Return group's users
     */
    fun adminGetGroupMembers(groupId: Long): List<GitlabUserInGroup> {
        return GitlabHttpEntity<String>("body", createAdminHeaders())
            .addErrorDescription(404, ErrorCode.GitlabUserNotExisting, "Cannot find group by id. The group does not exist")
            .addErrorDescription(ErrorCode.GitlabUserNotExisting, "Unable to get users of group")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups/$groupId/members"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, typeRef<List<GitlabUserInGroup>>())
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminAddUserToGroup(groupId: Long, userId: Long, accessLevel: GroupAccessLevel? = null): GitlabUserInGroup {
        return GitlabAddUserToGroupRequest(userId, accessLevel?.accessCode ?: GroupAccessLevel.DEVELOPER.accessCode)
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(404, ErrorCode.UserNotExisting, "Cannot add user to group. Group or user doesn't exist")
            .addErrorDescription(409, ErrorCode.UserAlreadyExisting, "Cannot add user to group. User already is in group")
            .addErrorDescription(ErrorCode.GitlabUserAddingToGroupFailed, "Cannot add user to group")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups/$groupId/members"
                restTemplate(builder).exchange(
                    url, HttpMethod.POST, it, GitlabUserInGroup::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun userAddUserToGroup(token: String, groupId: Long, userId: Long, accessLevel: GroupAccessLevel? = null): GitlabUserInGroup {
        return GitlabAddUserToGroupRequest(userId, accessLevel?.accessCode ?: GroupAccessLevel.DEVELOPER.accessCode)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(404, ErrorCode.UserNotExisting, "Cannot add user to group. Group or user doesn't exist")
            .addErrorDescription(409, ErrorCode.UserAlreadyExisting, "Cannot add user to group. User already is in group")
            .addErrorDescription(ErrorCode.GitlabUserAddingToGroupFailed, "Cannot add user to group")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups/$groupId/members"
                restTemplate(builder).exchange(
                    url, HttpMethod.POST, it, GitlabUserInGroup::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun userEditUserInGroup(token: String, groupId: Long, userId: Long, accessLevel: GroupAccessLevel): GitlabUserInGroup {
        return GitlabAddUserToGroupRequest(userId, accessLevel.accessCode)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(404, ErrorCode.UserNotExisting, "Cannot add user to group. Group or user doesn't exist")
            .addErrorDescription(409, ErrorCode.UserAlreadyExisting, "Cannot add user to group. User already is in group")
            .addErrorDescription(ErrorCode.GitlabUserAddingToGroupFailed, "Cannot add user to group")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups/$groupId/members/$userId"
                restTemplate(builder).exchange(
                    url, HttpMethod.PUT, it, GitlabUserInGroup::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminEditUserInGroup(groupId: Long, userId: Long, accessLevel: GroupAccessLevel): GitlabUserInGroup {
        return GitlabAddUserToGroupRequest(userId, accessLevel.accessCode)
            .let { GitlabHttpEntity(it, createAdminHeaders()) }
            .addErrorDescription(404, ErrorCode.UserNotExisting, "Cannot add user to group. Group or user doesn't exist")
            .addErrorDescription(409, ErrorCode.UserAlreadyExisting, "Cannot add user to group. User already is in group")
            .addErrorDescription(ErrorCode.GitlabUserAddingToGroupFailed, "Cannot add user to group")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups/$groupId/members/$userId"
                restTemplate(builder).exchange(
                    url, HttpMethod.PUT, it, GitlabUserInGroup::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun userDeleteUserFromGroup(token: String, groupId: Long, userId: Long) {
        GitlabHttpEntity(null, createUserHeaders(token))
            .addErrorDescription(ErrorCode.GitlabMembershipDeleteFailed, "Cannot revoke user's membership from group $groupId")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups/$groupId/members/$userId"
                restTemplate(builder).exchange(url, HttpMethod.DELETE, it, Any::class.java)
            }
            .also { logGitlabCall(it) }
    }

    fun adminDeleteUserFromGroup(groupId: Long, userId: Long) {
        GitlabHttpEntity(null, createAdminHeaders())
            .addErrorDescription(ErrorCode.GitlabMembershipDeleteFailed, "Cannot revoke user's membership from group $groupId")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/groups/$groupId/members/$userId"
                restTemplate(builder).exchange(url, HttpMethod.DELETE, it, Any::class.java)
            }
            .also { logGitlabCall(it) }
    }

    private fun logGitlabCall(it: ResponseEntity<out Any>) {
        if (it.statusCode.is2xxSuccessful) {
            log.info("Received from gitlab: ${it.statusCode}")
        } else {
            log.warn("Received from gitlab: ${it.statusCode}")
            log.warn(it.headers.toString())
        }
    }

    private fun createAdminHeaders(): HttpHeaders = HttpHeaders().apply {
        val token = resolveAdminToken()
        if (isAdminTokenOAuth.get()) {
            set(OAUTH_TOKEN_HEADER, "$OAUTH_TOKEN_VALUE_PREFIX$token")
        } else {
            set(PERMANENT_TOKEN_HEADER, "$PERMANENT_TOKEN_VALUE_PREFIX$token")
        }

        set(IS_ADMIN_INTERNAL_HEADER, "true")
    }

    private fun resolveAdminToken(): String {
        if (!conf.gitlab.adminUserToken.isBlank()) {
            return conf.gitlab.adminUserToken
        } else {
            val oauthToken = oAuthAdminToken.get()

            if (oauthToken != null) return oauthToken.second

            isAdminTokenOAuth.set(true)

            return refreshAdminOAuthToken()
        }
    }

    private fun refreshAdminOAuthToken(): String {
        synchronized(this) {
            if (oAuthAdminToken.get() != null) return oAuthAdminToken.get()!!.second

            return forceRefreshAdminOAuthToken()
        }
    }

    private fun forceRefreshAdminOAuthToken(): String {
        synchronized(this) {
            this.userLoginOAuthToGitlab(conf.gitlab.adminUsername, conf.gitlab.adminPassword)
                .let { oAuthAdminToken.set(Pair(it.createdAt, it.accessToken)) }
            return oAuthAdminToken.get()?.second
                ?: throw GitlabConnectException("Cannot get OAuth token from Gitlab")
        }
    }

    private fun logFatal(e: Exception) {
        log.error("FATAL: MLReef rest service cannot use gitlab instance!", e)
    }

    private fun createUserHeaders(token: String): HttpHeaders = HttpHeaders().apply {
        if (token.length > 25) {
            set(OAUTH_TOKEN_HEADER, "$OAUTH_TOKEN_VALUE_PREFIX$token")
        } else {
            set(PERMANENT_TOKEN_HEADER, "$PERMANENT_TOKEN_VALUE_PREFIX$token")
        }

        set(IS_ADMIN_INTERNAL_HEADER, "false")
    }

    private fun createEmptyHeaders(): HttpHeaders = HttpHeaders()

    private fun createOAuthHeaders(token: String): HttpHeaders = HttpHeaders().apply {
        set(OAUTH_TOKEN_HEADER, "$OAUTH_TOKEN_VALUE_PREFIX$token")
    }

    private inner class GitlabHttpEntity<T>(body: T?, headers: HttpHeaders) : HttpEntity<T>(body, null) {
        private val errorsMap = HashMap<Int?, Pair<ErrorCode?, String?>>()
        private val internalHeaders = HttpHeaders()

        init {
            internalHeaders.putAll(headers)
        }

        fun addErrorDescription(error: ErrorCode?, message: String?): GitlabHttpEntity<T> =
            addErrorDescription(null, error, message)

        fun addErrorDescription(code: Int?, error: ErrorCode?, message: String?): GitlabHttpEntity<T> {
            errorsMap[code] = Pair(error, message)
            return this
        }

        fun getError(code: Int?): ErrorCode? =
            errorsMap[code]?.first ?: errorsMap.get(null)?.first

        fun getMessage(code: Int?): String? =
            errorsMap[code]?.second ?: errorsMap.get(null)?.second

        override fun getHeaders(): HttpHeaders = this.internalHeaders
    }

    private fun <T : GitlabHttpEntity<out Any>, R> T.makeRequest(block: (T) -> R): R {
        try {
            return block.invoke(this)
        } catch (ex: HttpStatusCodeException) {
            try {
                if (ex.statusCode == HttpStatus.UNAUTHORIZED || ex.statusCode == HttpStatus.FORBIDDEN) {
                    return repeatUnauthorized(this, ex, block)
                } else if (ex.statusCode == HttpStatus.BAD_GATEWAY || ex.statusCode == HttpStatus.INTERNAL_SERVER_ERROR) {
                    return repeatBadGateway(this, ex, block)
                } else if (ex.statusCode == HttpStatus.BAD_REQUEST && !ex.responseBodyAsString.contains(GITLAB_FAILED_LIMIT_REACHED_ERROR_MESSAGE_EMPTY)) {
                    return repeatBadGateway(this, ex, block)
                } else throw ex
            } catch (ex: HttpStatusCodeException) {
                throw handleException(
                    this.getError(ex.rawStatusCode),
                    this.getMessage(ex.rawStatusCode),
                    ex
                )
            }
        }
    }

    private fun <T : GitlabHttpEntity<out Any>, R> repeatUnauthorized(entity: T, ex: HttpStatusCodeException, block: (T) -> R): R {
        val isAdmin = entity.headers.getFirst(IS_ADMIN_INTERNAL_HEADER)?.toBoolean() ?: false

        if (isAdmin) {
            forceRefreshAdminOAuthToken() //Possible that threads will enter this method twice or more, but it is ok
            val newHeaders = createAdminHeaders()

            if (newHeaders.containsKey(OAUTH_TOKEN_HEADER)) {
                entity.headers.set(OAUTH_TOKEN_HEADER, newHeaders.getFirst(OAUTH_TOKEN_HEADER))
            } else if (newHeaders.containsKey(PERMANENT_TOKEN_HEADER)) {
                entity.headers.set(PERMANENT_TOKEN_HEADER, newHeaders.getFirst(PERMANENT_TOKEN_HEADER))
            } else throw ex

            return block.invoke(entity)

        } else throw ex
    }

    private fun <T : GitlabHttpEntity<out Any>, R> repeatBadGateway(entity: T, ex: HttpStatusCodeException, block: (T) -> R, turn: Int = 0): R {
        if (turn >= REPEAT_REQUESTS_WHEN_GITLAB_UNAVAILABLE)
            throw ex

        Thread.sleep(PAUSE_BETWEEN_REPEAT_WHEN_GITLAB_UNAVAILABLE_MS)

        try {
            return block.invoke(entity)
        } catch (ex: HttpClientErrorException) {
            return repeatBadGateway(entity, ex, block, turn + 1)
        }
    }

    private fun handleException(error: ErrorCode?, message: String?, response: HttpStatusCodeException): RestException {
        log.error("Received error from gitlab: ${response.responseHeaders?.location} ${response.statusCode}")
        log.error(response.responseHeaders?.toString())
        val responseBodyAsString = response.responseBodyAsString
        val statusCode = response.statusCode.value()
        log.error(responseBodyAsString)

        val currentError = error ?: ErrorCode.GitlabCommonError
        val currentMessage = message ?: "Gitlab common error"

        when (response.statusCode) {
            HttpStatus.BAD_REQUEST -> return GitlabBadRequestException(responseBodyAsString, currentError, currentMessage)
            HttpStatus.CONFLICT -> return GitlabConflictException(responseBodyAsString, currentError, currentMessage)
            HttpStatus.BAD_GATEWAY -> return GitlabBadGatewayException(responseBodyAsString)
            HttpStatus.NOT_FOUND -> return GitlabNotFoundException(responseBodyAsString, currentError, currentMessage)
            HttpStatus.FORBIDDEN -> return GitlabAuthenticationFailedException(statusCode, responseBodyAsString, currentError, currentMessage)
            else -> return GitlabCommonException(statusCode, responseBodyAsString)
        }
    }
}
