package com.mlreef.rest.marketplace

import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataVisualization

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

    companion object {
        fun typeFor(dataProcessor: DataProcessor): SearchableType {
            return when (dataProcessor) {
                is DataOperation -> OPERATION
                is DataVisualization -> VISUALIZATION
                is DataAlgorithm -> ALGORITHM
                else -> throw IllegalArgumentException("Has no correct subtype of $dataProcessor")
            }
        }

        fun typeFor(dataProject: DataProject): SearchableType {
            return DATA_PROJECT
        }
    }
}