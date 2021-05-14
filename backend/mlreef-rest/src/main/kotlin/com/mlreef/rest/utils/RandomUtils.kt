package com.mlreef.rest.utils

import com.mlreef.rest.utils.StringUtils.charNumberPool
import com.mlreef.rest.utils.StringUtils.charPool
import com.mlreef.rest.utils.StringUtils.enhancedCharPool

object RandomUtils {

    private const val DEFAULT_USERNAME_LENGTH = 10
    private const val DEFAULT_PASSWORD_LENGTH = 30

    fun generateRandomPassword(length: Int, strong: Boolean = true): String {
        return (1..if (length <= 0) DEFAULT_PASSWORD_LENGTH else length)
            .map { _ -> kotlin.random.Random.nextInt(0, if (strong) enhancedCharPool.size else charNumberPool.size) }
            .map(if (strong) enhancedCharPool::get else charNumberPool::get)
            .joinToString("")
    }

    fun generateRandomUserName(length: Int): String {
        return (1..if (length <= 0) DEFAULT_USERNAME_LENGTH else length)
            .map { _ -> kotlin.random.Random.nextInt(0, charPool.size) }
            .map(charPool::get)
            .joinToString("")
            .toLowerCase()
    }

    fun randomGitlabId() = kotlin.random.Random.nextInt(1, 10000000).toLong()

}
