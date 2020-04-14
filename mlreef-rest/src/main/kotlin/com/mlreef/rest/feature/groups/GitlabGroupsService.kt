package com.mlreef.rest.feature.groups

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.Group
import com.mlreef.rest.GroupRepository
import com.mlreef.rest.MembershipRepository
import com.mlreef.rest.annotations.RefreshUserInformation
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.exceptions.AccessDeniedException
import com.mlreef.rest.exceptions.BadParametersException
import com.mlreef.rest.exceptions.GroupNotFoundException
import com.mlreef.rest.exceptions.UnknownGroupException
import com.mlreef.rest.exceptions.UnknownUserException
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import com.mlreef.rest.external_api.gitlab.toAccessLevel
import com.mlreef.rest.external_api.gitlab.toGitlabAccessLevel
import com.mlreef.rest.helpers.GroupOfUser
import com.mlreef.rest.helpers.UserInGroup
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

interface GroupsService {
    fun getUserGroupsList(personId: UUID? = null, userId: UUID? = null): List<GroupOfUser>
    fun getGroupById(groupId: UUID): Group?
    fun getUsersInGroup(groupId: UUID): List<UserInGroup>
    fun createGroupAsUser(ownerToken: String, groupName: String, path: String? = null, ownerId: UUID? = null): Group
    fun updateGroup(groupId: UUID, groupName: String? = null, path: String? = null): Group
    fun deleteGroup(groupId: UUID)
    fun addUserToGroup(groupId: UUID, userId: UUID, accessLevel: AccessLevel? = AccessLevel.GUEST): List<UserInGroup>
    fun addEPFBotToGroup(groupId: UUID, botGitlabId: Long): List<UserInGroup>
    fun editUserInGroup(groupId: UUID, userId: UUID, accessLevel: AccessLevel): List<UserInGroup>
    fun addUsersToGroup(groupId: UUID, users: List<UserInGroup>): List<UserInGroup>
    fun deleteUserFromGroup(groupId: UUID, userId: UUID): List<UserInGroup>
    fun deleteUsersFromGroup(groupId: UUID, users: List<UserInGroup>): List<UserInGroup>
    fun checkUserInGroup(groupId: UUID, userToken: String? = null, userId: UUID? = null, userName: String? = null, email: String? = null, userGitlabId: Long? = null, personId: UUID? = null): Boolean
}

@Service class GitlabGroupsService(
    private val groupsRepository: GroupRepository,
    private val membershipRepository: MembershipRepository,
    private val accountRepository: AccountRepository,
    private val gitlabRestClient: GitlabRestClient,
    private val currentUserService: CurrentUserService
) : GroupsService {

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    override fun getUserGroupsList(personId: UUID?, userId: UUID?): List<GroupOfUser> {
        val account = resolveAccount(userId = userId, personId = personId)
            ?: throw UserNotFoundException(userId = userId, personId = personId)

        val gitlabsGroupsIds = gitlabRestClient
            .userGetUserGroups(account.bestToken?.token ?: throw UnknownUserException("User has no valid token"))
            .map { it.id }

        return gitlabsGroupsIds.map {
            try {
                val gitlabAccessLevel = gitlabRestClient.adminGetGroupMembers(it).first { user -> user.id == account.person.gitlabId }.accessLevel
                val groupInDb = groupsRepository.findByGitlabId(it) ?: throw GroupNotFoundException(gitlabId = it)
                groupInDb.toGroupOfUser(gitlabAccessLevel.toAccessLevel())
            } catch (ex: Exception) {
                log.error("Unable to get user's group membership for gitlab group $it . Exception: $ex.")
                null
            }
        }.filterNotNull()
    }

    override fun getGroupById(groupId: UUID): Group? {
        return groupsRepository.findByIdOrNull(groupId)
    }

    override fun getUsersInGroup(groupId: UUID): List<UserInGroup> {
        val group = groupsRepository.findByIdOrNull(groupId) ?: throw GroupNotFoundException(groupId = groupId)
        val groupGitlabId = group.gitlabId ?: throw UnknownGroupException("Group $groupId is not connected to Gitlab")

        val gitlabUsersMap = gitlabRestClient
            .adminGetGroupMembers(groupGitlabId)
            .map { Pair(it.id, it.accessLevel) }.toMap()

        val accounts = gitlabUsersMap.map {
            accountRepository.findAccountByGitlabId(it.key)
        }.filterNotNull()

        return accounts.map { it.toUserInGroup (gitlabUsersMap[it.person.gitlabId].toAccessLevel()) }
    }

    @Transactional
    @RefreshUserInformation(userId = "#ownerId")
    override fun createGroupAsUser(ownerToken: String, groupName: String, path: String?, ownerId: UUID?): Group {
        val account = resolveAccount(userToken = ownerToken, userId = ownerId)
            ?: throw UserNotFoundException(userId = ownerId)

        val gitlabGroup = gitlabRestClient.userCreateGroup(
            token = ownerToken,
            groupName = groupName,
            path = path ?: groupName
        )

        val group = Group(id = randomUUID(), slug = groupName, name = groupName, gitlabId = gitlabGroup.id)
        groupsRepository.save(group)

        return group
    }

    override fun updateGroup(groupId: UUID, groupName: String?, path: String?): Group {
        val group = groupsRepository.findByIdOrNull(groupId) ?: throw GroupNotFoundException(groupId = groupId)
        val gitlabId = group.gitlabId ?: throw UnknownGroupException("Group is not linked to Gitlab")

        val gitlabGroup = gitlabRestClient.adminUpdateGroup(
            groupId = gitlabId,
            groupName = groupName,
            path = path
        )

        val newGroup = group.copy(name = groupName, slug = groupName)
        groupsRepository.save(newGroup)

        return newGroup
    }

    override fun deleteGroup(groupId: UUID) {
        val group = groupsRepository.findByIdOrNull(groupId) ?: throw GroupNotFoundException(groupId = groupId)
        val gitlabId = group.gitlabId ?: throw UnknownGroupException("Group is not linked to Gitlab")

        gitlabRestClient.adminDeleteGroup(groupId = gitlabId)

        groupsRepository.delete(group)
    }

    @RefreshUserInformation(userId = "#userId")
    override fun addUserToGroup(groupId: UUID, userId: UUID, accessLevel: AccessLevel?): List<UserInGroup> {
        val user = resolveAccount(userId = userId) ?: throw UserNotFoundException(userId = userId)
        val group = groupsRepository.findByIdOrNull(groupId) ?: throw GroupNotFoundException(groupId = groupId)

        val gitlabClient = gitlabRestClient.adminAddUserToGroup(
            groupId = group.gitlabId
                ?: throw UnknownGroupException("Group is not connected to gitlab and has not valid gitlab id"),
            userId = user.person.gitlabId
                ?: throw UnknownUserException("Person is not connected to gitlab and has not valid gitlab id"),
            accessLevel = (accessLevel ?: AccessLevel.GUEST).toGitlabAccessLevel())

        return getUsersInGroup(groupId)
    }

    override fun addEPFBotToGroup(groupId: UUID, botGitlabId: Long): List<UserInGroup> {
        val group = groupsRepository.findByIdOrNull(groupId) ?: throw GroupNotFoundException(groupId = groupId)

        gitlabRestClient.adminAddUserToGroup(
            groupId = group.gitlabId ?: throw UnknownGroupException(),
            userId = botGitlabId,
            accessLevel = GroupAccessLevel.MAINTAINER)

        return getUsersInGroup(groupId)
    }

    @RefreshUserInformation(list = "#users")
    override fun addUsersToGroup(groupId: UUID, users: List<UserInGroup>): List<UserInGroup> {
        val group = groupsRepository.findByIdOrNull(groupId) ?: throw GroupNotFoundException(groupId = groupId)
        val gitlabGroupId = group.gitlabId ?: throw UnknownGroupException()

        val usersIds = users.map {
            val account = resolveAccount(userId = it.id, email = it.userName, userName = it.userName, gitlabId = it.gitlabId)

            if (account == null || account.person.gitlabId == null) {
                null
            } else {
                Pair(account.person.gitlabId!!, it.accessLevel)
            }
        }.filterNotNull().toMap()

        val accountsAdded = usersIds.map {
            try {
                val gitlabUserInGroup = gitlabRestClient
                    .adminAddUserToGroup(groupId = gitlabGroupId, userId = it.key, accessLevel = it.value.toGitlabAccessLevel())
                val account = accountRepository.findAccountByGitlabId(gitlabUserInGroup.id)
                    ?: throw UserNotFoundException(gitlabId = gitlabUserInGroup.id)
                Pair(account, gitlabUserInGroup.accessLevel.toAccessLevel())
            } catch (ex: Exception) {
                log.error("Unable to add user to the group ${group.name}. Exception: $ex.")
                null
            }
        }.filterNotNull()

        return accountsAdded.map { it.first.toUserInGroup(it.second) }
    }

    @RefreshUserInformation(userId = "#userId")
    override fun editUserInGroup(groupId: UUID, userId: UUID, accessLevel: AccessLevel): List<UserInGroup> {
        val userToBeEdit = resolveAccount(userId = userId) ?: throw UserNotFoundException(userId = userId)

        val group = groupsRepository.findByIdOrNull(groupId) ?: throw GroupNotFoundException(groupId = groupId)

        gitlabRestClient.adminEditUserInGroup(
            groupId = group.gitlabId
                ?: throw UnknownGroupException("Group is not connected to gitlab and has not valid gitlab id"),
            userId = userToBeEdit.person.gitlabId
                ?: throw UnknownUserException("Person is not connected to gitlab and has not valid gitlab id"),
            accessLevel = accessLevel.toGitlabAccessLevel()!!)

        return getUsersInGroup(groupId)
    }

    @RefreshUserInformation(userId = "#userId")
    override fun deleteUserFromGroup(groupId: UUID, userId: UUID): List<UserInGroup> {
        val userToBeDeleted = resolveAccount(userId = userId) ?: throw UserNotFoundException(userId = userId)

        val group = groupsRepository.findByIdOrNull(groupId) ?: throw GroupNotFoundException(groupId = groupId)

        gitlabRestClient.adminDeleteUserFromGroup(
            groupId = group.gitlabId ?: throw UnknownGroupException(),
            userId = userToBeDeleted.person.gitlabId ?: throw UnknownGroupException())

        return getUsersInGroup(groupId)
    }

    @RefreshUserInformation(list = "#users")
    override fun deleteUsersFromGroup(groupId: UUID, users: List<UserInGroup>): List<UserInGroup> {
        val group = groupsRepository.findByIdOrNull(groupId) ?: throw GroupNotFoundException(groupId = groupId)
        val gitlabGroupId = group.gitlabId ?: throw UnknownGroupException("The group has no gitlab id")

        val usersIds = users.map {
            try {
                when {
                    it.gitlabId != null -> it.gitlabId
                    it.email != null -> accountRepository.findOneByEmail(it.email!!)?.person?.gitlabId
                    it.userName != null -> accountRepository.findOneByUsername(it.userName?: "")?.person?.gitlabId
                    else -> null
                }
            } catch (ex: Exception) {
                null
            }
        }.filterNotNull()

        usersIds.forEach {
            try {
                gitlabRestClient
                    .adminDeleteUserFromGroup(groupId = gitlabGroupId, userId = it)
            } catch (ex: Exception) {
                log.error("Unable to delete user $it from the group ${group.name}. Exception: $ex.")
            }
        }

        return getUsersInGroup(groupId)
    }

    override fun checkUserInGroup(groupId: UUID, userToken: String?, userId: UUID?, userName: String?, email: String?, userGitlabId: Long?, personId: UUID?): Boolean {
        try {
            val account: Account? = resolveAccount(userToken, userId, personId, userName, email, userGitlabId)
            if (account == null)
                return false
            assertMemberOfGroup(groupId, personId = account.person.id)
            return true
        } catch (ex: Exception) {
            return false
        }
    }

    private fun assertMemberOfGroup(groupUUID: UUID, accountId: UUID? = null, personId: UUID? = null) {
        val currentPersonId = personId ?: resolveAccount(userId = accountId)?.person?.id
        ?: currentUserService.person().id
        membershipRepository.findByPersonIdAndGroupId(currentPersonId, groupUUID)
            ?: throw AccessDeniedException("User is not in group or not allowed to view the group")
    }

    private fun resolveAccount(userToken: String? = null, userId: UUID? = null, personId: UUID? = null, userName: String? = null, email: String? = null, gitlabId: Long? = null): Account? {
        return when {
            userToken != null -> {
                val gitlabUser = gitlabRestClient.getUser(userToken)
                accountRepository.findAccountByGitlabId(gitlabUser.id)
            }
            personId != null -> accountRepository.findAccountByPersonId(personId)
            userId != null -> accountRepository.findByIdOrNull(userId)
            email != null -> accountRepository.findOneByEmail(email)
            userName != null -> accountRepository.findOneByUsername(userName)
            gitlabId != null -> accountRepository.findAccountByGitlabId(gitlabId)
            else -> throw BadParametersException("At least one parameter must be provided")
        }
    }
}

