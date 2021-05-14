package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.PublishingRequest
import com.mlreef.rest.api.v1.dto.BaseEnvironmentsDto
import com.mlreef.rest.api.v1.dto.CodeProjectPublishingDto
import com.mlreef.rest.testcommons.RestResponsePage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.annotation.Rollback
import javax.transaction.Transactional

class CodeProjectPublishingIntegrationTest : AbstractIntegrationTest() {
    val rootUrl = "/api/v1/code-projects"
    val epfUrl = "/api/v1/epf"

    @BeforeEach
    fun clearRepo() {

    }

    @Transactional
    @Rollback
    @Test
    fun `Can get environments list`() {
        val (_, token1, _) = createRealUser(index = -1)

        val result = this.performGet("$rootUrl/environments", token1)
            .expectOk()
            .returnsList(BaseEnvironmentsDto::class.java)

        val initialSetOfIds = setOf(
            baseEnv1.id,
            baseEnv2.id,
            baseEnv3.id,
        )

        val resultSetOfIds = result.map(BaseEnvironmentsDto::id).toSet()

        assertThat(result.size).isEqualTo(3)
        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can publish code-project`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (project1, _) = createRealCodeProject(token1, account1)

        putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py")

        val request = PublishingRequest(
            path = "main.py",
            environment = baseEnv1.id
        )

        val result = this.performPost("$rootUrl/${project1.id}/publish", token1, request)
            .expectOk()
            .returns(CodeProjectPublishingDto::class.java)

        assertThat(result.scriptPath).isEqualTo("main.py")
        assertThat(result.environment!!.id).isEqualTo(baseEnv1.id)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can unpublish published code-project`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (project1, _) = createRealCodeProject(token1, account1)

        putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py")
        putFileToRepository(token1, project1.gitlabId, "Dockerfile", resourceName = "resnet_annotations_demo.py")
        putFileToRepository(token1, project1.gitlabId, ".mlreef.yml", resourceName = "resnet_annotations_demo.py")

        val processor = createProcessor(project1, branch = "master", version = "0.1")

        // Do unpublish
        val result = this.performPost("$rootUrl/${project1.id}/master/0.1/unpublish", token1)
            .expectOk()
            .returns(CodeProjectPublishingDto::class.java)

        assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can get publish information`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (project1, _) = createRealCodeProject(token1, account1)

        putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py")

        val request = PublishingRequest(
            path = "main.py",
            environment = baseEnv1.id
        )

        // Do regular publish
        val publishResult = this.performPost("$rootUrl/${project1.id}/publish", token1, request)
            .expectOk()
            .returns(CodeProjectPublishingDto::class.java)

        //Request publish infromation
        val result: RestResponsePage<CodeProjectPublishingDto> = this.performGet("$rootUrl/${project1.id}/publish", token1)
            .expectOk()
            .returns()

        assertThat(result.content[0].scriptPath).isEqualTo("main.py")
        assertThat(result.content[0].environment!!.id).isEqualTo(baseEnv1.id)
        assertThat(publishResult.id).isEqualTo(result.content[0].id)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can republish code-project`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (project1, _) = createRealCodeProject(token1, account1)

        putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py")
        putFileToRepository(token1, project1.gitlabId, "main2.py", resourceName = "resnet_annotations_demo.py")

        val processor = createProcessor(project1, branch = "master", version = "0.1")

        //Do republish
        val request2 = PublishingRequest(
            path = "main2.py",
            environment = baseEnv2.id,
            branch = "master",
            version = "0.1",
        )

        val result = this.performPost("$rootUrl/${project1.id}/republish", token1, request2)
            .expectOk()
            .returns(CodeProjectPublishingDto::class.java)

        assertThat(result.scriptPath).isEqualTo("main2.py")
        assertThat(result.environment!!.id).isEqualTo(baseEnv2.id)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot publish published project`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (project1, _) = createRealCodeProject(token1, account1)

        putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py")
        putFileToRepository(token1, project1.gitlabId, "main2.py", resourceName = "resnet_annotations_demo.py")

        val processor = createProcessor(project1, branch = "master", version = "0.1")

        //Do publish again
        val request2 = PublishingRequest(
            path = "main2.py",
            environment = baseEnv2.id,
            branch = "master",
            version = "0.1",
        )

        this.performPost("$rootUrl/${project1.id}/publish", token1, request2)
            .isConflict()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot unpublish notpublished code-project`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (project1, _) = createRealCodeProject(token1, account1)

        // Do unpublish without publish
        this.performPost("$rootUrl/${project1.id}/master/1/unpublish", token1)
            .expect4xx()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can finish publishing code-project`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (project1, _) = createRealCodeProject(token1, account1)

        val branch = "master"

        putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py", branch = branch)
        putFileToRepository(token1, project1.gitlabId, ".mlreef.yml", resourceName = ".mlreef.yml", branch = branch)

        val gitlabPipeline = createRealPipelineInGitlab(project1.gitlabId, branch)

        val processor =
            createProcessor(project1, branch = "master", version = "0.1", published = false, environment = baseEnv1, commitSha = gitlabPipeline.sha)

        //Do finish
        val result = this.performEPFPut(
            processor.secret!!,
            "$epfUrl/code-projects/${project1.id}/publish/finish?branch=master&version=0.1&image=project-super:latest"
        )
            .expectOk()
            .returns(CodeProjectPublishingDto::class.java)

        assertThat(result.scriptPath).isEqualTo("main.py")
        assertThat(result.environment!!.id).isEqualTo(baseEnv1.id)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can finish published project without error`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (project1, _) = createRealCodeProject(token1, account1)

        putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py")

        val processor = createProcessor(project1, branch = "master", version = "0.1", published = true)

        //Do finish
        this.performEPFPut(
            processor.secret!!,
            "$epfUrl/code-projects/${project1.id}/publish/finish?branch=master&version=0.1&image=project-super:latest"
        )
            .expectOk()
    }
}