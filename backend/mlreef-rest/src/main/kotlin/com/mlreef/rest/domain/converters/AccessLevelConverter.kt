package com.mlreef.rest.domain.converters

import com.mlreef.rest.domain.AccessLevel
import javax.persistence.AttributeConverter
import javax.persistence.Converter

@Converter
class AccessLevelConverter : AttributeConverter<AccessLevel?, Int?> {

    override fun convertToDatabaseColumn(attribute: AccessLevel?): Int? {
        return attribute?.accessCode
    }

    override fun convertToEntityAttribute(dbData: Int?): AccessLevel? {
        return AccessLevel.fromCode(dbData)
    }
}