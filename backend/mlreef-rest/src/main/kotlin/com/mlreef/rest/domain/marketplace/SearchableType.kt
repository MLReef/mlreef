package com.mlreef.rest.domain.marketplace

enum class SearchableType {
    DATA_PROJECT,
    CODE_PROJECT,
    OPERATION,
    VISUALIZATION,
    ALGORITHM;

    fun isDataProcessor(): Boolean {
        return when (this) {
            DATA_PROJECT -> false
            else -> true
        }
    }
}