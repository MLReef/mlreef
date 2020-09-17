package com.mlreef.rest.exceptions

import org.springframework.http.HttpStatus
import org.springframework.validation.FieldError
import org.springframework.web.bind.annotation.ResponseStatus
import java.util.UUID

enum class ErrorCode(val errorCode: Int, val errorName: String) {
    // authentication and general errors: 1xxx
    NotFound(1404, "Entity not found"),
    NotAllowed(1405, "Method NotAllowed "),
    Conflict(1409, "Entity already exists"),
    AccessDenied(1410, "Access denied exception"),
    ValidationFailed(1400, "ValidationFailed"),

    // MAJOR general Gitlab errors: 15xx
    GitlabBadGateway(1500, "Gitlab server is unavailable"),

    @Deprecated("This errorCode has no meaning at all")
    GitlabCommonError(1577, "Gitlab common error"),

    // specific user management errors 2xxx
    UserAlreadyExisting(2001, "User already exists"),
    UserNotExisting(2002, "User does not exist"),
    UserBadCredentials(2003, "Username or password is incorrect"),
    GroupNotExisting(2004, "Group does not exist"),
    ProjectNotExisting(2005, "Project does not exist"),
    UserCreationFailedEmailOrUsernameUsed(2007, "Email or username is already in use"),
    GroupNameInvalidReserved(2008, "Cannot save group with a reserved name/slug"),

    // Gitlab user management errors 21xx
    GitlabUserCreationFailed(2101, "Cannot create user in Gitlab"),
    GitlabUserCreationFailedEmailUsed(2104, "Cannot create user in Gitlab - email or username already in use!"),
    GitlabUserTokenCreationFailed(2102, "Cannot create user token in Gitlab"),
    GitlabUserNotExisting(2103, "Cannot find user in Gitlab via token"),
    GitlabUserAddingToGroupFailed(2110, "Cannot add user to group in Gitlab"),
    GroupAlreadyExists(2111, "Cannot create duplicate group with already existing name"),

    //groups 22xx
    GitlabGroupCreationFailed(2201, "Cannot create group in Gitlab"),
    GitlabVariableCreationFailed(2202, "Cannot create group variable in Gitlab"),

    // Projects 30xx
    ProjectCreationFailed(3001, "Could not create project"),
    GitlabProjectAlreadyExists(3002, "Cannot create project in Gitlab. Project already exists"),
    GitlabProjectNotExists(3003, "Project not exists in Gitlab"),
    GitlabProjectCreationFailed(3004, "Cannot create project in Gitlab"),
    GitlabProjectUpdateFailed(3005, "Cannot update project in Gitlab"),
    GitlabProjectDeleteFailed(3006, "Cannot delete project in Gitlab"),
    ProjectNamespaceSubjectNotFound(3007, "Cannot associate gitlab namespace with a persisted Subject"),
    GitlabProjectIdAlreadyUsed(3008, "Cannot save project with a used gitlabId"),
    ProjectNameInvalidReserved(3009, "Cannot save project with a reserved name/slug"),

    // Creating Experiments 31xx
    DataProcessorNotUsable(3101, "DataProcessor cannot be used"),
    ProcessorParameterNotUsable(3102, "ProcessorParameter cannot be used"),
    CommitPipelineScriptFailed(3103, "Could not commit mlreef file"),
    ExperimentCannotBeChanged(3104, "Could not change status of Experiment"),
    ExperimentSlugAlreadyInUse(3105, "Could not change status of Experiment"),
    ExperimentCreationOwnerMissing(3106, "Owner is not provided"),
    ExperimentCreationProjectMissing(3107, "DataProject is not provided"),
    ExperimentCreationDataInstanceMissing(3108, "DataInstance is not provided"),
    ExperimentCreationInvalid(3109, "Could not create Experiment"),

    // Creating Pipelines 32xx
    PipelineSlugAlreadyInUse(3201, "Could not change status"),
    PipelineCreationOwnerMissing(3202, "Owner is not provided"),
    PipelineCreationProjectMissing(3203, "DataProject is not provided"),
    PipelineCreationFilesMissing(3204, "Needs at least 1 Path"),
    PipelineCreationInvalid(3205, "Pipeline could not be created"),

    // Random unsorted stuff PLEASE INVENT NICE ERROR CODES, WHICH COULD BE GROUPED
    GitlabBranchCreationFailed(2112, "Cannot create branch in Gitlab"),
    GitlabCommitFailed(2113, "Cannot commit files in Gitlab"),
    GitlabBranchDeletionFailed(2115, "Cannot delete branch in Gitlab"),
    GitlabMembershipDeleteFailed(2117, "Unable to revoke user's membership"),
    GitlabBranchNotExists(2118, "Branch does not exist in Gitlab"),
    GitlabUserModificationFailed(2101, "Cannot modify user in Gitlab"),
}

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Operation cannot be executed due to malformed input or invalid states.")
@Deprecated("Use BadRequestException or another specific type")
open class RestException(
    val errorCode: Int,
    val errorName: String,
    detailMessage: String? = null,
    cause: Throwable? = null) : RuntimeException(detailMessage, cause) {

    constructor(errorCode: ErrorCode) : this(errorCode.errorCode, errorCode.errorName)
    constructor(errorCode: ErrorCode, detailMessage: String) : this(errorCode.errorCode, errorCode.errorName, detailMessage)
}

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Operation cannot be executed due to malformed input or invalid states.")
class ValidationException(val validationErrors: Array<FieldError?>) : RestException(ErrorCode.ValidationFailed, validationErrors.joinToString("\n") { it.toString() })

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Cannot create entity due to a bad request")
class BadRequestException(errorCode: ErrorCode, detailMessage: String) : RestException(errorCode, detailMessage)

@ResponseStatus(code = HttpStatus.UNAUTHORIZED, reason = "Unauthorized for the request")
class AccessDeniedException(message: String? = null) : RestException(ErrorCode.AccessDenied, message ?: "Access denied")

@ResponseStatus(code = HttpStatus.FORBIDDEN, reason = "Bad credentials")
class IncorrectCredentialsException(message: String? = null) : RestException(ErrorCode.AccessDenied, message
    ?: "Access denied")

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Entity not found")
open class NotFoundException(errorCode: ErrorCode, message: String) : RestException(errorCode, message)

@ResponseStatus(code = HttpStatus.METHOD_NOT_ALLOWED, reason = "Method not allowed or supported")
class MethodNotAllowedException(errorCode: ErrorCode, message: String) : RestException(errorCode, message)

@ResponseStatus(code = HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS, reason = "Reserved name forbidden to use")
class ForbiddenContentException(errorCode: ErrorCode, message: String) : RestException(errorCode, message)

@ResponseStatus(code = HttpStatus.INTERNAL_SERVER_ERROR, reason = "Gitlab not reachable!")
class GitlabConnectException(message: String) : RestException(ErrorCode.NotFound, message)

@ResponseStatus(code = HttpStatus.BAD_GATEWAY, reason = "Gitlab is unavailable")
class GitlabBadGatewayException(responseBodyAsString: String) : GitlabCommonException(502, ErrorCode.GitlabBadGateway, responseBodyAsString)

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "Cannot create entity due to a duplicate conflict:")
class ConflictException(errorCode: ErrorCode, message: String) : RestException(errorCode, message)

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "The state of internal db is inconsistent")
class NotConsistentInternalDb(message: String) : RestException(ErrorCode.Conflict, message)

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "The state of internal db is inconsistent")
class UserAlreadyExistsException(username: String, email: String) : RestException(ErrorCode.UserCreationFailedEmailOrUsernameUsed, "'$username' or '$email' is already in use!")

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "User not found")
open class UnknownUserException(message: String? = null)
    : NotFoundException(ErrorCode.UserNotExisting, message ?: "User is unknown and does not exist")

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Group not found")
open class UnknownGroupException(message: String? = null)
    : NotFoundException(ErrorCode.GroupNotExisting, message ?: "Group is unknown and does not exist")

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Project not found")
open class UnknownProjectException(message: String? = null)
    : NotFoundException(ErrorCode.ProjectNotExisting, message ?: "Project is unknown and does not exist")


class UserNotFoundException(userId: UUID? = null, userName: String? = null, email: String? = null, personId: UUID? = null, gitlabId: Long? = null, subjectId: UUID? = null)
    : NotFoundException(ErrorCode.UserNotExisting, generateUserNotFoundMessage(userId, userName, email, personId, gitlabId, subjectId))

class GroupNotFoundException(groupId: UUID? = null, groupName: String? = null, subjectId: UUID? = null, gitlabId: Long? = null, path: String? = null)
    : UnknownGroupException(generateGroupNotFoundMessage(groupId, groupName, subjectId, gitlabId, path))

class ProjectNotFoundException(projectId: UUID? = null, projectName: String? = null, gitlabId: Long? = null, path: String? = null)
    : UnknownProjectException(generateProjectNotFoundMessage(projectId, projectName, gitlabId, path))

class ExperimentCreateException(errorCode: ErrorCode, message: String) : RestException(errorCode, message)
class ExperimentUpdateException(message: String) : RestException(ErrorCode.ExperimentCannotBeChanged, message)
class ProjectCreationException(errorCode: ErrorCode, message: String) : RestException(errorCode, message)

class PipelineCreateException(errorCode: ErrorCode, message: String? = "") : RestException(errorCode, message ?: "")
class PipelineStartException(message: String) : RestException(ErrorCode.CommitPipelineScriptFailed, message)

// FIXME: I honestly dont understand RuntimeException
class BadParametersException(message: String? = null) : RuntimeException(message ?: "Internal exception")

@ResponseStatus(code = HttpStatus.INTERNAL_SERVER_ERROR, reason = "Gitlab is unavailable")
open class GitlabCommonException(
    val statusCode: Int, errorCode: ErrorCode, message: String
) : RestException(errorCode, message)

@ResponseStatus(code = HttpStatus.INTERNAL_SERVER_ERROR, reason = "Gitlab authentication failed")
class GitlabAuthenticationFailedException(statusCode: Int, error: ErrorCode, responseBodyAsString: String) : GitlabCommonException(statusCode, error, responseBodyAsString)

@ResponseStatus(code = HttpStatus.INTERNAL_SERVER_ERROR, reason = "Gitlab answered incorrectly")
class GitlabIncorrectAnswerException(message: String) : RestException(500, message)

private fun generateUserNotFoundMessage(userId: UUID?, userName: String?, email: String?,
                                        personId: UUID?, gitlabId: Long?, subjectId: UUID?) = listOf(
    "User id" to userId,
    "Username" to userName,
    "Email Address" to email,
    "Person id" to personId,
    "Gitlab id" to gitlabId,
    "Subject id" to subjectId
)
    .filter { it.second != null }
    .joinToString(prefix = "User not found by ", separator = " and ") {
        "${it.first} = ${it.second}"
    }


private fun generateGroupNotFoundMessage(groupId: UUID?, groupName: String?,
                                         subjectId: UUID?, gitlabId: Long?, path: String?) = listOf(
    "Group id" to groupId,
    "Group name" to groupName,
    "Path" to path,
    "Gitlab id" to gitlabId,
    "Subject id" to subjectId
)
    .filter { it.second != null }
    .joinToString(prefix = "Group not found by ", separator = " and ") {
        "${it.first} = ${it.second}"
    }


private fun generateProjectNotFoundMessage(projectId: UUID?, projectName: String?,
                                           gitlabId: Long?, path: String?) = listOf(
    "Project id" to projectId,
    "Project name" to projectName,
    "Path" to path,
    "Gitlab id" to gitlabId
)
    .filter { it.second != null }
    .joinToString(prefix = "Project not found by ", separator = " and ") {
        "${it.first} = ${it.second}"
    }




