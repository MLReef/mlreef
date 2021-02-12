package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import org.springframework.http.ResponseEntity

const val X_PAGE_HEADER = "X-Page"
const val X_TOTAL_PAGES_HEADER = "X-Total-Pages"
const val X_TOTAL_ELEMENTS_HEADER = "X-Total"
const val X_ELEMENTS_PER_PAGE_HEADER = "X-Per-Page"

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class GitlabPage<T>(
    val content: List<T>?,
    val page: Int,
    val totalPages: Int,
    val totalElements: Int,
    val perPage: Int,
) {
    constructor(response: ResponseEntity<List<T>>) : this(
        response.body,
        response.headers.getOrEmpty(X_PAGE_HEADER).getOrNull(0)?.toInt() ?: 0,
        response.headers.getOrEmpty(X_TOTAL_PAGES_HEADER).getOrNull(0)?.toInt() ?: 0,
        response.headers.getOrEmpty(X_TOTAL_ELEMENTS_HEADER).getOrNull(0)?.toInt() ?: 0,
        response.headers.getOrEmpty(X_ELEMENTS_PER_PAGE_HEADER).getOrNull(0)?.toInt() ?: 0,
    )
}
