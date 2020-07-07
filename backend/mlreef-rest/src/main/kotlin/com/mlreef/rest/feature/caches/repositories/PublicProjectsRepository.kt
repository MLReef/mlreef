package com.mlreef.rest.feature.caches.repositories

import com.mlreef.rest.KtCrudRepository
import com.mlreef.rest.feature.caches.domain.PublicProjectHash
import org.springframework.data.repository.query.QueryByExampleExecutor
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PublicProjectsRepository: KtCrudRepository<PublicProjectHash, Long>, QueryByExampleExecutor<PublicProjectHash> {

    fun findByProjectId(projectId: UUID): PublicProjectHash?
}