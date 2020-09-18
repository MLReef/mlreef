package com.mlreef.rest.integration

import com.mlreef.rest.exceptions.BadRequestException
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.exceptions.GitlabAuthenticationFailedException
import com.mlreef.rest.exceptions.GitlabCommonException
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabAccessLevel
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.utils.Slugs
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.annotation.Rollback
import javax.transaction.Transactional

@Suppress("UsePropertyAccessSyntax")
@Transactional
@Rollback
class GitlabRestClientTest : AbstractIntegrationTest() {

    @Autowired
    lateinit var gitlabRestClient: GitlabRestClient
    private lateinit var token: String

    @BeforeEach
    @Transactional
    fun fillRepo() {
        testsHelper.generateProcessorsInDatabase()
        val (_, thatToken, _) = testsHelper.createRealUser()
        token = thatToken
    }

    @AfterEach
    @Transactional
    fun clearRepo() {
        testsHelper.cleanProcessorsInDatabase()
    }

    @Test
    fun `createProject shall return created project`() {
        val (_, token1, _) = testsHelper.createRealUser()
        val createProject = gitlabRestClient.createProject(
            token = token1,
            slug = "unique",
            name = "name",
            description = "description",
            defaultBranch = "master",
            visibility = "public"
        )
        assertThat(createProject).isNotNull
    }

    @Test
    fun `createProject must not accept empty token`() {
        assertThrows<GitlabCommonException> {
            gitlabRestClient.createProject(
                token = "",
                slug = "another",
                name = "another",
                description = "description",
                defaultBranch = "master",
                visibility = "public"
            )
        }
    }

    @Test
    fun `createProject must not accept duplicate slug`() {
        val createProject = createProject(token)
        assertThat(createProject).isNotNull
        assertThrows<GitlabCommonException> {
            createProject("")
        }
    }

    @Test
    fun `userUpdateProject must not accept empty name`() {
        val createProject = createProject(token)
        assertThat(createProject).isNotNull
        assertThrows<BadRequestException> {
            gitlabRestClient.userUpdateProject(
                id = createProject.id,
                token = token,
                name = "",
                visibility = "public"
            )
        }
    }

    @Test
    fun `userUpdateProject must not change visibility`() {
        val createProject = createProject(token)
        assertThat(createProject).isNotNull
        assertThrows<BadRequestException> {
            gitlabRestClient.userUpdateProject(
                id = createProject.id,
                token = token,
                visibility = ""
            )
        }
    }

    @Test
    fun `userUpdateProject should accept to change visibility  often`() {
        val createProject = createProject(token)
        assertThat(createProject).isNotNull

        gitlabRestClient.userUpdateProject(
            id = createProject.id,
            token = token,
            visibility = "public"
        )
        gitlabRestClient.userUpdateProject(
            id = createProject.id,
            token = token,
            visibility = "private"
        )
    }

    @Test
    fun `createBranch should create branch`() {
        val createProject = createProject(token)
        assertThat(createProject).isNotNull
        val createBranch = gitlabRestClient.createBranch(
            token = token,
            projectId = createProject.id,
            targetBranch = "second",
            sourceBranch = "master"
        )
        assertThat(createBranch).isNotNull
    }

    @Test
    fun `createBranch cannot create branch from missing source branch`() {
        val createProject = createProject(token)
        assertThat(createProject).isNotNull

        assertThrows<BadRequestException> {
            gitlabRestClient.createBranch(
                token = token,
                projectId = createProject.id,
                targetBranch = "second",
                sourceBranch = "no"
            )
        }
    }

    @Test
    fun `deleteBranch must not delete master`() {
        val createProject = createProject(token)
        assertThat(createProject).isNotNull
        assertThrows<BadRequestException> {
            gitlabRestClient.deleteBranch(
                token = token,
                projectId = createProject.id,
                targetBranch = "master"
            )
        }
    }

    @Test
    fun `deleteBranch should delete branch`() {
        val createProject = createProject(token)
        assertThat(createProject).isNotNull
        val createBranch = gitlabRestClient.createBranch(
            token = token,
            projectId = createProject.id,
            targetBranch = "second",
            sourceBranch = "master"
        )
        assertThat(createBranch).isNotNull

        gitlabRestClient.deleteBranch(
            token = token,
            projectId = createProject.id,
            targetBranch = "second"
        )
    }

    @Test
    fun `deleteBranch must not delete branch twice`() {
        val createProject = createProject(token)
        assertThat(createProject).isNotNull
        val createBranch = gitlabRestClient.createBranch(
            token = token,
            projectId = createProject.id,
            targetBranch = "second",
            sourceBranch = "master"
        )
        assertThat(createBranch).isNotNull

        gitlabRestClient.deleteBranch(
            token = token,
            projectId = createProject.id,
            targetBranch = "second"
        )

        assertThrows<NotFoundException> {
            gitlabRestClient.deleteBranch(
                token = token,
                projectId = createProject.id,
                targetBranch = "second"
            )
        }
    }

    private fun createProject(
        token: String,
        name: String = "Name " + RandomUtils.generateRandomUserName(20),
        slug: String = Slugs.toSlug("slug-" + name),
        initializeWithReadme: Boolean = true,
        defaultBranch: String = "master"
    ) = gitlabRestClient.createProject(
        token = token,
        slug = slug,
        name = name,
        description = "description",
        defaultBranch = defaultBranch,
        visibility = "public",
        initializeWithReadme = initializeWithReadme
    )

    @Test
    fun `adminGetProjects shall deliver all projects`() {
        val createProject1 = createProject(token)
        val createProject2 = createProject(token)

        val projects = gitlabRestClient.adminGetProjects()
        assertThat(projects).isNotNull
        assertThat(projects.map { it.id }).contains(createProject1.id)
        assertThat(projects.map { it.id }).contains(createProject2.id)
    }

    @Test
    fun `adminGetProject shall deliver certain projects`() {
        val createProject1 = createProject(token)

        val project = gitlabRestClient.adminGetProject(createProject1.id)
        assertThat(project).isNotNull
        assertThat(project).isEqualToIgnoringGivenFields(createProject1, "owner", "namespace", "buildCoverageRegex", "readmeUrl", "avatarUrl")
    }

    @Test
    fun `adminGetProject must not deliver not-existing projects`() {
        assertThrows<NotFoundException> {
            gitlabRestClient.adminGetProject(Long.MAX_VALUE)
        }
    }

    @Test
    fun `adminGetProjectMembers must not deliver for not-existing projects`() {
        assertThrows<NotFoundException> {
            gitlabRestClient.adminGetProjectMembers(Long.MAX_VALUE)
        }
    }

    @Test
    fun `adminGetProjectMembers shall deliver creating user`() {
        val (user1, token1, _) = testsHelper.createRealUser()
        val (_, _, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        val members = gitlabRestClient.adminGetProjectMembers(project1.id)
        assertThat(members).isNotNull
        assertThat(members).hasSize(1)
        assertThat(members.map { it.id }).contains(user1.person.gitlabId!!)
    }

    @Test
    fun `adminGetProjectMember shall deliver owner`() {
        val (user1, token1, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        val member = gitlabRestClient.adminGetProjectMember(project1.id, user1.person.gitlabId!!)
        assertThat(member).isNotNull
        assertThat(member.id).isEqualTo(user1.person.gitlabId!!)
    }

    @Test
    fun `adminGetProjectMember must not deliver unconnected user`() {
        val (_, token1, _) = testsHelper.createRealUser()
        val (user2, _, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        assertThrows<NotFoundException> {
            gitlabRestClient.adminGetProjectMember(project1.id, user2.person.gitlabId!!)
        }
    }

    @Test
    fun `adminAddUserToProject must not accept not-existing user`() {
        val (_, token1, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        assertThrows<NotFoundException> {
            gitlabRestClient.adminAddUserToProject(project1.id, Long.MAX_VALUE)
        }
    }

    @Test
    fun `adminAddUserToProject must not accept already included user`() {
        val (user1, token1, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        assertThrows<ConflictException> {
            gitlabRestClient.adminAddUserToProject(project1.id, user1.person.gitlabId!!)
        }
    }

    @Test
    fun `adminAddUserToProject shall accept existing user`() {
        val (_, token1, _) = testsHelper.createRealUser()
        val (user2, _, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        val member = gitlabRestClient.adminAddUserToProject(project1.id, user2.person.gitlabId!!)
        assertThat(member).isNotNull
        assertThat(member.id).isEqualTo(user2.person.gitlabId!!)
    }

    @Test
    fun `adminEditUserInProject must not accept not-existing user`() {
        val (_, token1, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        assertThrows<NotFoundException> {
            gitlabRestClient.adminEditUserInProject(project1.id, Long.MAX_VALUE)
        }
    }

    @Test
    fun `adminEditUserInProject must not accept already included user`() {
        val (user1, token1, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        assertThrows<GitlabAuthenticationFailedException> {
            gitlabRestClient.adminEditUserInProject(project1.id, user1.person.gitlabId!!)
        }
    }

    @Test
    fun `adminEditUserInProject shall accept existing user`() {
        val (_, token1, _) = testsHelper.createRealUser()
        val (user2, _, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        gitlabRestClient.adminAddUserToProject(project1.id, user2.person.gitlabId!!)

        val member = gitlabRestClient.adminEditUserInProject(project1.id, user2.person.gitlabId!!)
        assertThat(member.id).isEqualTo(user2.person.gitlabId!!)
    }

    @Test
    fun `adminEditUserInProject must not transform owner to guest`() {
        val (user1, token1, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        assertThrows<GitlabAuthenticationFailedException> {
            gitlabRestClient.adminEditUserInProject(project1.id, user1.person.gitlabId!!, accessLevel = GitlabAccessLevel.GUEST)
        }
    }

    @Test
    fun `adminEditUserInProject shall accept multiple conversions`() {
        val (_, token1, _) = testsHelper.createRealUser()
        val (user2, _, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        val member1 = gitlabRestClient.adminAddUserToProject(project1.id, user2.person.gitlabId!!, GitlabAccessLevel.GUEST)
        val member2 = gitlabRestClient.adminEditUserInProject(project1.id, user2.person.gitlabId!!, GitlabAccessLevel.DEVELOPER)
        val member3 = gitlabRestClient.adminEditUserInProject(project1.id, user2.person.gitlabId!!, GitlabAccessLevel.GUEST)
        assertThat(member1.id).isEqualTo(user2.person.gitlabId!!)
        assertThat(member2.id).isEqualTo(user2.person.gitlabId!!)
        assertThat(member3.id).isEqualTo(user2.person.gitlabId!!)
    }

    @Test
    fun `userEditUserInProject must not accept already included user`() {
        val (user1, token1, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        assertThrows<GitlabAuthenticationFailedException> {
            gitlabRestClient.userEditUserInProject(token1, project1.id, user1.person.gitlabId!!)
        }
    }

    @Test
    fun `userEditUserInProject must not accept token of not owner`() {
        val (user1, token1, _) = testsHelper.createRealUser()
        val (_, token2, _) = testsHelper.createRealUser()

        val project1 = createProject(token1)
        assertThrows<GitlabAuthenticationFailedException> {
            gitlabRestClient.userEditUserInProject(token2, project1.id, user1.person.gitlabId!!)
        }
    }

    @Test
    fun `userEditUserInProject shall accept existing user`() {
        val (_, token1, _) = testsHelper.createRealUser()
        val (user2, _, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        gitlabRestClient.adminAddUserToProject(project1.id, user2.person.gitlabId!!)
        val member2 = gitlabRestClient.userEditUserInProject(token1, project1.id, user2.person.gitlabId!!)
        assertThat(member2.id).isEqualTo(user2.person.gitlabId!!)
    }

    @Test
    @Disabled
    fun `userEditUserInProject shall accept change by maintainer`() {
        val (_, token1, _) = testsHelper.createRealUser()
        val (user2, token2, _) = testsHelper.createRealUser()
        val (user3, _, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        gitlabRestClient.adminAddUserToProject(project1.id, user2.person.gitlabId!!, GitlabAccessLevel.MAINTAINER)
        val member2 = gitlabRestClient.userEditUserInProject(token2, project1.id, user3.person.gitlabId!!, GitlabAccessLevel.GUEST)
        assertThat(member2.id).isEqualTo(user3.person.gitlabId!!)
    }

    @Test
    fun `userEditUserInProject must not accept change by guest`() {
        val (_, token1, _) = testsHelper.createRealUser()
        val (user2, token2, _) = testsHelper.createRealUser()
        val (user3, _, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        gitlabRestClient.adminAddUserToProject(project1.id, user2.person.gitlabId!!, GitlabAccessLevel.GUEST)
        assertThrows<GitlabAuthenticationFailedException> {
            gitlabRestClient.userEditUserInProject(token2, project1.id, user3.person.gitlabId!!, GitlabAccessLevel.GUEST)
        }
    }

    @Test
    fun `userEditUserInProject must not transform owner to guest`() {
        val (user1, token1, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        assertThrows<GitlabAuthenticationFailedException> {
            gitlabRestClient.userEditUserInProject(token1, project1.id, user1.person.gitlabId!!, accessLevel = GitlabAccessLevel.GUEST)
        }
    }

    @Test
    fun `userEditUserInProject shall accept multiple conversions`() {
        val (_, token1, _) = testsHelper.createRealUser()
        val (user2, _, _) = testsHelper.createRealUser()
        val project1 = createProject(token1)
        val member1 = gitlabRestClient.adminAddUserToProject(project1.id, user2.person.gitlabId!!, GitlabAccessLevel.GUEST)
        val member2 = gitlabRestClient.userEditUserInProject(token1, project1.id, user2.person.gitlabId!!, GitlabAccessLevel.DEVELOPER)
        val member3 = gitlabRestClient.userEditUserInProject(token1, project1.id, user2.person.gitlabId!!, GitlabAccessLevel.GUEST)
        assertThat(member1.id).isEqualTo(user2.person.gitlabId!!)
        assertThat(member2.id).isEqualTo(user2.person.gitlabId!!)
        assertThat(member3.id).isEqualTo(user2.person.gitlabId!!)
    }
}