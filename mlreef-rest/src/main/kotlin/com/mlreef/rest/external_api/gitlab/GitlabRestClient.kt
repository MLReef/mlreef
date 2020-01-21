package com.mlreef.rest.external_api.gitlab

import com.mlreef.rest.config.RedisSessionStrategy
import com.mlreef.rest.config.censor
import org.slf4j.LoggerFactory
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

    val gitlabServiceRootUrl = "$gitlabRootUrl/api/v4"

    val log = LoggerFactory.getLogger(RedisSessionStrategy::class.java)

    fun restTemplate(builder: RestTemplateBuilder): RestTemplate = builder.build()

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
        val actionList = fileContents.map { GitlabCreateCommitAction(file_path = it.key, content = it.value, action = action) }
        return GitlabCreateCommitRequest(branch = targetBranch, actions = actionList, commit_message = commitMessage)
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
