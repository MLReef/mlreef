package com.mlreef.rest.external_api.gitlab

import com.fasterxml.jackson.annotation.JsonInclude
import java.io.Serializable


// https://docs.gitlab.com/ee/api/users.html#user-creation
internal class GitlabCreateUserRequest(
    val email: String,
    val username: String,
    val name: String,
    val password: String,
    val resetPassword: Boolean = false
) : Serializable

// https://docs.gitlab.com/ee/api/users.html#get-all-impersonation-tokens-of-a-user
internal class GitlabGetUserTokensRequest(
    val userId: Int,
    val state: String = "all"
) : Serializable

// https://docs.gitlab.com/ee/api/users.html#create-an-impersonation-token
internal class GitlabCreateUserTokenRequest(
    val name: String = "mlreef-token",
    val scopes: List<String> = listOf("api", "read_user"),
    val expiresAt: String? = null
) : Serializable

//https://docs.gitlab.com/ee/api/groups.html#new-group
internal class GitlabCreateGroupRequest(
    val name: String,
    val path: String
) : Serializable


// https://docs.gitlab.com/ee/api/members.html#add-a-member-to-a-group-or-project
internal class GitlabAddUserToGroupRequest(
    val userId: Long,
    val accessLevel: Int
) : Serializable

// https://docs.gitlab.com/ee/api/branches.html#create-repository-branch
internal class GitlabCreateBranchRequest(
    val branch: String,
    val ref: String
) : Serializable

// https://docs.gitlab.com/ee/api/commits.html#create-a-commit-with-multiple-files-and-actions
internal class GitlabCreateCommitRequest(
    val branch: String,
    val commitMessage: String,
    val actions: List<GitlabCreateCommitAction>
) : Serializable

internal class GitlabCreateCommitAction(
    val filePath: String,
    val content: String,
    val action: String = "create"
) : Serializable

// https://docs.gitlab.com/ee/api/group_level_variables.html#create-variable
internal class GitlabCreateGroupVariableRequest(
    val key: String,
    val value: String,
    val variableType: VariableType = VariableType.ENV_VAR,
    val protected: Boolean = false
) : Serializable

// https://docs.gitlab.com/ee/api/projects.html#create-project
@JsonInclude(JsonInclude.Include.NON_NULL)
internal class GitlabCreateProjectRequest(
    val name: String,
    val path: String,
    val ciConfigPath: String = "mlreef.yml",
    val description: String = "",
    val defaultBranch: String = "",
    val namespace_id: Int? = null
) : Serializable

@JsonInclude(JsonInclude.Include.NON_NULL)
internal class GitlabUpdateProjectRequest(
    val name: String,
    val description: String = "",
    val defaultBranch: String = ""
) : Serializable
