package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.PublishingRequest
import com.mlreef.rest.api.v1.dto.BaseEnvironmentsDto
import com.mlreef.rest.api.v1.dto.CodeProjectPublishingDto
import com.mlreef.rest.api.v1.dto.CommitDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.annotation.Rollback
import javax.transaction.Transactional
import kotlin.random.Random

class CodeProjectPublishingIntegrationTest : AbstractIntegrationTest() {
    val rootUrl = "/api/v1/code-projects"

    @BeforeEach
    fun clearRepo() {
        testsHelper.cleanEnvironments()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can get environments list`() {
        val (_, token1, _) = testsHelper.createRealUser(index = -1)

        val env1 = testsHelper.createBaseEnvironment("Env-${Random.nextInt()}")
        val env2 = testsHelper.createBaseEnvironment("Env-${Random.nextInt()}")
        val env3 = testsHelper.createBaseEnvironment("Env-${Random.nextInt()}")

        val result = this.performGet("$rootUrl/environments", token1)
            .expectOk()
            .returnsList(BaseEnvironmentsDto::class.java)

        val initialSetOfIds = setOf(
            env1.id,
            env2.id,
            env3.id,
        )

        val resultSetOfIds = result.map(BaseEnvironmentsDto::id).toSet()

        assertThat(result.size).isEqualTo(3)
        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can publish code-project`() {
        val (account1, token1, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealCodeProject(token1, account1)

        testsHelper.putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py")

        val env = testsHelper.createBaseEnvironment("Env-${Random.nextInt()}")

        val request = PublishingRequest(
            path = "main.py",
            environment = env.id
        )

        val result = this.performPost("$rootUrl/${project1.id}/publish", token1, request)
            .expectOk()
            .returns(CodeProjectPublishingDto::class.java)

        assertThat(result.path).isEqualTo("main.py")
        assertThat(result.environment!!.id).isEqualTo(env.id)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can unpublish published code-project`() {
        val (account1, token1, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealCodeProject(token1, account1)

        testsHelper.putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py")

        val env = testsHelper.createBaseEnvironment("Env-${Random.nextInt()}")

        val request = PublishingRequest(
            path = "main.py",
            environment = env.id
        )

        // Do regular publish
        this.performPost("$rootUrl/${project1.id}/publish", token1, request).expectOk()

        // Do unpublish
        val result = this.performPost("$rootUrl/${project1.id}/unpublish", token1)
            .expectOk()
            .returns(CommitDto::class.java)

        assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can get publish information`() {
        val (account1, token1, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealCodeProject(token1, account1)

        testsHelper.putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py")

        val env = testsHelper.createBaseEnvironment("Env-${Random.nextInt()}")

        val request = PublishingRequest(
            path = "main.py",
            environment = env.id
        )

        // Do regular publish
        this.performPost("$rootUrl/${project1.id}/publish", token1, request).expectOk()

        //Request publish infromation
        val result = this.performGet("$rootUrl/${project1.id}/publish", token1)
            .expectOk()
            .returns(CodeProjectPublishingDto::class.java)

        assertThat(result.path).isEqualTo("main.py")
        assertThat(result.environment!!.id).isEqualTo(env.id)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can republish code-project`() {
        val (account1, token1, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealCodeProject(token1, account1)

        testsHelper.putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py")
        testsHelper.putFileToRepository(token1, project1.gitlabId, "main2.py", resourceName = "resnet_annotations_demo.py")

        val env1 = testsHelper.createBaseEnvironment("Env-${Random.nextInt()}")
        val env2 = testsHelper.createBaseEnvironment("Env-${Random.nextInt()}")

        val request1 = PublishingRequest(
            path = "main.py",
            environment = env1.id
        )

        // Do regular publish
        this.performPost("$rootUrl/${project1.id}/publish", token1, request1).expectOk()

        //Do republish
        val request2 = PublishingRequest(
            path = "main2.py",
            environment = env2.id
        )

        val result = this.performPost("$rootUrl/${project1.id}/republish", token1, request2)
            .expectOk()
            .returns(CodeProjectPublishingDto::class.java)

        assertThat(result.path).isEqualTo("main2.py")
        assertThat(result.environment!!.id).isEqualTo(env2.id)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot publish published project`() {
        val (account1, token1, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealCodeProject(token1, account1)

        testsHelper.putFileToRepository(token1, project1.gitlabId, "main.py", resourceName = "resnet_annotations_demo.py")
        testsHelper.putFileToRepository(token1, project1.gitlabId, "main2.py", resourceName = "resnet_annotations_demo.py")

        val env1 = testsHelper.createBaseEnvironment("Env-${Random.nextInt()}")
        val env2 = testsHelper.createBaseEnvironment("Env-${Random.nextInt()}")

        val request1 = PublishingRequest(
            path = "main.py",
            environment = env1.id
        )

        // Do regular publish
        this.performPost("$rootUrl/${project1.id}/publish", token1, request1).expectOk()

        //Do publish again
        val request2 = PublishingRequest(
            path = "main2.py",
            environment = env2.id
        )

        this.performPost("$rootUrl/${project1.id}/publish", token1, request2)
            .isConflict()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot unpublish notpublished code-project`() {
        val (account1, token1, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealCodeProject(token1, account1)

        // Do unpublish without publish
        this.performPost("$rootUrl/${project1.id}/unpublish", token1)
            .isNotFound()
    }
}