package com.mlreef.rest

enum class AccessLevel(val accessCode: Int) {
    NONE(0),
    GUEST(10),
    REPORTER(20),
    DEVELOPER(30),
    MAINTAINER(40),
    OWNER(50);

    companion object {
        @JvmStatic
        fun fromCode(code: Int?): AccessLevel? {
            return values().firstOrNull { it.accessCode == code }
        }

        fun parse(name: String): AccessLevel = parseOrNull(name) ?: throw EnumConstantNotPresentException(AccessLevel::class.java, name)

        fun parseOrNull(name: String?): AccessLevel? = values().firstOrNull { it.name.equals(name?.trim(), true) }

        @JvmStatic
        fun isSufficientFor(instance: AccessLevel?, limit: AccessLevel?): Boolean {
            if (limit == null) return true
            if (instance == null) return false
            return instance.accessCode >= limit.accessCode
        }
    }

    fun satisfies(limit: AccessLevel?) = isSufficientFor(this, limit)
}
