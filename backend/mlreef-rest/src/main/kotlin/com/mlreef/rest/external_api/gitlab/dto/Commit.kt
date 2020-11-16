package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
data class Commit(
    val authorEmail: String? = null,
    val authorName: String? = null,
    val authoredDate: String? = null,
    val committerEmail: String? = null,
    val committerName: String? = null,
    val committedDate: String? = null,
    val title: String = "",
    val message: String = "",
    val id: String = "",
    val shortId: String = "",
    val status: String? = null,
    val stats: CommitStats? = null
) : Serializable
