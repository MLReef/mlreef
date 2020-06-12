package com.mlreef.rest.integration

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountToken
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Group
import com.mlreef.rest.GroupRepository
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.caches.domain.PublicProjectHash
import com.mlreef.rest.feature.caches.repositories.PublicProjectsRepository
import com.mlreef.rest.utils.RandomUtils
import com.ninjasquad.springmockk.SpykBean
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.util.UUID
import javax.transaction.Transactional

@Component
internal class GitlabHelper {
    companion object {
        val allCreatedUsersNames = mutableListOf<String>()
        val allCreatedProjectsNames = mutableListOf<String>()
    }

    @Autowired
    protected lateinit var restClient: GitlabRestClient

    @Autowired
    protected lateinit var accountRepository: AccountRepository

    @SpykBean
    lateinit var groupsRepository: GroupRepository

    @Autowired
    lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    protected lateinit var publicProjectRepository: PublicProjectsRepository


    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

    private val realCreatedUsersCache: MutableList<Triple<Account, String, GitlabUser>> = mutableListOf()

    @Transactional
    fun createRealUser(userName: String? = null, password: String? = null, index: Int = 0): Triple<Account, String, GitlabUser> {
        if (realCreatedUsersCache.size < index)
            return realCreatedUsersCache[index]

        val accountId = UUID.randomUUID()
        val username = userName ?: RandomUtils.generateRandomUserName(20)
        val email = "$username@example.com"
        val plainPassword = password ?: RandomUtils.generateRandomPassword(30, true)

        val userInGitlab = restClient.adminCreateUser(email, username, "Existing user", plainPassword)
        val tokenInGitlab = restClient.adminCreateUserToken(gitlabUserId = userInGitlab.id, tokenName = "TestTokenName")

        val passwordEncrypted = passwordEncoder.encode(plainPassword)
        val person = Person(UUID.randomUUID(), "person_slug", "user name", userInGitlab.id)
        val token = AccountToken(UUID.randomUUID(), accountId, tokenInGitlab.token, tokenInGitlab.id)
        val account = Account(accountId, username, email, passwordEncrypted, person, mutableListOf(token))

        accountRepository.save(account)

        val result = Triple(account, plainPassword, userInGitlab)
        realCreatedUsersCache.add(result)

        allCreatedUsersNames.add(username)

        return result
    }

    fun createRealGroup(account: Account, name: String? = null): Pair<Group, GitlabGroup> {
        val groupName = name ?: RandomUtils.generateRandomUserName(10)
        val groupPath = "path-$groupName"
        val groupInGitlab = restClient.userCreateGroup(account.bestToken?.token!!, groupName, groupPath)

        var groupInDatabase = Group(UUID.randomUUID(), "slug-$groupName", groupName,groupInGitlab.id)

        groupInDatabase = groupsRepository.save(groupInDatabase)

        return Pair(groupInDatabase, groupInGitlab)
    }

    fun createRealProjectInGitlab(account: Account, name: String? = null, slug: String? = null, namespace: String? = null, public: Boolean = true): GitlabProject {
        val projectName = name ?: RandomUtils.generateRandomUserName(20)
        val projectSlug = slug ?: "slug-$projectName"
        val nameSpace = namespace ?: "mlreef/$projectName"

        val findNamespace = try {
            restClient.findNamespace(account.bestToken!!.token, nameSpace)
        } catch (e: Exception) {
            null
        }

        val result = restClient.createProject(
            token = account.bestToken?.token!!,
            slug = projectSlug,
            name = projectName,
            defaultBranch = "master",
            nameSpaceId = findNamespace?.id,
            description = "Test description $projectName",
            visibility = if (public) "public" else "private",
            initializeWithReadme = false)

        allCreatedProjectsNames.add(projectName)

        return result
    }

    fun createRealCodeProject(account: Account, name: String? = null, slug: String? = null, namespace: String? = null, public: Boolean = true): Pair<CodeProject, GitlabProject> {
        val gitLabProject = createRealProjectInGitlab(account, name, slug, namespace, public)

        val group = gitLabProject.pathWithNamespace.split("/")[0]

        var projectInDb = CodeProject(
            id = UUID.randomUUID(),
            slug = gitLabProject.path,
            ownerId = account.person.id,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            gitlabProject = gitLabProject.path,
            gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
            gitlabGroup = group,
            gitlabId = gitLabProject.id,
            visibilityScope = VisibilityScope.valueOf(gitLabProject.visibility.name)
        )

        projectInDb = codeProjectRepository.save(projectInDb)

        if (public) publicProjectRepository.save(PublicProjectHash(gitLabProject.id, projectInDb.id))

        return Pair(projectInDb, gitLabProject)
    }

    fun createRealDataProject(account: Account, name: String? = null, slug: String? = null, namespace: String? = null, public: Boolean = true): Pair<DataProject, GitlabProject> {
        val gitLabProject = createRealProjectInGitlab(account, name, slug, namespace, public)

        val group = gitLabProject.pathWithNamespace.split("/")[0]

        var projectInDb = DataProject(
            id = UUID.randomUUID(),
            slug = gitLabProject.path,
            ownerId = account.person.id,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            gitlabProject = gitLabProject.path,
            gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
            gitlabGroup = group,
            gitlabId = gitLabProject.id,
            visibilityScope = VisibilityScope.valueOf(gitLabProject.visibility.name)
        )

        projectInDb = dataProjectRepository.save(projectInDb)

        if (public) publicProjectRepository.save(PublicProjectHash(gitLabProject.id, projectInDb.id))

        return Pair(projectInDb, gitLabProject)
    }
}