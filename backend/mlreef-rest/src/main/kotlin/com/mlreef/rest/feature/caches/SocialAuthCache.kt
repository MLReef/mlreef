package com.mlreef.rest.feature.caches

import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.CachePut
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

interface SocialAuthCache {
    fun putCode(code:String): String
    fun getCode(code:String): String?
    fun evictCode(code:String)
}

@Service
class SocialAuthCacheImpl: SocialAuthCache {
    @CachePut(cacheNames = ["social"], key = "{#code}")
    override fun putCode(code: String) = code

    @Cacheable(cacheNames = ["social"], key = "{#code}", unless = "#result == null")
    override fun getCode(code: String) = null

    @CacheEvict(cacheNames = ["social"], key = "{#code}")
    override fun evictCode(code: String) = Unit
}