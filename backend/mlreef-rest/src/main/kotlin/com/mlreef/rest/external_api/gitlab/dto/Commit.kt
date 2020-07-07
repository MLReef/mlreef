package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
class Commit(
    val authorEmail: String = "",
    val authorName: String = "",
    val authoredDate: String = "",
    val committerEmail: String = "",
    val committerName: String = "",
    val committedDate: String = "",
    val title: String = "",
    val message: String = "",
    val id: String = "",
    val shortId: String = "",
    val status: String? = null,
    val stats: CommitStats? = null
) : Serializable
