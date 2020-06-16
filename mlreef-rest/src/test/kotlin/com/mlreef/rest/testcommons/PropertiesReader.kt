package com.mlreef.rest.testcommons

import org.springframework.boot.env.YamlPropertySourceLoader
import org.springframework.core.env.MapPropertySource
import org.springframework.core.io.ClassPathResource
import java.io.FileInputStream
import java.util.Properties


class PropertiesReader(propertyFileName: String) {
    private val properties: Properties

    init {
        properties = if (propertyFileName.endsWith(".yml")) {
            readYmlProperties(propertyFileName)
        } else {
            readProperties(propertyFileName)
        } ?: throw RuntimeException("Unable to read $propertyFileName")
    }

    fun getProperty(key: Any?): String? {
        return properties[key].toString()
    }

    private fun readProperties(propertiesFileName:String): Properties? {
        return try {
            val properties = Properties()
            val url = PropertiesReader::class.java.classLoader.getResource(propertiesFileName)
            properties.load(FileInputStream(url!!.path))
            properties
        } catch (ex: Exception) {
            ex.printStackTrace()
            null
        }
    }

    private fun readYmlProperties(propertiesFileName:String): Properties? {
        val loader = YamlPropertySourceLoader()
        return try {
            val applicationYamlPropertySource = loader.load("properties", ClassPathResource(propertiesFileName))[0]
            val source: Map<*, *> = (applicationYamlPropertySource as MapPropertySource).source
            val properties = Properties()
            properties.putAll(source)
            properties
        } catch (ex: Exception) {
            ex.printStackTrace()
            null
        }
    }

}