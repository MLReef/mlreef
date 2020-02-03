package com.mlreef.rest.external_api.gitlab

import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.config.censor
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabAuthenticationFailedException
import com.mlreef.rest.exceptions.GitlabBadGatewayException
import com.mlreef.rest.exceptions.GitlabBadRequestException
import com.mlreef.rest.exceptions.GitlabCommonException
import com.mlreef.rest.exceptions.GitlabConflictException
import com.mlreef.rest.exceptions.GitlabNotFoundException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.external_api.gitlab.dto.Branch
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserInGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserToken
import com.mlreef.rest.external_api.gitlab.dto.GroupVariable
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import org.springframework.util.MultiValueMap
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import org.springframework.web.client.ResourceAccessException
import org.springframework.web.client.RestTemplate

inline fun <reified T : Any> typeRef(): ParameterizedTypeReference<T> = object : ParameterizedTypeReference<T>() {}

@Component
class GitlabRestClient(
    private val builder: RestTemplateBuilder,
    @Value("\${mlreef.gitlab.rootUrl}")
    val gitlabRootUrl: String,
    @Value("\${mlreef.gitlab.adminUserToken}")
    val gitlabAdminUserToken: String
) {
    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Suppress("LeakingThis")
    val gitlabServiceRootUrl = "$gitlabRootUrl/api/v4"

    val log = LoggerFactory.getLogger(GitlabRestClient::class.java)

    fun restTemplate(builder: RestTemplateBuilder): RestTemplate = builder.build()

    fun createProject(token: String, name: String, path: String?): GitlabProject {
        return GitlabCreateProjectRequest(name = name, path = path)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(409, ErrorCode.GitlabProjectAlreadyExists, "Cannot create project $name in gitlab. Project already exists")
            .addErrorDescription(ErrorCode.GitlabProjectCreationFailed, "Cannot create project $name in gitlab")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun updateProject(id: Long, token: String, name: String): GitlabProject {
        return GitlabCreateProjectRequest(name = name, path = null)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
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


    fun createBranch(token: String, projectId: Int, targetBranch: String, sourceBranch: String = "master"): Branch {
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

    fun commitFiles(token: String, projectId: Int, targetBranch: String, commitMessage: String, fileContents: Map<String, String>, action: String = "create"): Commit {
        val actionList = fileContents.map { GitlabCreateCommitAction(filePath = it.key, content = it.value, action = action) }
        return GitlabCreateCommitRequest(branch = targetBranch, actions = actionList, commitMessage = commitMessage)
            .let { GitlabHttpEntity(it, createUserHeaders(token)) }
            .addErrorDescription(ErrorCode.GitlabCommitFailed, "Cannot commit mlreef.yml in $targetBranch")
            .makeRequest {
                val url = "$gitlabServiceRootUrl/projects/$projectId/repository/commits"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, Commit::class.java)
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

    fun assertConnection(): String? {
        log.info("HEALTH-CHECK: GITLAB_ROOT_URL is set to ${gitlabRootUrl.censor()}")
        log.info("HEALTH-CHECK: GITLAB_ADMIN_TOKEN is set to ${gitlabAdminUserToken.censor()}")
        if (gitlabRootUrl.isBlank()) {
            throw Error("FATAL: GITLAB_ROOT_URL is empty: $gitlabRootUrl")
        }
        if (gitlabAdminUserToken.isBlank()) {
            throw Error("FATAL: GITLAB_ADMIN_TOKEN is empty: $gitlabAdminUserToken")
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
        } catch (e: HttpClientErrorException) {
            logFatal(e)
            if (e.statusCode.is4xxClientError && e.statusCode.value() == 403) {
                throw Error("FATAL: Provided GITLAB_ADMIN_TOKEN is not allowed: ${gitlabAdminUserToken.censor()}", e)
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

    private fun logFatal(e: Exception) {
        log.error("FATAL: MLReef rest service cannot use gitlab instance!", e)
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

    fun adminCreateUserToken(gitlabUserId: Int, tokenName: String): GitlabUserToken {
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

    fun adminAddUserToGroup(groupId: Int, userId: Long, accessLevel: GroupAccessLevel = GroupAccessLevel.DEVELOPER): GitlabUserInGroup {
        return GitlabAddUserToGroupRequest(userId, accessLevel.accessCode)
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

    fun userCreateGroupVariable(token: String, groupId: Int, name: String, value: String): GroupVariable {
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

    private fun logGitlabCall(it: ResponseEntity<out Any>) {
        if (it.statusCode.is2xxSuccessful) {
            log.info("Received from gitlab: ${it.statusCode}")
        } else {
            log.warn("Received from gitlab: ${it.statusCode}")
            log.warn(it.headers.toString())
        }
    }

    private fun createAdminHeaders(): HttpHeaders = HttpHeaders().apply {
        set("PRIVATE-TOKEN", gitlabAdminUserToken)
    }

    private fun createUserHeaders(token: String): HttpHeaders = HttpHeaders().apply {
        set("PRIVATE-TOKEN", token)
    }

    private inner class GitlabHttpEntity<T>(body: T?, headers: MultiValueMap<String, String>) : HttpEntity<T>(body, headers) {
        private val errorsMap = HashMap<Int?, Pair<ErrorCode?, String?>>()

        fun addErrorDescription(error: ErrorCode?, message: String?): GitlabHttpEntity<T> {
            return addErrorDescription(null, error, message)
        }

        fun addErrorDescription(code: Int?, error: ErrorCode?, message: String?): GitlabHttpEntity<T> {
            errorsMap.put(code, Pair(error, message))
            return this
        }

        fun getError(code: Int?): ErrorCode? {
            return errorsMap.get(code)?.first ?: errorsMap.get(null)?.first
        }

        fun getMessage(code: Int?): String? {
            return errorsMap.get(code)?.second ?: errorsMap.get(null)?.second
        }
    }

    private fun <T : GitlabHttpEntity<out Any>, R> T.makeRequest(block: (T) -> R): R {
        try {
            return block.invoke(this)
        } catch (ex: HttpClientErrorException) {
            throw handleException(
                this.getError(ex.rawStatusCode),
                this.getMessage(ex.rawStatusCode),
                ex
            )
        }
    }

    private fun handleException(error: ErrorCode?, message: String?, response: HttpClientErrorException): RestException {
        log.error("Received error from gitlab: ${response.responseHeaders?.location} ${response.statusCode}")
        log.error(response.responseHeaders?.toString())
        log.error(response.responseBodyAsString)

        val currentError = error ?: ErrorCode.GitlabCommonError
        val currentMessage = message ?: "Gitlab common error"

        when (response.statusCode) {
            HttpStatus.BAD_REQUEST -> return GitlabBadRequestException(currentError, currentMessage)
            HttpStatus.CONFLICT -> return GitlabConflictException(currentError, currentMessage)
            HttpStatus.BAD_GATEWAY -> return GitlabBadGatewayException()
            HttpStatus.NOT_FOUND -> return GitlabNotFoundException(currentError, currentMessage)
            HttpStatus.FORBIDDEN -> return GitlabAuthenticationFailedException(currentError, currentMessage)
            else -> return GitlabCommonException()
        }
    }
}
