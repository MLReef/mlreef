package com.mlreef.rest.external_api.gitlab

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import org.springframework.context.annotation.Scope
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
@Scope("session")
class GitlabUser(
    val id: Int,
    val username: String = "",
    val name: String = "",
    val email: String = "",
    val publicEmail: String = "",
    val state: String = "") : Serializable

// https://docs.gitlab.com/ee/api/users.html#user-creation
internal class GitlabCreateUserRequest(
    val email: String,
    val username: String,
    val name: String,
    val password: String,
    val reset_password: Boolean = false
) : Serializable

// https://docs.gitlab.com/ee/api/users.html#get-all-impersonation-tokens-of-a-user
internal class GitlabGetUserTokensRequest(
    val user_id: Int,
    val state: String = "all"
) : Serializable

// https://docs.gitlab.com/ee/api/users.html#create-an-impersonation-token
internal class GitlabCreateUserTokenRequest(
    val name: String = "mlreef-token",
    val scopes: List<String> = listOf("api", "read_user"),
    val expires_at: String? = null
) : Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
class GitlabUserToken(
    val id: Int,
    val revoked: Boolean,
    val scopes: List<String> = listOf(),
    val token: String,
    val name: String,
    val active: Boolean = false,
    val impersonation: Boolean = false,
    val created_at: String? = "",
    val expires_at: String? = ""
) : Serializable

// https://docs.gitlab.com/ee/api/branches.html#create-repository-branch
internal class GitlabCreateBranchRequest(
    val branch: String,
    val ref: String
) : Serializable

// https://docs.gitlab.com/ee/api/commits.html#create-a-commit-with-multiple-files-and-actions
internal class GitlabCreateCommitRequest(
    val branch: String,
    val commit_message: String,
    val actions: List<GitlabCreateCommitAction>
) : Serializable

internal class GitlabCreateCommitAction(
    val file_path: String,
    val content: String,
    val action: String = "create"
) : Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
class Branch(
    val branch: String = "",
    val ref: String = ""
) : Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
class Commit(
    val author_email: String = "",
    val author_name: String = "",
    val authored_date: String = "",
    val committer_email: String = "",
    val committer_name: String = "",
    val committed_date: String = "",
    val title: String = "",
    val message: String = "",
    val id: String = "",
    val short_id: String = "",
    val status: String? = null,
    val stats: CommitStats? = null
) : Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
class CommitStats(
    val additions: Int,
    val deletions: Int,
    val total: Int
) : Serializable
