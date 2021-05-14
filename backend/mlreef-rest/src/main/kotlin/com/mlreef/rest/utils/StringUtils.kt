package com.mlreef.rest.utils

object StringUtils {
    val charPool: List<Char> = ('a'..'z') + ('A'..'Z')
    val charNumberPool: List<Char> = charPool + ('0'..'9')
    val enhancedCharPool: List<Char> = charNumberPool + listOf('!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '+', '=', '|', '{', '}', '[', ']', ':', ';', '_')
}