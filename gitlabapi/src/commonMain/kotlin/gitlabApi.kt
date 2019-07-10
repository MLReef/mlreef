package com.mlreef.gitlabapi.v4

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.header
import kotlinx.io.core.use
import kotlinx.serialization.ImplicitReflectionSerializer
import kotlinx.serialization.UnstableDefault
import kotlinx.serialization.json.Json
import kotlinx.serialization.parse
import kotlinx.serialization.parseList

@UnstableDefault
val gitlabSerializer = Json.nonstrict

var requestNumber = 0

@UnstableDefault
@ImplicitReflectionSerializer
private suspend inline fun <reified T : Any> doAuthenticatedRequest(url: String, token: String? = ""): T {
    val i = requestNumber++
    return try {
        info("Request $i to: $url")
        HttpClient()
            .use { client ->
                client.get(url) {
                    token?.let { header("PRIVATE-TOKEN", token) }
                } as String
            }
            .also { trace("Request $i response body: $it") }
            .also { debug("Request $i End") }
            .let { gitlabSerializer.parse(it) }
    } catch (t: Throwable) {
        error("Request $i threw exception ${t::class.simpleName} with message: ${t.message}")
        throw t
    }
}

@UnstableDefault
@ImplicitReflectionSerializer
private suspend inline fun <reified T : Any> doAuthenticatedCollectionRequest(
    url: String,
    token: String? = ""
): List<T> {
    val i = requestNumber++
    return try {
        info("Request $i to: $url")
        HttpClient()
            .use { client ->
                client.get(url) {
                    token?.let { header("PRIVATE-TOKEN", token) }
                } as String
            }
            .also { debug("Request $i End") }
            .let { gitlabSerializer.parseList(it) }
    } catch (t: Throwable) {
        error("Request $i threw exception ${t::class.simpleName} with message: ${t.message}")
        throw t
    }
}


@UnstableDefault
@UseExperimental(ImplicitReflectionSerializer::class)
suspend fun getGroup(token: String? = null, groupName: String, domainName: String = "gitlab.com"): Group =
    doAuthenticatedRequest("https://$domainName/api/v4/groups/$groupName/", token)


@UnstableDefault
@UseExperimental(ImplicitReflectionSerializer::class)
suspend fun getGroups(token: String? = null, domainName: String = "gitlab.com"): Collection<Group> =
    doAuthenticatedCollectionRequest(
        token = token,
        url = "https://$domainName/api/v4/groups/"
    )

@UnstableDefault
@UseExperimental(ImplicitReflectionSerializer::class)
suspend fun listRepoDirectory(
    token: String? = null,
    projectId: Long,
    path: String = "/",
    recursive: Boolean = false,
    domainName: String = "gitlab.com"
): List<TreeItem> =
    doAuthenticatedCollectionRequest(
        token = token,
        url = "https://$domainName/api/v4/projects/$projectId/repository/tree?ref=master&recursive=$recursive&path=$path"
    )

