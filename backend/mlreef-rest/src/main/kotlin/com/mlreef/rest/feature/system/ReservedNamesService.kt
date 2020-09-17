package com.mlreef.rest.feature.system

import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.ForbiddenContentException
import lombok.RequiredArgsConstructor
import org.springframework.stereotype.Service

@Service
@RequiredArgsConstructor
class ReservedNamesService {

    val projectNames = listOf(
        "\\-", "badges", "blame", "blob", "builds", "commits",
        "create", "create_dir", "edit", "environments/folders", "files", "find_file",
        "gitlab-lfs/objects", "info/lfs/objects", "new",
        "preview", "raw", "refs", "tree",
        "update", "wikis")

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

}