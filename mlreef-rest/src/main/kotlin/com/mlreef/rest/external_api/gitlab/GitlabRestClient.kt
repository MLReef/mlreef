package com.mlreef.rest.external_api.gitlab

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.PropertyNamingStrategy
import com.mlreef.rest.config.RedisSessionStrategy
import com.mlreef.rest.config.censor
import com.mlreef.rest.exceptions.GitlabAlreadyExistingConflictException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
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

    val gitlabServiceRootUrl = "$gitlabRootUrl/api/v4"

    val log = LoggerFactory.getLogger(RedisSessionStrategy::class.java)

    fun restTemplate(builder: RestTemplateBuilder): RestTemplate = builder.build()

    /**
     * TODO: Currently we have next working logic for json parsing:
     * 1. We receiving json objects from Gitlab. They have snake_case name convention
     * 2. We sending json objects to client. They have camelCase name convention
     * 3. Kotlin DTOs should use java rules - camelCase
     * 4. Json objects that we send to client should use JS rules - snake_case
     * 5. Currently we have half of Gitlabs DTOs in snake_case, other in camelCase
     * 6. Currently we send json objects to client in camelCase
     *
     * To fix it there is setting for ObjectMapper - setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE). See com.mlreef.rest.config.application-config
     * If we apply it - we break item 6. Need to fix on UI side first
     */

    fun createProject(token: String, name: String, path: String?): GitlabProject {
        val project: GitlabProject?

//        try {
//            objectMapper.setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE)
        project = GitlabCreateProjectRequest(name = name, path = path)
            .let { HttpEntity(it, createUserHeaders(token)) }
            .let {
                val url = "$gitlabServiceRootUrl/projects"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
//        } finally {
//            objectMapper.setPropertyNamingStrategy(PropertyNamingStrategy.LOWER_CAMEL_CASE)
//        }

        return project
    }

    fun updateProject(id: Long, token: String, name: String): GitlabProject {
        return GitlabCreateProjectRequest(name = name, path = null)
            .let { HttpEntity(it, createUserHeaders(token)) }
            .let {
                val url = "$gitlabServiceRootUrl/projects/$id"
                restTemplate(builder).exchange(url, HttpMethod.PUT, it, GitlabProject::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun deleteProject(id: Long, token: String) {
        HttpEntity(null, createUserHeaders(token))
            .let {
                val url = "$gitlabServiceRootUrl/projects/$id"
                restTemplate(builder).exchange(url, HttpMethod.DELETE, it, Any::class.java)
            }
            .also { logGitlabCall(it) }
    }


    fun createBranch(token: String, projectId: Int, targetBranch: String, sourceBranch: String = "master"): Branch {
        return GitlabCreateBranchRequest(branch = targetBranch, ref = sourceBranch)
            .let { HttpEntity(it, createUserHeaders(token)) }
            .let {
                val url = "$gitlabServiceRootUrl/projects/$projectId/repository/branches"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, Branch::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun commitFiles(token: String, projectId: Int, targetBranch: String, commitMessage: String, fileContents: Map<String, String>, action: String = "create"): Commit {
        val actionList = fileContents.map { GitlabCreateCommitAction(filePath = it.key, content = it.value, action = action) }
        return GitlabCreateCommitRequest(branch = targetBranch, actions = actionList, commitMessage = commitMessage)
            .let { HttpEntity(it, createUserHeaders(token)) }
            .let {
                val url = "$gitlabServiceRootUrl/projects/$projectId/repository/commits"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, Commit::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun getUser(token: String): GitlabUser {
        return HttpEntity<String>("body", createUserHeaders(token))
            .let {
                val url = "$gitlabServiceRootUrl/user"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, GitlabUser::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminGetUsers(): List<GitlabUser> {
        return HttpEntity<String>("body", createAdminHeaders())
            .let {
                val url = "$gitlabServiceRootUrl/users"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, typeRef<List<GitlabUser>>())
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun assertConnection() {
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
            log.info("SUCCESS: Found ${adminGetUsers.size} users on connected Gitlab")
        } catch (e: ResourceAccessException) {
            logFatal(e)
            throw Error("FATAL: Gitlab is not available during startup! CHECK GITLAB_ROOT_URL", e)
        } catch (e: HttpClientErrorException) {
            logFatal(e)
            if (e.statusCode.is4xxClientError && e.statusCode.value() == 403) {
                throw Error("FATAL: Provided GITLAB_ADMIN_TOKEN is not allowed: ${gitlabAdminUserToken.censor()}", e)
            }
        } catch (e: HttpServerErrorException) {
            logFatal(e)
            if (e.statusCode.is5xxServerError) {
                throw Error("FATAL: Gitlab is not working correctly, fix this", e)
            }
        } catch (e: Exception) {
            log.error("CRITICAL: Another error during gitlab assertConnection", e)
        }
    }

    private fun logFatal(e: Exception) {
        log.error("FATAL: MLReef rest service cannot use gitlab instance!", e)
    }

    fun adminCreateUser(email: String, username: String, name: String, password: String): GitlabUser {
        return GitlabCreateUserRequest(email = email, username = username, name = name, password = password)
            .let { HttpEntity(it, createAdminHeaders()) }
            .let {
                val url = "$gitlabServiceRootUrl/users"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabUser::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminCreateGroup(groupName: String, path: String): GitlabGroup {
        val group: GitlabGroup?

        try {
            objectMapper.propertyNamingStrategy = PropertyNamingStrategy.SNAKE_CASE
            group = GitlabCreateGroupRequest(name = groupName, path = path)
                .let { HttpEntity(it, createAdminHeaders()) }
                .let {
                    val url = "$gitlabServiceRootUrl/groups"
                    restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabGroup::class.java)
                }
                .also { logGitlabCall(it) }
                .apply { }
                .body!!
        } finally {
            objectMapper.propertyNamingStrategy = PropertyNamingStrategy.LOWER_CAMEL_CASE
        }

        return group
            ?: throw GitlabAlreadyExistingConflictException(com.mlreef.rest.exceptions.Error.GitlabGroupCreationFailed, "Gitlab group creation failed")
    }

    fun adminCreateUserToken(gitlabUserId: Int, tokenName: String): GitlabUserToken {
        return GitlabCreateUserTokenRequest(name = tokenName)
            .let { HttpEntity(it, createAdminHeaders()) }
            .let {
                restTemplate(builder).exchange(
                    "$gitlabServiceRootUrl/users/$gitlabUserId/impersonation_tokens",
                    HttpMethod.POST,
                    it,
                    GitlabUserToken::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminAddUserToGroup(groupId: Int, userId: Int, accessLevel: GroupAccessLevel = GroupAccessLevel.DEVELOPER): GitlabUserInGroup {
        val userInGroup: GitlabUserInGroup?
        try {
            objectMapper.propertyNamingStrategy = PropertyNamingStrategy.SNAKE_CASE
            userInGroup = HttpEntity(null, createAdminHeaders())
                .let {
                    val url = "$gitlabServiceRootUrl/groups/$groupId/members?user_id=$userId&access_level=${accessLevel.accessCode}"
                    restTemplate(builder).exchange(
                        url, HttpMethod.POST, it, GitlabUserInGroup::class.java)
                }
                .also { logGitlabCall(it) }
                .body!!
        } finally {
            objectMapper.propertyNamingStrategy = PropertyNamingStrategy.LOWER_CAMEL_CASE
        }

        return userInGroup
            ?: throw GitlabAlreadyExistingConflictException(com.mlreef.rest.exceptions.Error.GitlabUserAddingToGroupFailed, "Gitlab adding user to group filed")
    }


    private fun logGitlabCall(it: ResponseEntity<out Any>) {
        if (it.statusCode.is2xxSuccessful) {
            log.info("Received from gitlab: ${it.headers.location} ${it.statusCode}")
        } else {
            log.warn("Received from gitlab: ${it.headers.location} ${it.statusCode}")
            log.warn(it.headers.toString())
        }
    }

    private fun createAdminHeaders(): HttpHeaders = HttpHeaders().apply {
        set("PRIVATE-TOKEN", gitlabAdminUserToken)
    }

    private fun createUserHeaders(token: String): HttpHeaders = HttpHeaders().apply {
        set("PRIVATE-TOKEN", token)
    }
}
