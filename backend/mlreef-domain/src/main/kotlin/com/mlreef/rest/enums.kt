package com.mlreef.rest

import com.fasterxml.jackson.annotation.JsonValue

enum class AccessLevel(val accessCode: Int) {
    NONE(0),
    VISITOR(5), // Use VISITOR for PUBLIC projects as pseudo role
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

enum class PublishingModelType(val code: Int) {
    UNDEFINED(0),
    CNN(1),
    CLUSTERING(2),
    TREE(3),
    REGRESSION(4),
    ;

    @JsonValue
    fun getModelTypeCode() = this.code
}

enum class PublishingMlCategory(val code: Int) {
    UNDEFINED(0),
    REGRESSION(1),
    PREDICTION(2),
    CLASSIFICATION(3),
    DIMENSIONALITY_REDUCTION(4),
    ;

    @JsonValue
    fun getMlCategoryCode() = this.code
}
