package com.mlreef.rest.domain.converters

import javax.persistence.AttributeConverter
import javax.persistence.Converter

@Converter
class StringMapConverter : AttributeConverter<Map<String, String>, String> {
    companion object {
        //        const val ENTRY_SEPARATOR = '\u0001'
//        const val ITEM_SEPARATOR = "|"
        const val ENTRY_SEPARATOR = '\t'
        const val ITEM_SEPARATOR = "\n"
    }

    override fun convertToDatabaseColumn(strings: Map<String, String>?): String? {
        if (strings == null || strings.isEmpty()) {
            return null
        }

        return strings.entries.map { "${it.key}$ENTRY_SEPARATOR${it.value}" }.joinToString(ITEM_SEPARATOR)
    }

    override fun convertToEntityAttribute(dbData: String?): MutableMap<String, String> {
        if (dbData == null || dbData.trim { it <= ' ' }.length == 0) {
            return mutableMapOf()
        }

        return dbData
            .split(ITEM_SEPARATOR.toRegex())
            .dropLastWhile { it.isEmpty() }
            .map { it.trim() }
            .map {
                val entries = it.split(ENTRY_SEPARATOR)
                (entries.getOrNull(0) ?: "") to (entries.getOrNull(1) ?: "")
            }
            .toMap().toMutableMap()
    }
}