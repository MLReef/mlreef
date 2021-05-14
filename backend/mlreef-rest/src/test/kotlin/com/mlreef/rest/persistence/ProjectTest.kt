package com.mlreef.rest.persistence

import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.DataType
import com.mlreef.rest.domain.ProcessorType
import com.mlreef.rest.domain.Subject
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.domain.marketplace.SearchableTag
import com.mlreef.rest.domain.marketplace.Star
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Rollback
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class ProjectTest : AbstractRepositoryTest() {
    @Transactional
    @Test
    @Rollback
    fun `saving persists Entry and inputDataTypes collection`() {
        val id = randomUUID()

        val entity =
            dataProject(id = id, owner = mainPerson, inputDataTypes = mutableSetOf(imageDataType, modelDataType))

        projectRepository.save(entity)
        val fromRepo = projectRepository.findByIdOrNull(id)!!

        assertThat(fromRepo).isNotNull
        assertThat(fromRepo.inputDataTypes).hasSize(2)
        assertThat(fromRepo.inputDataTypes).hasSize(2)

        assertThat(fromRepo.inputDataTypes).contains(imageDataType)
        assertThat(fromRepo.inputDataTypes).contains(modelDataType)
        //
    }

    @Transactional
    @Test
    @Rollback
    fun `saving persists Entry and outputDataTypes collection`() {
        val id = randomUUID()

        val entity = codeProject(
            id,
            inputDataTypes = mutableSetOf(imageDataType, modelDataType),
            outputDataTypes = mutableSetOf(tabularDataType, anyDataType)
        )

        projectRepository.save(entity)
        val fromRepo = projectRepository.findByIdOrNull(id) as CodeProject

        assertThat(fromRepo).isNotNull
        assertThat(fromRepo.outputDataTypes).hasSize(2)

        assertThat(fromRepo.outputDataTypes).contains(tabularDataType)
        assertThat(fromRepo.outputDataTypes).contains(anyDataType)
    }

    private fun dataProject(
        id: UUID,
        tags: Set<SearchableTag> = emptySet(),
        globalSlug: String = "slug",
        owner: Subject = mainPerson,
        inputDataTypes: Set<DataType> = setOf(),
        gitlabId: Long = 2,
        gitlabNamespace: String = "",
        slug: String = globalSlug,
        gitlabPath: String = slug
    ) = DataProject(
        id = id,
        globalSlug = globalSlug,
        visibilityScope = VisibilityScope.PUBLIC,
        name = "title",
        inputDataTypes = inputDataTypes.toMutableSet(),
        description = "description",
        tags = tags.toMutableSet(),
        gitlabId = gitlabId,
        gitlabNamespace = gitlabNamespace,
        ownerId = owner.id,
        slug = slug,
        gitlabPath = gitlabPath,
        url = "url.com"
    )

    private fun codeProject(
        id: UUID,
        tags: Set<SearchableTag> = emptySet(),
        globalSlug: String = "slug",
        owner: Subject = mainPerson,
        inputDataTypes: Collection<DataType> = setOf(),
        outputDataTypes: Collection<DataType> = setOf(),
        gitlabId: Long = 2,
        gitlabNamespace: String = "",
        slug: String = globalSlug,
        gitlabPath: String = slug,
        processorType: ProcessorType = operationProcessorType,
    ) = CodeProject(
        id = id,
        globalSlug = globalSlug,
        visibilityScope = VisibilityScope.PUBLIC,
        name = "title",
        inputDataTypes = inputDataTypes.toMutableSet(),
        outputDataTypes = outputDataTypes.toMutableSet(),
        description = "description",
        tags = tags.toMutableSet(),
        gitlabId = gitlabId,
        gitlabNamespace = gitlabNamespace,
        ownerId = owner.id,
        slug = slug,
        gitlabPath = gitlabPath,
        url = "url.com",
        processorType = processorType,
    )

    @Transactional
    @Test
    @Rollback
    fun `saving persists Entry and tags collection`() {
        // prepare
        val tag1 = SearchableTag(randomUUID(), "tag1")
        val tag2 = SearchableTag(randomUUID(), "tag2")
        val saveAll = tagRepository.saveAll(listOf(tag1, tag2))

        // test
        val id = randomUUID()
        val entity = dataProject(id, tags = saveAll.toSet(), globalSlug = "slug", owner = mainPerson)

        projectRepository.save(entity)

        val fromRepo = projectRepository.findByIdOrNull(id)

        assertThat(fromRepo).isNotNull
        assertThat(fromRepo!!.tags).hasSize(2)

        assertThat(fromRepo.tags).contains(tag1)
        assertThat(fromRepo.tags).contains(tag2)
    }

    @Transactional
    @Test
    @Rollback
    fun `saving persists Entry and stars`() {
        val id = randomUUID()

        val entity = dataProject(id = id, owner = mainPerson)

        val adapted = entity
            .addStar(mainPerson)
            .addStar(mainPerson2)
        val save = projectRepository.save(adapted)
        assertThat(save).isNotNull

        val fromRepo = projectRepository.findByIdOrNull(id)

        assertThat(fromRepo).isNotNull
        assertThat(fromRepo!!.stars).hasSize(2)
        assertThat(fromRepo.starsCount).isEqualTo(2)
        assertThat(fromRepo.stars).contains(Star(entity.id, mainPerson.id))
        assertThat(fromRepo.stars).contains(Star(entity.id, mainPerson2.id))
    }

    @Transactional
    @Test
    @Rollback
    @Disabled
    fun `saving persists Entry and stars after remove`() {
        val id = randomUUID()

        val entity = dataProject(id = id, owner = mainPerson)

//        val person1 = EntityMocks.person(slug = "slug23")
//        val person2 = EntityMocks.person(slug = "slug234")
//        personRepository.saveAll(listOf(person1, person2))

        val adapted = entity
            .addStar(mainPerson)
            .addStar(mainPerson2)
            .addStar(mainPerson3)

        withinTestTransaction {
            projectRepository.save(adapted)
        }

        val fromRepo = projectRepository.findByIdOrNull(id)
        assertThat(fromRepo!!.stars).hasSize(2)
        assertThat(fromRepo.starsCount).isEqualTo(2)
        assertThat(fromRepo.stars).contains(Star(entity.id, mainPerson2.id))
        assertThat(fromRepo.stars).contains(Star(entity.id, mainPerson3.id))

        val afterRemove = withinTestTransaction {
            val beforeRemove = fromRepo
                .removeStar(mainPerson)
                .removeStar(mainPerson)
            projectRepository.save(beforeRemove)
        }
        assertThat(afterRemove.stars).hasSize(1)
        assertThat(afterRemove.starsCount).isEqualTo(1)
        assertThat(fromRepo.stars).contains(Star(entity.id, mainPerson2.id))
    }

    @Transactional
    @Test
    @Rollback
    fun `find works`() {
        val id = randomUUID()

        val entity = dataProject(id = id, owner = mainPerson)

        assertThat(projectRepository.findByIdOrNull(id)).isNull()
        projectRepository.save(entity)
        assertThat(projectRepository.findByIdOrNull(id)).isNotNull
    }

    @Transactional
    @Test
    @Rollback
    fun `save works`() {
        val id = randomUUID()
        val entity = dataProject(id = id, owner = mainPerson)

        assertThat(projectRepository.findByIdOrNull(id)).isNull()
        val saved = projectRepository.save(entity)
        assertThat(saved).isNotNull
        checkAfterCreated(saved)
        assertThat(projectRepository.findByIdOrNull(id)).isNotNull
    }

    @Transactional
    @Test
    @Rollback
    fun `delete works`() {
        val id = randomUUID()
        val entity = dataProject(id = id, owner = mainPerson)

        val saved = projectRepository.save(entity)
        projectRepository.delete(saved)
        assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }

    @Transactional
    @Test
    @Rollback
    fun `must not save duplicate globalSlug`() {
        val entity1 = dataProject(id = randomUUID(), globalSlug = "slug1", gitlabId = 101, gitlabNamespace = "space1")
        val entity2 = dataProject(id = randomUUID(), globalSlug = "slug1", gitlabId = 102, gitlabNamespace = "space2")
        projectRepository.save(entity1)
        commitAndFail {
            projectRepository.save(entity2)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `must not save duplicate gitlabId`() {
        val entity1 = dataProject(id = randomUUID(), globalSlug = "slug1", gitlabId = 100, gitlabNamespace = "space1")
        val entity2 = dataProject(id = randomUUID(), globalSlug = "slug2", gitlabId = 100, gitlabNamespace = "space2")
        projectRepository.save(entity1)
        commitAndFail {
            projectRepository.save(entity2)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `must not save duplicate namespacePath`() {
        val entity1 = dataProject(
            id = randomUUID(),
            globalSlug = "slug1",
            gitlabId = 100,
            gitlabNamespace = "space1",
            slug = "slug1",
            gitlabPath = "path"
        )
        val entity2 = dataProject(
            id = randomUUID(),
            globalSlug = "slug2",
            gitlabId = 101,
            gitlabNamespace = "space1",
            slug = "slug2",
            gitlabPath = "path"
        )
        projectRepository.save(entity1)
        commitAndFail {
            projectRepository.save(entity2)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `must not save duplicate slug for same owner`() {
        val entity1 = dataProject(
            id = randomUUID(),
            globalSlug = "slug1",
            gitlabId = 100,
            gitlabNamespace = "space1",
            slug = "slug"
        )
        val entity2 = dataProject(
            id = randomUUID(),
            globalSlug = "slug2",
            gitlabId = 101,
            gitlabNamespace = "space2",
            slug = "slug"
        )
        projectRepository.save(entity1)
        commitAndFail {
            projectRepository.save(entity2)
        }
    }
}
