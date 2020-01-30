package com.mlreef.rest.utils

object RandomUtils {
    private val charPool: List<Char> = ('a'..'z') + ('A'..'Z') + ('0'..'9')
    private val enhancedCharPool: List<Char> = charPool + listOf('!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '+', '=', '|', '{', '}', '[', ']', ':', ';')
    private const val DEFAULT_PASSWORD_LENGTH = 30

    fun generateRandomPassword(length: Int, strong: Boolean = true): String {
        return (1..if (length <= 0) DEFAULT_PASSWORD_LENGTH else length)
            .map { _ -> kotlin.random.Random.nextInt(0, if (strong) enhancedCharPool.size else charPool.size) }
            .map(if (strong) enhancedCharPool::get else charPool::get)
            .joinToString("")
    }
}
