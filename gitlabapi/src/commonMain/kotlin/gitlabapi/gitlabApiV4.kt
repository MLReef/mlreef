package com.mlreef.gitlabapi

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.header
import kotlinx.coroutines.delay
import kotlinx.io.core.use
import kotlinx.serialization.ImplicitReflectionSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.UnstableDefault
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonParsingException
import kotlinx.serialization.parse
import kotlinx.serialization.parseList
import kotlin.js.JsName

data class Version(val version: String, val revision: String)

@UnstableDefault
val gitlabSerializer = Json.nonstrict

@UnstableDefault
@UseExperimental(ImplicitReflectionSerializer::class)
@JsName("actualGetGroups") // getGroup will be defined inside jsMain
suspend fun getGroups(
    token: String? = null,
    domainName: String = "gitlab.com"
): Collection<Group> {
    val res: String = HttpClient().use { client ->
        client.get("https://$domainName/api/v4/groups/") {
            token?.let { header("PRIVATE-TOKEN", token) }
        }
    }
    return try {
        gitlabSerializer.parseList(res)
    } catch (e: JsonParsingException) {
        throw SerializationException(message = "Parsing of following json failed: \\n $res", cause = e)
    }
}


@UnstableDefault
@UseExperimental(ImplicitReflectionSerializer::class)
@JsName("actualGetGroup") // getGroup will be defined inside jsMain
suspend fun getGroup(
    token: String? = null,
    groupName: String,
    domainName: String = "gitlab.com"
): Group {
    println("Sarting getGroup request to gitlabApi")
    val res: String = HttpClient()
        .use { client ->
            client.get("https://$domainName/api/v4/groups/$groupName/") {
                token?.let { header("PRIVATE-TOKEN", token) }
            }
        }
    println("Ending getGroup request to gitlabApi")
    return try {
        gitlabSerializer.parse(res)
    } catch (e: JsonParsingException) {
        throw SerializationException(message = "Parsing of following json failed: \\n $res", cause = e)
    }
}


@Serializable
open class Group(
    val id: Long = -1,
    @SerialName("web_url")
    val webUrl: String = "",
    val name: String = "",
    val path: String = "",
    val description: String = "",
    val visibility: String = "",
    @SerialName("lfs_enabled")
    val lfsEnabled: Boolean = false,
    @SerialName("avatar_url")
    val avatarUrl: String? = null,
    @SerialName("request_access_enabled")
    val requestAccessEnabled: Boolean = false,
    @SerialName("full_name")
    val fullName: String = "",
    @SerialName("full_path")
    val fullPath: String = "",
    @SerialName("parent_id")
    val parentId: Int? = null,
    @SerialName("ldap_cn")
    val ldapCn: String? = null,
    @SerialName("ldap_access")
    val ldapAccess: String? = null
)
