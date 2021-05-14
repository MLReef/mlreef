package com.mlreef.rest.domain.converters

import javax.persistence.AttributeConverter
import javax.persistence.Converter

@Converter
class PairListConverter : AttributeConverter<List<Pair<String, String>>, String> {
    companion object {
        const val ENTRY_SEPARATOR = '\t'
        const val ITEM_SEPARATOR = "\n"
    }

    override fun convertToDatabaseColumn(pairsList: List<Pair<String, String>>?): String? {
        if (pairsList == null || pairsList.isEmpty()) {
            return null
        }

        return pairsList.map { "${it.first}$ENTRY_SEPARATOR${it.second}" }.joinToString(ITEM_SEPARATOR)
    }

    override fun convertToEntityAttribute(dbData: String?): MutableList<Pair<String, String>> {
        if (dbData == null || dbData.trim { it <= ' ' }.length == 0) {
            return mutableListOf()
        }

        return dbData
            .split(ITEM_SEPARATOR.toRegex())
            .dropLastWhile { it.isEmpty() }
            .map { it.trim() }
            .map {
                val entries = it.split(ENTRY_SEPARATOR)
                (entries.getOrNull(0) ?: "") to (entries.getOrNull(1) ?: "")
            }.toMutableList()
    }
}