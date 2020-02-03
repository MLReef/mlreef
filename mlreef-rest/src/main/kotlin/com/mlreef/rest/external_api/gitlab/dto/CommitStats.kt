package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.io.Serializable


@JsonIgnoreProperties(ignoreUnknown = true)
class CommitStats(
    val additions: Int,
    val deletions: Int,
    val total: Int
) : Serializable



