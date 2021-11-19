package com.mlreef.rest.feature.system

import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.ForbiddenContentException
import com.mlreef.rest.exceptions.UserAlreadyExistsException
import lombok.RequiredArgsConstructor
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
@RequiredArgsConstructor
class ReservedNamesService {
    val log = LoggerFactory.getLogger(this::class.java)

    val userNames = setOf(
        "admin", "id", "slug", "api", "badges", "blame", "blob", "builds", "commits",
        "assets", "autocomplete", "dashboard", "help", "import", "invites", "jwt",
        "create", "update", "delete", "start", "cancel", "finish", "uploads", "archive",
        "create_dir", "edit", "files", "find_file", "explore", "entries",
        "new", "my", "data", "fork", "code", "star", "own", "starred",
        "preview", "raw", "refs", "tree", "public", "all", "tags", "text",
        "search", "register", "login", "oauth", "profile", "group", "groups",
        "short", "project", "projects", "data-projects", "code-projects",
        "snippets", "unsubscribes", "subscribe", "unsubscribe", "confirm",
        "user", "users", "v1", "publish", "unpublish", "republish", "parser", "parse",
        "check", "myself", "whoami", "experiments", "experiment", "pipeline_instance",
        "data-processor", "data-processors", "processor", "processors",
        "password", "reset", "email", "sessions", "kill", "find",
        "pipelines", "pipeline", "pipelines-configs", "config", "configuration",
        "create-start-instance", "instances", "instance",
        "create-requests", "update-requests", "request", "requests",
        "info", "status", "health", "ping",
        "wikis", "namespace", "namespaces", "visitor", "visitors"
    )

    val projectNames = listOf(
        "\\-", "badges", "blame", "blob", "builds", "commits",
        "create", "create_dir", "edit", "environments/folders", "files", "find_file",
        "gitlab-lfs/objects", "info/lfs/objects", "new",
        "preview", "raw", "refs", "tree",
        "update", "wikis"
    )

    val groupNames = listOf(
        "\\-", ".well-known", "404.html", "422.html", "500.html",
        "502.html", "503.html", "abuse_reports", "admin", "api",
        "apple-touch-icon-precomposed.png", "apple-touch-icon.png",
        "assets", "autocomplete", "dashboard", "deploy.html",
        "explore", "favicon.ico", "favicon.png", "files", "groups",
        "health_check", "help", "import", "invites", "jwt",
        "login", "oauth", "profile", "projects", "public",
        "robots.txt", "s", "search", "sent_notifications",
        "slash-command-logo.png", "snippets", "unsubscribes",
        "uploads", "users", "v2")

    fun isReservedGroupName(name: String) = groupNames.contains(name.toLowerCase())
    fun isReservedProjectName(name: String) = projectNames.contains(name.toLowerCase())

    fun assertGroupNameIsNotReserved(name: String) {
        if (isReservedGroupName(name)) {
            throw ForbiddenContentException(ErrorCode.GroupNameInvalidReserved, "Group's name $name is reserved and restricted to use")
        }
    }

    fun assertProjectNameIsNotReserved(name: String) {
        if (isReservedProjectName(name)) {
            throw ForbiddenContentException(ErrorCode.ProjectNameInvalidReserved, "Project's name $name is reserved and restricted to use")
        }
    }

    fun assertUserNameIsNotReserved(name: String) {
        if (name.trim().toLowerCase() in userNames) {
            log.error("Username $name is reserved word")
            throw UserAlreadyExistsException(username = name) //Do not expose the real reason why the username cannot be taken
        }
    }

    fun isUserNameReserved(name: String): Boolean {
        return (name.trim().toLowerCase() in userNames)
    }
}