package com.mlreef.rest.external_api.gitlab

import com.fasterxml.jackson.annotation.JsonAutoDetect
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonValue
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

@JsonIgnoreProperties(ignoreUnknown = true)
class GitlabUserToken(
    val id: Int,
    val revoked: Boolean,
    val scopes: List<String> = listOf(),
    val token: String,
    val name: String,
    val active: Boolean = false,
    val impersonation: Boolean = false,
    val createdAt: String? = "",
    val expiresAt: String? = ""
) : Serializable

//https://docs.gitlab.com/ee/api/groups.html#new-group
internal class GitlabCreateGroupRequest(
    val name: String,
    val path: String
) : Serializable


@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonInclude(JsonInclude.Include.NON_NULL)
class GitlabGroup(
    val id: Int,
    val webUrl: String,
    val name: String,
    val path: String,
    val description: String = "",
    val visibility: GitlabVisibility = GitlabVisibility.PRIVATE,
    val shareWithGroupLock: Boolean = false,
    val requireTwoFactorAuthentication: Boolean = false,
    val twoFactorGracePeriod: Int = 48,
    val projectCreationLevel: ProjectCreationLevel = ProjectCreationLevel.DEVELOPER,
    val autoDevopsEnabled: Boolean? = null,
    val subgroupCreationLevel: SubgroupCreationLevel = SubgroupCreationLevel.MAINTAINER,
    val emailsDisabled: Boolean? = null,
    val lfsEnabled: Boolean = true,
    val avatarUrl: String? = null,
    val requestAccessEnabled: Boolean = true,
    val fullName: String = "",
    val fullPath: String = "",
    val parentId: Int? = null
    //TODO: There are two fields missing: projects and shared_projects. Need to know wherever ignore them or not
) : Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonInclude(JsonInclude.Include.NON_NULL)
class GitlabUserInGroup(
    val id: Int,
    val webUrl: String,
    val name: String,
    val username: String,
    val state: GitlabActivityState = GitlabActivityState.ACTIVE,
    val avatarUrl: String = "",
    val accessLevel: GroupAccessLevel = GroupAccessLevel.DEVELOPER,
    val expiresAt: String? = null
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

@JsonIgnoreProperties(ignoreUnknown = true)
class Branch(
    val branch: String = "",
    val ref: String = ""
) : Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
class Commit(
    val authorEmail: String = "",
    val authorName: String = "",
    val authoredDate: String = "",
    val committerEmail: String = "",
    val committerName: String = "",
    val committedDate: String = "",
    val title: String = "",
    val message: String = "",
    val id: String = "",
    val shortId: String = "",
    val status: String? = null,
    val stats: CommitStats? = null
) : Serializable

// https://docs.gitlab.com/ee/api/projects.html#create-project
@JsonInclude(JsonInclude.Include.NON_NULL)
internal class GitlabCreateProjectRequest(
    val name: String,
    val path: String? = null
) : Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
class GitlabProject(
    val id: Long,
    val name: String,
    val nameWithNamespace: String?,
    val path: String,
    val pathWithNamespace: String,
    val owner: GitlabUser,
    val creatorId: Long,
    val createdAt: String = "",
    val description: String? = null,
    val defaultBranch: String? = null,
    val tagList: List<String> = listOf(),
    val sshUrlToRepo: String = "",
    val httpUrlToRepo: String = "",
    val webUrl: String = "",
    val readmeUrl: String? = null,
    val avatarUrl: String? = null,
    val starCount: Long = 0,
    val forksCount: Long = 0,
    val lastActivityAt: String? = null,
    val namespace: GitlabNamespace? = null,
    @JsonProperty("_links")
    val links: Map<String, String> = mapOf(),
    val emptyRepo: Boolean = true,
    val archived: Boolean = true,
    val visibility: GitlabVisibility = GitlabVisibility.INTERNAL,
    val resolveOutdatedDiffDiscussions: Boolean = false,
    val containerRegistryEnabled: Boolean = true,
    val issuesEnabled: Boolean = true,
    val mergeRequestsEnabled: Boolean = true,
    val wikiEnabled: Boolean = true,
    val jobsEnabled: Boolean = true,
    val snippetsEnabled: Boolean = true,
    val issuesAccessLevel: GitlabAccessLevel = GitlabAccessLevel.ENABLED,
    val repositoryAccessLevel: GitlabAccessLevel = GitlabAccessLevel.ENABLED,
    val merge_requestsAccessLevel: GitlabAccessLevel = GitlabAccessLevel.ENABLED,
    val wikiAccessLevel: GitlabAccessLevel = GitlabAccessLevel.ENABLED,
    val buildsAccessLevel: GitlabAccessLevel = GitlabAccessLevel.ENABLED,
    val snippetsAccessLevel: GitlabAccessLevel = GitlabAccessLevel.ENABLED,
    val sharedRunnersEnabled: Boolean = true,
    val lfsEnabled: Boolean = true,
    val importStatus: String? = null,
    val importError: String? = null,
    val openIssuesCount: Int = 0,
    val runnersToken: String? = null,
    val ciDefaultGitDepth: Int = 0,
    val publicJobs: Boolean = true,
    val buildGitStrategy: GitStrategy = GitStrategy.FETCH,
    val buildTimeout: Long = 0,
    val autoCancelPendingPipelines: GitlabState = GitlabState.ENABLED,
    val buildCoverageRegex: String? = null,
    val ciConfigPath: String? = null,
    val sharedWithGroups: List<SharedGroup> = listOf(),
    val onlyAllowMergeIfPipelineSucceeds: Boolean = false,
    val requestAccessEnabled: Boolean = true,
    val onlyAllowMergeIfAllDiscussionsAreResolved: Boolean = false,
    val removeSourceBranchAfterMerge: Boolean = true,
    val printingMergeRequestLinkEnabled: Boolean = true,
    val mergeMethod: MergeMethod = MergeMethod.MERGE,
    val autoDevopsEnabled: Boolean = true,
    val autoDevopsDeployStrategy: DeployStrategy = DeployStrategy.CONTINUOUS
)

@JsonIgnoreProperties(ignoreUnknown = true)
class GitlabNamespace(
    val id: Long,
    val name: String,
    val path: String,
    val kind: NamespaceKind = NamespaceKind.USER,
    val fullPath: String = "",
    val parentId: Long? = null,
    val avatarUrl: String? = null,
    val webUrl: String? = null
)

class SharedGroup(
    val groupId: Long,
    val groupName: String,
    val groupFullPath: String? = null,
    val groupAccessLevel: GroupAccessLevel = GroupAccessLevel.DEVELOPER
)

@JsonIgnoreProperties(ignoreUnknown = true)
class CommitStats(
    val additions: Int,
    val deletions: Int,
    val total: Int
) : Serializable

// https://docs.gitlab.com/ee/api/group_level_variables.html#create-variable
internal class GitlabCreateGroupVariableRequest(
    val key: String,
    val value: String,
    val variableType: VariableType = VariableType.ENV_VAR,
    val protected: Boolean = false
) : Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonInclude(JsonInclude.Include.NON_NULL)
class GroupVariable(
    val key: String,
    val variableType: VariableType = VariableType.ENV_VAR,
    val value: String? = null,
    val protected: Boolean = false
) : Serializable

enum class GroupAccessLevel(val accessCode: Int) {
    GUEST(10),
    REPORTER(20),
    DEVELOPER(30),
    MAINTAINER(40),
    OWNER(50);

    companion object {
        @JvmStatic
        @JsonCreator
        fun fromCode(code: Int?): GroupAccessLevel? {
            return values().firstOrNull { it.accessCode == code }
        }
    }
}

enum class VariableType {
    ENV_VAR,
    FILE;

    @JsonValue
    open fun getValue(): String {
        return this.name.toLowerCase()
    }
}

enum class GitlabVisibility {
    PRIVATE,
    INTERNAL,
    PUBLIC
}

enum class ProjectCreationLevel {
    NOONE,
    MAINTAINER,
    DEVELOPER
}

enum class SubgroupCreationLevel {
    OWNER,
    MAINTAINER
}

enum class GitlabActivityState {
    ACTIVE,
    INACTIVE
}

enum class GitlabAccessLevel {
    DISABLED,
    PRIVATE,
    ENABLED
}

enum class NamespaceKind {
    USER,
    GROUP
}

enum class GitStrategy {
    FETCH,
    MERGE
}

enum class GitlabState {
    ENABLED,
    DISABLED
}

enum class MergeMethod {
    MERGE,
    REBASE_MERGE,
    FF
}

enum class DeployStrategy {
    CONTINUOUS,
    MANUAL,
    TIMED_INCREMENTAL
}



