package com.mlreef.rest

import java.util.*
import javax.persistence.Embeddable
import javax.persistence.Entity
import javax.persistence.Id


open class Subject {
    val id: UUID? = null
    val slug: String = ""
    val name: String = ""
}

class Person : Subject() {
    val memberships: List<Organisation> = listOf()
}

class Organisation : Subject() {
    val members: List<Person> = listOf()
}

enum class VisibilityScope {
    PRIVATE,
    PUBLIC,
    TEAM_PRIVATE
}

/**
 * A Taggable entity can be described and linked with certain Tags
 *
 */
interface Taggable {
    val tags: List<Tag>
        get() = listOf()
}

class Tag {
    val name: String = ""
}

/**
 * Symbolize a Gitlab repository which is used in the context of MLReef.
 * Most properties are transient, semantic will be added
 */
open class MLRepository : Taggable {
    val id: UUID? = null
    val slug: String = ""
    val url: String = ""
    val owner: Subject? = null
}

/**
 * A Machine Learning Repository describes the association of data and experiments.
 * A repo can also be described with an DataType, for example a MLDataRepository using Images or signal streams as data
 */
class MLDataRepository : MLRepository() {
    val experiments: List<Experiment> = listOf()
    val dataTypes: List<DataType> = listOf()
}

/**
 * A Code Repository is used for the working Code like Data Operations,
 * Algorithms, or soon Visualisations.
 *
 *
 */
open class MLCodeRepository : MLRepository() {
    val dataOperation: DataOperation? = null
}

@Entity
class Experiment {
    @Id
    val id: UUID? = null
    val performanceMetrics: PerformanceMetrics? = null
    val createdAt: Long = 0
}

@Embeddable
class PerformanceMetrics {
    val jsonBlob: String = ""
    val time: Long = 0
    val started: Long = 0
    val finished: Long = 0
}

/**
 * A DataOperation can be applied onto Data to filter or manipulate the Data.
 * The result of DataOperation over Data is Data again.
 *
 * The source and input DataTypes must be defined to be usable for the community
 * The List of Parameters is ordered and names must be uniqe.
 */
class DataOperation : Taggable {
    val repository: MLCodeRepository? = null
    val parameters: List<DOParameter> = listOf()
    val resultDataType: DataType? = null
    val inputDataType: DataType? = null
    val id: UUID? = null
    val slug: String = ""
    val name: String = ""
    val author: Subject? = null
    val description: String = ""
    val visibilityScope: VisibilityScope? = null
}

/**
 * A Parameter describes a native data type (e.g. floating number in python), with a title and descriptions.
 * To support more features, nullable and defaultValues could be provided
 */
class DOParameter {
    val name: String = ""
    val type: ParameterType? = null
    val description: String = ""
    val nullable: Boolean = true
    val defaultValue: String = ""
}

/**
 * ParameterTypes are typical simple data types.
 * Lists and Objects should be supported, but cannot be interfered in a global scope.
 *
 * TODO: Think about aligning the concepts of DataTypes and ParameterTypes
 */
enum class ParameterType {
    BOOLEAN,
    STRING,
    INTEGER,
    LONG,
    COMPLEX,
    FLOAT,
    LIST,
    TUPLE,
    DICTIONARY,
    OBJECT
}

/**
 * DataTypes describe the Data of a MLDataRepository on a higher level.
 * Some DataOperations will support Images, other just EventStreams, Arrays, Matrices or plain Numbers.
 *
 * Note: The singular/plural concept does not apply here, more the high semantic concept of the Machine Learning purpose
 *
 * TODO: A lot of Input is needed here. Also, maybe this will never be an static enum,
 * but a community-provided / moderated entity
 */
enum class DataType {
    ANY,
    IMAGE,
    SENSOR,
    NUMBER,
    MATRIX,
    TEXT,
    BINARY
}
