package com.mlreef.rest.external_api.gitlab

import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.external_api.gitlab.dto.GitlabVariable
import java.io.Serializable


// https://docs.gitlab.com/ee/api/users.html#user-creation
internal class GitlabCreateUserRequest(
    val email: String,
    val username: String,
    val name: String,
    val password: String,
    val resetPassword: Boolean = false,
    val skipConfirmation: Boolean = true,
) : Serializable

//https://docs.gitlab.com/ee/api/users.html#user-modification
@JsonInclude(JsonInclude.Include.NON_NULL)
internal class GitlabUpdateUserRequest(
    val email: String?,
    val username: String?,
    val name: String?,
) : Serializable

//https://docs.gitlab.com/ee/api/users.html#user-modification
internal class GitlabModifyUserRequest(
    val password: String? = null,
) : Serializable

// https://docs.gitlab.com/ee/api/users.html#get-all-impersonation-tokens-of-a-user
internal class GitlabGetUserTokensRequest(
    val userId: Int,
    val state: String = "all",
) : Serializable

// https://docs.gitlab.com/ee/api/users.html#create-an-impersonation-token
internal class GitlabCreateUserTokenRequest(
    val name: String = "mlreef-token",
    val scopes: List<String> = listOf("api", "read_user", "read_repository", "write_repository"),
    val expiresAt: String? = null,
) : Serializable

// https://docs.gitlab.com/ee/api/users.html#get-an-impersonation-token-of-a-user
internal class GitlabGetUserTokenRequest : Serializable

//https://docs.gitlab.com/ee/api/groups.html#new-group
internal class GitlabCreateGroupRequest(
    val name: String,
    val path: String,
    val visibility: String,
) : Serializable

//https://docs.gitlab.com/ee/api/groups.html#update-group
@JsonInclude(JsonInclude.Include.NON_NULL)
internal class GitlabUpdateGroupRequest(
    val name: String?,
    val path: String?,
) : Serializable

// https://docs.gitlab.com/ee/api/members.html#add-a-member-to-a-group-or-project
internal class GitlabAddUserToGroupRequest(
    val userId: Long,
    val accessLevel: Int,
) : Serializable

// https://docs.gitlab.com/ee/api/members.html#add-a-member-to-a-group-or-project
internal class GitlabAddUserToProjectRequest(
    val userId: Long,
    val accessLevel: Int,
    val expiresAt: String? = null,
) : Serializable

//https://docs.gitlab.com/ee/api/projects.html#share-project-with-group
internal class GitlabAddGroupToProjectRequest(
    val groupId: Long,
    val groupAccess: Int,
    val expiresAt: String? = null,
) : Serializable

// https://docs.gitlab.com/ee/api/branches.html#create-repository-branch
internal class GitlabCreateBranchRequest(
    val branch: String,
    val ref: String,
) : Serializable

// https://docs.gitlab.com/ee/api/commits.html#create-a-commit-with-multiple-files-and-actions
internal class GitlabCreateCommitRequest(
    val branch: String,
    val commitMessage: String,
    val actions: List<GitlabCreateCommitAction>,
    val force: Boolean = false,
) : Serializable

// https://docs.gitlab.com/ee/api/pipelines.html#create-a-new-pipeline
internal class GitlabCreatePipelineRequest(
    val ref: String,
    val variables: List<GitlabVariable>,
) : Serializable

internal class GitlabCreateCommitAction(
    val filePath: String,
    val content: String,
    val action: String = "create",
) : Serializable

// https://docs.gitlab.com/ee/api/group_level_variables.html#create-variable
internal class GitlabCreateVariableRequest(
    val key: String,
    val value: String,
    val variableType: VariableType = VariableType.ENV_VAR,
    val protected: Boolean = false,
    val masked: Boolean = false,
) : Serializable

// https://docs.gitlab.com/ee/api/projects.html#create-project
@JsonInclude(JsonInclude.Include.NON_NULL)
internal class GitlabCreateProjectRequest(
    val name: String,
    val path: String,
    val ciConfigPath: String = ".mlreef.yml",
    val description: String = "",
    val defaultBranch: String = "",
    val visibility: String = "private",
    val initializeWithReadme: Boolean = false,
    val autoDevopsEnabled: Boolean = false,
    val namespaceId: Long? = null,
    val buildTimeout: Int = 18000,
) : Serializable

//https://docs.gitlab.com/ee/api/projects.html#edit-project
@JsonInclude(JsonInclude.Include.NON_NULL)
internal class GitlabUpdateProjectRequest(
    val name: String? = null,
    val description: String? = null,
    val defaultBranch: String? = null,
    val visibility: String? = null,
) : Serializable

// https://docs.gitlab.com/ee/api/projects.html#fork-project
@JsonInclude(JsonInclude.Include.NON_NULL)
internal class GitlabForkProjectRequest(
    /** The ID or URL-encoded path of the project. */
    val id: Long,
    /** The name assigned to the resultant project after forking. */
    val name: String? = null,
    /** The path assigned to the resultant project after forking. */
    val path: String? = null,
    /** The id of the namespace that the project is forked to. */
    val namespaceId: Long? = null,
    /** The path of the namespace that the project is forked to. */
    val namespacePath: String? = null,
) : Serializable {
    init {
        require(name != null || path != null) { "Gitlab API requires either 'name' or 'path' to be provided. name = $name, path = $path" }
    }
}

// https://docs.gitlab.com/ee/api/oauth2.html
internal class GitlabLoginOAuthTokenRequest(
    val grantType: String,
    val username: String,
    val password: String,
) : Serializable

// https://docs.gitlab.com/ee/api/#oauth2-tokens
internal class GitlabOAuthTokenInfoRequest : Serializable

