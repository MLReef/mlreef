package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.time.ZonedDateTime

/**
 *  {
"id": 47,
"status": "pending",
"ref": "new-pipeline",
"sha": "a91957a858320c0e17f3a0eca7cfacbff50ea29a",
"web_url": "https://example.com/foo/bar/pipelines/47",
"created_at": "2016-08-11T11:28:34.085Z",
"updated_at": "2016-08-11T11:32:35.169Z",
},
 */
// TODO check datatypes for all fields
@JsonIgnoreProperties(ignoreUnknown = true)
class GitlabPipeline(
    val id: Long,
    val status: String?,
    val ref: String,
    val sha: String,
    val webUrl: String? = "",
    val createdAt: ZonedDateTime? = null,
    val updatedAt: ZonedDateTime? = null,
    val beforeSha: String? = null,
    val user: GitlabUser? = null,
    val yamlErrors: Any? = null,
    val startedAt: ZonedDateTime? = null,
    val finishedAt: ZonedDateTime? = null,
    val committedAt: ZonedDateTime? = null,
    val duration: String? = null,
    val coverage: String? = null
)
