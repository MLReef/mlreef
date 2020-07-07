package com.mlreef.rest.feature.caches.domain

import org.springframework.data.annotation.Id
import org.springframework.data.redis.core.RedisHash
import org.springframework.data.redis.core.index.Indexed
import java.util.UUID

@RedisHash("public_projects")
data class PublicProjectHash(
    @Id
    val gitlabId: Long,
    @Indexed
    val projectId: UUID? = null
)