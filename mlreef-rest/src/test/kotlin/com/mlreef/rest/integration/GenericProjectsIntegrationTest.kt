package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.testcommons.RestResponsePage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.test.annotation.Rollback
import java.util.UUID
import javax.transaction.Transactional

class GenericProjectsIntegrationTest : AbstractIntegrationTest() {

    val rootUrl = "/api/v1/projects"

    @BeforeEach
    @AfterEach
    fun setUp() {
        this.publicProjectRepository.deleteAll()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all own DataProjects and CodeProjects only`() {
        val (account1, _, _) = testsHelper.createRealUser()
        val (codeProject1, _) = testsHelper.createRealCodeProject(account1)
        val (codeProject2, _) = testsHelper.createRealCodeProject(account1)
        val (codeProject3, _) = testsHelper.createRealCodeProject(account1)

        val (dataProject1, _) = testsHelper.createRealDataProject(account1)
        val (dataProject2, _) = testsHelper.createRealDataProject(account1)

        val (account2, _, _) = testsHelper.createRealUser()
        val (_, _) = testsHelper.createRealCodeProject(account2)
        val (_, _) = testsHelper.createRealCodeProject(account2)

        val (_, _) = testsHelper.createRealDataProject(account2)

        val result = this.performGet(rootUrl, account1)
            .expectOk()
            .returnsList(ProjectDto::class.java)

        assertThat(result.size).isEqualTo(5)

        val initialSetOfIds = setOf<UUID>(
            codeProject1.id,
            codeProject2.id,
            codeProject3.id,
            dataProject1.id,
            dataProject2.id
        )

        val initialSetOfSlug = setOf<String>(
            codeProject1.slug,
            codeProject2.slug,
            codeProject3.slug,
            dataProject1.slug,
            dataProject2.slug
        )

        val resultSetOfIds = result.map(ProjectDto::id).toSet()

        assertThat(resultSetOfIds).containsExactlyInAnyOrder(*initialSetOfIds.toTypedArray())
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabPath).isIn(initialSetOfSlug)
        assertThat(result.get(1).id).isIn(initialSetOfIds)
        assertThat(result.get(1).gitlabPath).isIn(initialSetOfSlug)
        assertThat(result.get(2).id).isIn(initialSetOfIds)
        assertThat(result.get(2).gitlabPath).isIn(initialSetOfSlug)
        assertThat(result.get(3).id).isIn(initialSetOfIds)
        assertThat(result.get(3).gitlabPath).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own DataProject by id`() {
        val (account1, _, _) = testsHelper.createRealUser()
        val (_, _) = testsHelper.createRealCodeProject(account1)
        val (_, _) = testsHelper.createRealCodeProject(account1)
        val (_, _) = testsHelper.createRealCodeProject(account1)

        val (dataProject1, _) = testsHelper.createRealDataProject(account1)
        val (_, _) = testsHelper.createRealDataProject(account1)

        val url = "$rootUrl/${dataProject1.id}"

        val result = this.performGet(url, account1)
            .expectOk()
            .returns(ProjectDto::class.java)

        assertThat(result.id).isEqualTo(dataProject1.id)
        assertThat(result.gitlabPath).isEqualTo(dataProject1.slug)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own CodeProject by id`() {
        val (account1, _, _) = testsHelper.createRealUser()
        val (codeProject1, _) = testsHelper.createRealCodeProject(account1)
        val (_, _) = testsHelper.createRealCodeProject(account1)
        val (_, _) = testsHelper.createRealCodeProject(account1)

        val (_, _) = testsHelper.createRealDataProject(account1)
        val (_, _) = testsHelper.createRealDataProject(account1)

        val url = "$rootUrl/${codeProject1.id}"

        val result = this.performGet(url, account1)
            .expectOk()
            .returns(ProjectDto::class.java)

        assertThat(result.id).isEqualTo(codeProject1.id)
        assertThat(result.gitlabPath).isEqualTo(codeProject1.slug)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own DataProjects and CodeProjects by slug`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (dataProject1, _) = testsHelper.createRealDataProject(account1, slug = "slug-1", public = false)
        val (_, _) = testsHelper.createRealDataProject(account1)
        val (_, _) = testsHelper.createRealCodeProject(account1)

        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (codeProject21, _) = testsHelper.createRealCodeProject(account2, slug = "slug-1", public = false)
        val (_, _) = testsHelper.createRealDataProject(account2)

        val (account3, _, _) = testsHelper.createRealUser(index = -1)
        val (_, _) = testsHelper.createRealDataProject(account3, slug = "slug-1", public = false)
        val (_, _) = testsHelper.createRealCodeProject(account3)

        testsHelper.addRealUserToProject(codeProject21.gitlabId, account1.person.gitlabId!!)

        val url = "$rootUrl/slug/${dataProject1.slug}"

        val result = this.performGet(url, account1)
            .expectOk()
            .returnsList(ProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)

        val initialSetOfIds = setOf<UUID>(
            dataProject1.id,
            codeProject21.id
        )

        val initialSetOfSlug = setOf<String>(
            dataProject1.slug,
            codeProject21.slug
        )

        val resultSetOfIds = result.map(ProjectDto::id).toSet()

        assertThat(resultSetOfIds).containsExactlyInAnyOrder(*initialSetOfIds.toTypedArray())

        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabPath).isIn(initialSetOfSlug)
        assertThat(result.get(1).id).isIn(initialSetOfIds)
        assertThat(result.get(1).gitlabPath).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve not own but member DataProject by namespace`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        val (dataProject1, _) = testsHelper.createRealDataProject(account1, public = false)
        val (_, _) = testsHelper.createRealCodeProject(account1, public = false)
        val (_, _) = testsHelper.createRealDataProject(account1, public = false)

        testsHelper.addRealUserToProject(dataProject1.gitlabId, account2.person.gitlabId!!)

        val (_, _) = testsHelper.createRealDataProject(account2, namespace = dataProject1.gitlabNamespace, public = false)
        val (_, _) = testsHelper.createRealCodeProject(account2, namespace = dataProject1.gitlabNamespace, public = false)

        val url = "$rootUrl/namespace/${dataProject1.gitlabNamespace}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returnsList(ProjectDto::class.java)

        assertThat(result.size).isEqualTo(1)

        val initialSetOfIds = setOf<UUID>(
            dataProject1.id
        )

        val initialSetOfSlug = setOf<String>(
            dataProject1.slug
        )

        val resultSetOfIds = result.map(ProjectDto::id).toSet()

        assertThat(resultSetOfIds).containsExactlyInAnyOrder(*resultSetOfIds.toTypedArray())
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabPath).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test
    /**
     * Not sure this Tests works as expected..
     * Why should it public? why not own?
     *
     *
     */
    @Disabled
    fun `Can retrieve not own not member but public DataProject by namespace`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        val (dataProject1, _) = testsHelper.createRealDataProject(account1, public = true)
        val (codeProject2, _) = testsHelper.createRealCodeProject(account1, public = true)
        val (dataProject3, _) = testsHelper.createRealDataProject(account1, public = false)
        val (dataProject4, _) = testsHelper.createRealDataProject(account1, public = true)
        val (codeProject5, _) = testsHelper.createRealCodeProject(account1, public = false)

        //Pay attention that the namespace is not being taken. It's inaccessible to another user
        val (_, _) = testsHelper.createRealDataProject(account2, namespace = dataProject1.gitlabNamespace, public = false)
        val (_, _) = testsHelper.createRealCodeProject(account2, namespace = dataProject1.gitlabNamespace, public = false)

        val url = "$rootUrl/namespace/${dataProject1.gitlabNamespace}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returnsList(ProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)

        val initialSetOfIds = setOf<UUID>(
            dataProject1.id,
            codeProject2.id,
            dataProject4.id
        )

        val notReturnedSetOfIds = setOf<UUID>(
            dataProject3.id,
            codeProject5.id
        )

        val initialSetOfSlug = setOf<String>(
            dataProject1.slug,
            codeProject2.slug,
            dataProject4.slug
        )

        val resultSetOfIds = result.map(ProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(resultSetOfIds)
        assertThat(resultSetOfIds).doesNotContain(*notReturnedSetOfIds.toTypedArray())
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabPath).isIn(initialSetOfSlug)
        assertThat(result.get(1).id).isIn(initialSetOfIds)
        assertThat(result.get(1).gitlabPath).isIn(initialSetOfSlug)
        assertThat(result.get(2).id).isIn(initialSetOfIds)
        assertThat(result.get(2).gitlabPath).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test

    fun `Can retrieve specific own DataProject by namespace and slug`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        val (project1, _) = testsHelper.createRealDataProject(account1)
        val (_, _) = testsHelper.createRealDataProject(account1)
        val (_, _) = testsHelper.createRealDataProject(account1)

        testsHelper.addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (_, _) = testsHelper.createRealDataProject(account2, slug = "slug-1", namespace = project1.gitlabNamespace)
        val (_, _) = testsHelper.createRealDataProject(account2)

        val url = "$rootUrl/${project1.gitlabNamespace}/${project1.slug}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returns(ProjectDto::class.java)

        assertThat(result.id).isEqualTo(project1.id)
        assertThat(result.gitlabPath).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test

    fun `Can retrieve specific own CodeProject by namespace and slug`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        val (project1, _) = testsHelper.createRealCodeProject(account1)
        val (_, _) = testsHelper.createRealCodeProject(account1)
        val (_, _) = testsHelper.createRealCodeProject(account1)

        testsHelper.addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (_, _) = testsHelper.createRealCodeProject(account2, slug = "slug-1", namespace = project1.gitlabNamespace)
        val (_, _) = testsHelper.createRealCodeProject(account2)

        val url = "$rootUrl/${project1.gitlabNamespace}/${project1.slug}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returns(ProjectDto::class.java)

        assertThat(result.id).isEqualTo(project1.id)
        assertThat(result.gitlabPath).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test

    fun `Cannot retrieve not own not public Project`() {
        val (account1, _, _) = testsHelper.createRealUser()

        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (project21, _) = testsHelper.createRealCodeProject(account2, public = false)

        val url = "$rootUrl/${project21.id}"

        this.performGet(url, account1)
            .expectForbidden()
    }

    @Transactional
    @Rollback
    @Test
    @Disabled
    fun `Can retrieve not own but public Project`() {
        val (account1, _, _) = testsHelper.createRealUser()

        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (project21, _) = testsHelper.createRealCodeProject(account1, public = true)

        val url = "$rootUrl/${project21.id}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returns(ProjectDto::class.java)

        assertThat(result.id).isEqualTo(project21.id)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all public projects as Visitor`() {
        val (account, _, _) = testsHelper.createRealUser(index = -1)
        val (dataProject1, _) = testsHelper.createRealDataProject(account, slug = "slug1")
        val (_, _) = testsHelper.createRealDataProject(account, slug = "slug2", public = false)
        val (dataProject3, _) = testsHelper.createRealDataProject(account, slug = "slug3")
        val (_, _) = testsHelper.createRealDataProject(account, slug = "slug4", public = false)
        val (dataProject5, _) = testsHelper.createRealDataProject(account, slug = "slug5")

        val result: RestResponsePage<ProjectDto> = this.performGet("$rootUrl/public?size=1000")
            .expectOk()
            .returns()

        val initialSetOfIds = setOf<UUID>(
            dataProject1.id,
            dataProject3.id,
            dataProject5.id
        )

        val resultSetOfIds = result.content.map(ProjectDto::id).toSet()

        assertThat(result.numberOfElements).isEqualTo(3)
        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
    }

    @Transactional
    @Rollback
    @Test

    fun `Cannot retrieve user's private project as Visitor`() {
        val (account, _, _) = testsHelper.createRealUser(index = -1)
        val (dataProject1, _) = testsHelper.createRealDataProject(account, slug = "slug1", public = false)

        this.performGet("$rootUrl/${dataProject1.id}")
            .expectForbidden()
    }
}
