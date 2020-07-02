package com.mlreef.rest.feature.project

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.toVisibilityScope
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.marketplace.SearchableTag
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.UUID.randomUUID

interface CodeProjectService : ManipulatingProjectService<CodeProject>, RetrievingProjectService<CodeProject>

@Service
class GitlabCodeProjectService(
    private val codeProjectRepository: CodeProjectRepository,
    accountRepository: AccountRepository,
    publicProjectsCacheService: PublicProjectsCacheService,
    gitlabRestClient: GitlabRestClient
) : CodeProjectService, AbstractGitlabProjectService<CodeProject>(
    gitlabRestClient,
    codeProjectRepository,
    accountRepository,
    publicProjectsCacheService) {

    override fun saveNewProject(mlProject: CodeProject): CodeProject {
        return codeProjectRepository.save(mlProject)
    }

    override fun deleteExistingProject(mlProject: CodeProject) {
        return codeProjectRepository.delete(mlProject)
    }

    override fun createNewProject(ownerId: UUID, gitlabProject: GitlabProject): CodeProject {
        val id = randomUUID()
        val pathWithNamespace = gitlabProject.pathWithNamespace
        val group = pathWithNamespace.split("/")[0]
        return CodeProject(
            id = id,
            slug = gitlabProject.path,
            ownerId = ownerId,
            url = gitlabProject.webUrl,
            name = gitlabProject.name,
            description = gitlabProject.description ?: "",
            gitlabPath = gitlabProject.path,
            gitlabPathWithNamespace = gitlabProject.pathWithNamespace,
            gitlabNamespace = group,
            gitlabId = gitlabProject.id,
            visibilityScope = gitlabProject.visibility.toVisibilityScope()
        )
    }

    override fun updateSaveProject(
        mlProject: CodeProject,
        gitlabProject: GitlabProject,
        inputDataTypes: List<DataType>?,
        outputDataTypes: List<DataType>?,
        tags: List<SearchableTag>?
    ) = codeProjectRepository.save(
        mlProject.copy(
            name = gitlabProject.name,
            description = gitlabProject.description,
            gitlabPath = gitlabProject.path,
            visibilityScope = gitlabProject.visibility.toVisibilityScope(),
            inputDataTypes = inputDataTypes?.toSet() ?: mlProject.inputDataTypes,
            outputDataTypes = outputDataTypes?.toSet() ?: mlProject.outputDataTypes,
            tags = tags?.toSet() ?: mlProject.tags
        )
    )


}

