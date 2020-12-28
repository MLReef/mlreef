package com.mlreef.rest.testcommons

import com.mlreef.rest.BaseEnvironments
import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.Person
import com.mlreef.rest.PublishingInfo
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.Subject
import com.mlreef.rest.UserRole
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableTagType
import java.time.ZonedDateTime
import java.util.UUID
import java.util.UUID.randomUUID

class EntityMocks {
    companion object {
        val authorId = randomUUID()
        val author = person(id = authorId, slug = "slug_author")
        val codeProject = codeProject()
        var lastGitlabId = 10L

        fun person(id: UUID = randomUUID(), slug: String = "slug" + randomUUID()) = Person(id, slug, slug, lastGitlabId++, hasNewsletters = true, termsAcceptedAt = ZonedDateTime.now(), userRole = UserRole.DEVELOPER)

        fun dataOperation(
            codeProject: CodeProject = this.codeProject,
            author: Subject = person(id = authorId),
            slug: String = "commons-augment",
            inputDataType: DataType = DataType.IMAGE,
            outputDataType: DataType = DataType.IMAGE,
        ) = DataOperation(
            id = randomUUID(), slug = slug, name = "Operations",
            inputDataType = inputDataType, outputDataType = outputDataType,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProject = codeProject
        )

        fun dataAlgorithm(
            codeProject: CodeProject = this.codeProject,
            author: Subject = person(id = authorId),
            inputDataType: DataType = DataType.IMAGE,
            outputDataType: DataType = DataType.IMAGE,
            slug: String = "commons-algorithm",
        ) = DataAlgorithm(
            id = randomUUID(), slug = slug, name = "Algorithm",
            inputDataType = inputDataType, outputDataType = outputDataType,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProject = codeProject
        )

        fun dataVisualization(
            codeProject: CodeProject = this.codeProject,
            author: Subject = person(id = authorId),
            inputDataType: DataType = DataType.IMAGE,
            slug: String = "commons-vis",
        ) = DataVisualization(
            id = randomUUID(), slug = slug, name = "Algorithm",
            inputDataType = inputDataType,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProject = codeProject
        )

        fun processorVersion(
            dataProcessor: DataProcessor,
            modelType: String? = null,
            mlCategory: String? = null,
            publisher: Subject = person(id = authorId),
            environment: BaseEnvironments? = null,
        ) = ProcessorVersion(
            id = randomUUID(),
            dataProcessor = dataProcessor,
            publishingInfo = PublishingInfo(publisher = publisher),
            baseEnvironmentId = environment?.id,
            modelType = modelType,
            mlCategory = mlCategory,
            number = 1L,
        )

        fun dataProject(
            ownerId: UUID = authorId,
            slug: String = "test-data-project",
            visibilityScope: VisibilityScope? = null,
            id: UUID = randomUUID(),
            inputDataTypes: List<DataType> = listOf(),
            outputDataTypes: List<DataType> = listOf(),
            tags: List<SearchableTag> = listOf(),
            forksCount: Int = 0,
        ) = DataProject(
            id = id,
            slug = slug,
            name = "DataProject Augment",
            ownerId = ownerId,
            url = "https://gitlab.com/mlreef/$slug",
            description = "",
            gitlabPath = slug,
            gitlabNamespace = "mlreef",
            gitlabId = lastGitlabId++,
            visibilityScope = visibilityScope ?: VisibilityScope.default(),
            inputDataTypes = inputDataTypes.toMutableSet(),
            outputDataTypes = outputDataTypes.toMutableSet(),
            tags = tags.toMutableSet(),
            forksCount = forksCount,
        )

        fun codeProject(
            ownerId: UUID = authorId,
            slug: String = "test-code-project",
            id: UUID = randomUUID(),
            name: String = "CodeProject Augment",
            visibilityScope: VisibilityScope? = null,
            inputDataTypes: List<DataType> = listOf(),
            outputDataTypes: List<DataType> = listOf(),
            tags: List<SearchableTag> = listOf(),
            forksCount: Int = 0,
        ) = CodeProject(
            id = id,
            slug = slug,
            name = name,
            ownerId = ownerId,
            url = "https://gitlab.com/mlreef/$slug",
            description = "",
            gitlabPath = slug,
            gitlabNamespace = "mlreef",
            gitlabId = lastGitlabId++,
            visibilityScope = visibilityScope ?: VisibilityScope.default(),
            inputDataTypes = inputDataTypes.toMutableSet(),
            outputDataTypes = outputDataTypes.toMutableSet(),
            tags = tags.toMutableSet(),
            forksCount = forksCount,
        )

        fun searchableTag(
            name: String,
            id: UUID = randomUUID(),
            ownerId: UUID? = null,
            public: Boolean = true,
            type: SearchableTagType = SearchableTagType.UNDEFINED
        ) = SearchableTag(
            id = id,
            ownerId = ownerId,
            name = name,
            public = public,
            type = type
        )

    }
}
