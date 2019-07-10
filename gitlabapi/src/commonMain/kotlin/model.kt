package com.mlreef.gitlabapi.v4

import com.mlreef.gitlabapi.v4.FileModes.blob
import com.mlreef.gitlabapi.v4.FileModes.tree
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


@Serializable
data class Group(
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

@Serializable
data class TreeItem(
    val id: String = "",
    val name: String = "",
    val type: FileModes,
    val path: String = "",
    val mode: Int = 100_000
) {
    val isDirectory: Boolean = type == tree
    val isFile: Boolean = type == blob
}

enum class FileModes {
    blob, // blobs are files
    tree  // these are directory subtrees => folders
}
