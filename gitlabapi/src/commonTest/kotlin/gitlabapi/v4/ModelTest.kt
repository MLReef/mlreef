package com.mlreef.gitlabapi.v4

import com.mlreef.gitlabapi.Group
import com.mlreef.gitlabapi.gitlabSerializer
import com.mlreef.runTest
import kotlinx.serialization.ImplicitReflectionSerializer
import kotlinx.serialization.UnstableDefault
import kotlinx.serialization.parseList
import kotlin.test.Test
import kotlin.test.assertEquals

@UnstableDefault
class ModelTest {

    @UseExperimental(ImplicitReflectionSerializer::class)
    @Test fun canGetMultipleGropus() = runTest {
        val groups: List<Group> = gitlabSerializer.parseList(groupsJson)

        assertEquals(actual = groups.size, expected = 2)

        assertEquals(actual = groups[0].id, expected = 5351747)
        assertEquals(actual = groups[0].webUrl, expected = "https://gitlab.com/groups/mlreef")
        assertEquals(actual = groups[0].name, expected = "MLReef")
        assertEquals(actual = groups[0].path, expected = "mlreef")
        assertEquals(
            actual = groups[0].description,
            expected = "MLReef is the awesome unstoppable startup which will disrupt the way machine learning is done."
        )
        assertEquals(actual = groups[0].visibility, expected = "private")
        assertEquals(actual = groups[0].lfsEnabled, expected = true)
        assertEquals(
            actual = groups[0].avatarUrl,
            expected = "https://gitlab.com/uploads/-/system/group/avatar/5351747/MLReef_Logo_POS_H_icon-01.png"
        )
        assertEquals(actual = groups[0].requestAccessEnabled, expected = false)
        assertEquals(actual = groups[0].fullName, expected = "MLReef")
        assertEquals(actual = groups[0].fullPath, expected = "mlreef")
        assertEquals(actual = groups[0].parentId, expected = null)
    }

    @Test fun canGetSingleGroup() = runTest {
        val group: Group = gitlabSerializer.parse(
            Group.serializer(),
            mlreefGroupJson
        )
        assertEquals(actual = group.id, expected = 5351747)
        assertEquals(actual = group.webUrl, expected = "https://gitlab.com/groups/mlreef")
        assertEquals(actual = group.name, expected = "MLReef")
        assertEquals(actual = group.path, expected = "mlreef")
        assertEquals(
            actual = group.description,
            expected = "MLReef is the awesome unstoppable startup which will disrupt the way machine learning is done."
        )
        assertEquals(actual = group.visibility, expected = "private")
        assertEquals(actual = group.lfsEnabled, expected = true)
        assertEquals(
            actual = group.avatarUrl,
            expected = "https://gitlab.com/uploads/-/system/group/avatar/5351747/MLReef_Logo_POS_H_icon-01.png"
        )
        assertEquals(actual = group.requestAccessEnabled, expected = false)
        assertEquals(actual = group.fullName, expected = "MLReef")
        assertEquals(actual = group.fullPath, expected = "mlreef")
        assertEquals(actual = group.parentId, expected = null)
    }
}

internal val mlreefGroupJson: String = """
    |{
    |  id: 5351747,
    |  web_url: "https://gitlab.com/groups/mlreef",
    |  name: "MLReef",
    |  path: "mlreef",
    |  description: "MLReef is the awesome unstoppable startup which will disrupt the way machine learning is done.",
    |  visibility: "private",
    |  lfs_enabled: true,
    |  avatar_url: "https://gitlab.com/uploads/-/system/group/avatar/5351747/MLReef_Logo_POS_H_icon-01.png",
    |  request_access_enabled: false,
    |  full_name: "MLReef",
    |  full_path: "mlreef",
    |  parent_id: null,
    |  projects: [
    |  {
    |  id: 12894267,
    |  description: "The MLReef user which allows access to the repositories and the machine learning functions",
    |  name: "frontend",
    |  name_with_namespace: "MLReef / frontend",
    |  path: "frontend",
    |  path_with_namespace: "mlreef/frontend",
    |  created_at: "2019-06-17T09:45:19.994Z",
    |  default_branch: "master",
    |  tag_list: [ ],
    |  ssh_url_to_repo: "git@gitlab.com:mlreef/frontend.git",
    |  http_url_to_repo: "https://gitlab.com/mlreef/frontend.git",
    |web_url: "https://gitlab.com/mlreef/frontend",
    |readme_url: null,
    |avatar_url: "https://gitlab.com/uploads/-/system/project/avatar/12894267/100-clip-mac-2.png",
    |star_count: 0,
    |forks_count: 0,
    |last_activity_at: "2019-07-04T14:36:56.019Z",
    |namespace: {
    |id: 5351747,
    |name: "MLReef",
    |path: "mlreef",
    |kind: "group",
    |full_path: "mlreef",
    |parent_id: null,
    |avatar_url: "https://gitlab.com/uploads/-/system/group/avatar/5351747/MLReef_Logo_POS_H_icon-01.png",
    |web_url: "https://gitlab.com/groups/mlreef"
    |},
    |_links: {
    |self: "https://gitlab.com/api/v4/projects/12894267",
    |issues: "https://gitlab.com/api/v4/projects/12894267/issues",
    |merge_requests: "https://gitlab.com/api/v4/projects/12894267/merge_requests",
    |repo_branches: "https://gitlab.com/api/v4/projects/12894267/repository/branches",
    |labels: "https://gitlab.com/api/v4/projects/12894267/labels",
    |events: "https://gitlab.com/api/v4/projects/12894267/events",
    |members: "https://gitlab.com/api/v4/projects/12894267/members"
    |},
    |empty_repo: false,
    |archived: false,
    |visibility: "private",
    |resolve_outdated_diff_discussions: false,
    |container_registry_enabled: true,
    |issues_enabled: true,
    |merge_requests_enabled: true,
    |wiki_enabled: true,
    |jobs_enabled: true,
    |snippets_enabled: true,
    |shared_runners_enabled: true,
    |lfs_enabled: true,
    |creator_id: 4009135,
    |import_status: "none",
    |open_issues_count: 16,
    |ci_default_git_depth: 50,
    |public_jobs: true,
    |ci_config_path: null,
    |shared_with_groups: [ ],
    |only_allow_merge_if_pipeline_succeeds: false,
    |request_access_enabled: false,
    |only_allow_merge_if_all_discussions_are_resolved: false,
    |printing_merge_request_link_enabled: true,
    |merge_method: "merge",
    |external_authorization_classification_label: "",
    |mirror: false
    |},
    |{
    |id: 12395599,
    |description: "",
    |name: "demo",
    |name_with_namespace: "MLReef / demo",
    |path: "mlreef-demo",
    |path_with_namespace: "mlreef/mlreef-demo",
    |created_at: "2019-05-18T09:34:29.346Z",
    |default_branch: "master",
    |tag_list: [ ],
    |ssh_url_to_repo: "git@gitlab.com:mlreef/mlreef-demo.git",
    |http_url_to_repo: "https://gitlab.com/mlreef/mlreef-demo.git",
    |web_url: "https://gitlab.com/mlreef/mlreef-demo",
    |readme_url: "https://gitlab.com/mlreef/mlreef-demo/blob/master/README.md",
    |avatar_url: "https://gitlab.com/uploads/-/system/project/avatar/12395599/shutterstock_129655604-Converted-copy-text.png",
    |star_count: 2,
    |forks_count: 0,
    |last_activity_at: "2019-06-17T10:06:59.690Z",
    |namespace: {
    |id: 5351747,
    |name: "MLReef",
    |path: "mlreef",
    |kind: "group",
    |full_path: "mlreef",
    |parent_id: null,
    |avatar_url: "https://gitlab.com/uploads/-/system/group/avatar/5351747/MLReef_Logo_POS_H_icon-01.png",
    |web_url: "https://gitlab.com/groups/mlreef"
    |},
    |_links: {
    |self: "https://gitlab.com/api/v4/projects/12395599",
    |issues: "https://gitlab.com/api/v4/projects/12395599/issues",
    |merge_requests: "https://gitlab.com/api/v4/projects/12395599/merge_requests",
    |repo_branches: "https://gitlab.com/api/v4/projects/12395599/repository/branches",
    |labels: "https://gitlab.com/api/v4/projects/12395599/labels",
    |events: "https://gitlab.com/api/v4/projects/12395599/events",
    |members: "https://gitlab.com/api/v4/projects/12395599/members"
    |},
    |empty_repo: false,
    |archived: false,
    |visibility: "private",
    |resolve_outdated_diff_discussions: false,
    |container_registry_enabled: true,
    |issues_enabled: true,
    |merge_requests_enabled: true,
    |wiki_enabled: true,
    |jobs_enabled: true,
    |snippets_enabled: true,
    |shared_runners_enabled: false,
    |lfs_enabled: true,
    |creator_id: 3839940,
    |import_status: "none",
    |open_issues_count: 5,
    |ci_default_git_depth: null,
    |public_jobs: true,
    |ci_config_path: null,
    |shared_with_groups: [ ],
    |only_allow_merge_if_pipeline_succeeds: false,
    |request_access_enabled: false,
    |only_allow_merge_if_all_discussions_are_resolved: false,
    |printing_merge_request_link_enabled: true,
    |merge_method: "merge",
    |external_authorization_classification_label: "",
    |mirror: false
    |},
    |{
    |id: 12339780,
    |description: "",
    |name: "backend",
    |name_with_namespace: "MLReef / backend",
    |path: "mlreef",
    |path_with_namespace: "mlreef/mlreef",
    |created_at: "2019-05-15T08:54:25.784Z",
    |default_branch: "master",
    |tag_list: [ ],
    |ssh_url_to_repo: "git@gitlab.com:mlreef/mlreef.git",
    |http_url_to_repo: "https://gitlab.com/mlreef/mlreef.git",
    |web_url: "https://gitlab.com/mlreef/mlreef",
    |readme_url: "https://gitlab.com/mlreef/mlreef/blob/master/README.md",
    |avatar_url: "https://gitlab.com/uploads/-/system/project/avatar/12339780/images.jpg",
    |star_count: 2,
    |forks_count: 0,
    |last_activity_at: "2019-07-01T10:32:51.032Z",
    |namespace: {
    |id: 5351747,
    |name: "MLReef",
    |path: "mlreef",
    |kind: "group",
    |full_path: "mlreef",
    |parent_id: null,
    |avatar_url: "https://gitlab.com/uploads/-/system/group/avatar/5351747/MLReef_Logo_POS_H_icon-01.png",
    |web_url: "https://gitlab.com/groups/mlreef"
    |},
    |_links: {
    |self: "https://gitlab.com/api/v4/projects/12339780",
    |issues: "https://gitlab.com/api/v4/projects/12339780/issues",
    |merge_requests: "https://gitlab.com/api/v4/projects/12339780/merge_requests",
    |repo_branches: "https://gitlab.com/api/v4/projects/12339780/repository/branches",
    |labels: "https://gitlab.com/api/v4/projects/12339780/labels",
    |events: "https://gitlab.com/api/v4/projects/12339780/events",
    |members: "https://gitlab.com/api/v4/projects/12339780/members"
    |},
    |empty_repo: false,
    |archived: false,
    |visibility: "private",
    |resolve_outdated_diff_discussions: false,
    |container_registry_enabled: true,
    |issues_enabled: true,
    |merge_requests_enabled: true,
    |wiki_enabled: true,
    |jobs_enabled: true,
    |snippets_enabled: true,
    |shared_runners_enabled: true,
    |lfs_enabled: true,
    |creator_id: 3839940,
    |import_status: "none",
    |open_issues_count: 5,
    |ci_default_git_depth: null,
    |public_jobs: true,
    |ci_config_path: null,
    |shared_with_groups: [ ],
    |only_allow_merge_if_pipeline_succeeds: false,
    |request_access_enabled: false,
    |only_allow_merge_if_all_discussions_are_resolved: false,
    |printing_merge_request_link_enabled: true,
    |merge_method: "merge",
    |external_authorization_classification_label: "",
    |mirror: false
    |}
    |],
    |shared_projects: [ ],
    |ldap_cn: null,
    |ldap_access: null,
    |shared_runners_minutes_limit: null,
    |extra_shared_runners_minutes_limit: null
    |}
    """.trimMargin()

internal val groupsJson: String = """
    |[
    |  {
    |    "id":5351747,
    |    "web_url":"https://gitlab.com/groups/mlreef",
    |    "name":"MLReef",
    |    "path":"mlreef",
    |    "description":"MLReef is the awesome unstoppable startup which will disrupt the way machine learning is done.",
    |    "visibility":"private",
    |    "lfs_enabled":true,
    |    "avatar_url":"https://gitlab.com/uploads/-/system/group/avatar/5351747/MLReef_Logo_POS_H_icon-01.png",
    |    "request_access_enabled":false,
    |    "full_name":"MLReef",
    |    "full_path":"mlreef",
    |    "parent_id":null,
    |    "ldap_cn":null,
    |    "ldap_access":null
    |  },
    |  {
    |    "id":5351743,
    |    "web_url":"https://gitlab.com/groups/systemkern",
    |    "name":"systemkern","path":"systemkern",
    |    "description":"Systemkern SaaS Solutions",
    |    "visibility":"private",
    |    "lfs_enabled":true,
    |    "avatar_url":null,
    |    "request_access_enabled":false,
    |    "full_name":"systemkern",
    |    "full_path":"systemkern",
    |    "parent_id":null,
    |    "ldap_cn":null,
    |    "ldap_access":null
    |  }
    |]
    """.trimMargin()
