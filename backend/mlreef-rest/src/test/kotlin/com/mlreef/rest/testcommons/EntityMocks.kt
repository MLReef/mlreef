package com.mlreef.rest.testcommons

import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.Person
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

        fun dataOperation(codeProject: CodeProject = this.codeProject, author: Subject = person(id = authorId), slug: String = "commons-augment") = DataOperation(
            id = randomUUID(), slug = slug, name = "Operations",
            inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProject = codeProject)

        fun dataAlgorithm(codeProject: CodeProject = this.codeProject, author: Subject = person(id = authorId)) = DataAlgorithm(
            id = randomUUID(), slug = "commons-algorithm", name = "Algorithm",
            inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProject = codeProject)

        fun dataVisualization(codeProject: CodeProject = this.codeProject, author: Subject = person(id = authorId)) = DataVisualization(
            id = randomUUID(), slug = "commons-vis", name = "Algorithm",
            inputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProject = codeProject)

        fun dataProject(ownerId: UUID = authorId, slug: String = "test-data-project", visibilityScope: VisibilityScope? = null, id: UUID = randomUUID()) = DataProject(
            id = id, slug = slug, name = "CodeProject Augment", ownerId = ownerId,
            url = "https://gitlab.com/mlreef/$slug", description = "",
            gitlabPath = slug, gitlabNamespace = "mlreef", gitlabId = lastGitlabId++,
            visibilityScope = visibilityScope ?: VisibilityScope.default())

        fun codeProject(
            ownerId: UUID = authorId,
            slug: String = "test-data-project",
            id: UUID = randomUUID(),
            name: String = "CodeProject Augment"
        ) = CodeProject(
            id = id, slug = slug, name = name, ownerId = ownerId,
            url = "https://gitlab.com/mlreef/$slug", description = "",
            gitlabPath = slug, gitlabNamespace = "mlreef", gitlabId = lastGitlabId++)

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
