package com.mlreef.rest.testcommons

import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.Person
import com.mlreef.rest.Searchable
import com.mlreef.rest.Subject
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.marketplace.MarketplaceEntry
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableTagType
import java.util.UUID
import java.util.UUID.randomUUID

class EntityMocks {
    companion object {
        val codeProjectId = randomUUID()
        val authorId = randomUUID()
        val author = person(id = authorId, slug = "slug_author")
        var lastGitlabId = 10L

        fun person(id: UUID = randomUUID(), slug: String = "slug" + randomUUID()) = Person(id, slug, "name", lastGitlabId++)

        fun dataOperation(author: Subject = person(id = authorId)) = DataOperation(
            id = randomUUID(), slug = "commons-augment", name = "Operations",
            command = "augment", inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProjectId = codeProjectId)

        fun dataAlgorithm(author: Subject = person(id = authorId)) = DataAlgorithm(
            id = randomUUID(), slug = "commons-algorithm", name = "Algorithm",
            command = "augment", inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProjectId = codeProjectId)

        fun dataVisualization(author: Subject = person(id = authorId)) = DataVisualization(
            id = randomUUID(), slug = "commons-vis", name = "Algorithm",
            command = "augment", inputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProjectId = codeProjectId)

        fun dataProject(ownerId: UUID = authorId, slug: String = "test-data-project") = DataProject(
            id = randomUUID(), slug = slug, name = "CodeProject Augment", ownerId = ownerId,
            url = "https://gitlab.com/mlreef/sign-language-classifier",
            gitlabProject = "sign-language-classifier", gitlabGroup = "mlreef", gitlabId = lastGitlabId++)

        fun codeProject(ownerId: UUID = authorId, id: UUID = codeProjectId) = CodeProject(
            id = id, slug = "test-data-project", name = "CodeProject Augment", ownerId = ownerId,
            url = "https://gitlab.com/mlreef/sign-language-classifier",
            gitlabProject = "sign-language-classifier", gitlabGroup = "mlreef", gitlabId = lastGitlabId++)

        fun marketplaceEntry(owner: Subject = author,
                             id: UUID = randomUUID(),
                             visibilityScope: VisibilityScope = VisibilityScope.PUBLIC,
                             searchable: Searchable,
                             globalSlug: String = "${searchable.getType()}-${searchable.slug}",
                             name: String = "Name ${searchable.getType()}-${searchable.slug}"
        ) = MarketplaceEntry(
            id = id,
            globalSlug = globalSlug,
            visibilityScope = visibilityScope,
            name = name,
            description = "description",
            owner = owner,
            searchableType = searchable.getType(),
            searchableId = searchable.getId())

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
