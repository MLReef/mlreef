package com.mlreef.domain.entities

import java.io.File
import java.util.*
import javax.persistence.*

@MappedSuperclass
abstract class BaseEntity {
    abstract val id: UUID?
    val createdAt: Long = 0
    val updatedAt: Long = 0
}

@MappedSuperclass
abstract class Subject : BaseEntity() {
    val slug: String = ""
    val name: String = ""
}

@Entity
class Person(
        @Id @GeneratedValue override val id: UUID? = null,
        @ManyToMany val memberships: List<Organisation> = listOf()
) : Subject()

@Entity
class Organisation(
        @Id @GeneratedValue override val id: UUID? = null,
        @ManyToMany val members: List<Person> = listOf()
) : Subject()

enum class VisibilityScope {
    PRIVATE,
    PUBLIC,
    TEAM
}



/**
 * Symbolize a Gitlab repository which is used in the context of MLReef.
 * Most properties are transient, semantic will be added
 */
@MappedSuperclass
abstract class MLRepository(
        @Id @GeneratedValue override val id: UUID? = null,
        val slug: String,
        val url: String,
        val owner: Subject
) : BaseEntity()

/**
 * A Machine Learning Repository describes the association of data and experiments.
 * A repo can also be described with an DataType, for example a MLDataRepository using Images a data set
 */
@Entity
class MLDataRepository(
        @Id @GeneratedValue override val id: UUID? = null,
        slug: String,
        url: String,
        owner: Subject,
        val experiments: List<Experiment> = listOf(),
        val dataTypes: List<DataType> = listOf()
) : MLRepository(id, slug, url, owner)

/**
 * A Code Repository is used for the working Code like Data Operations,
 * Algorithms, or soon Visualisations.
 *
 * A
 */
@Entity
open class MLCodeRepository(
        @Id @GeneratedValue override val id: UUID? = null,
        slug: String,
        url: String,
        owner: Subject,
        val dataOperation: DataOperation? = null
) : MLRepository(id, slug, url, owner)

/**
 * Descriptor of an Output, which could be a Gitlab Artifact, an S3 Bucket or many more.
 *
 *
 */

@Entity
class OutputFile(override val id: UUID?) : BaseEntity()

/**
 * An Experiment is a instance of a ProcessingChain with Data
 */
@Entity
class Experiment(
        @Id @GeneratedValue override val id: UUID? = null,
        val performanceMetrics: PerformanceMetrics? = null,
        val outputFile: List<OutputFile>? = null,

        /**
         * Has DataOps and DataVisuals
         */
        val preProcessing: List<DataProcessorInstance>? = null,
        /**
         * Has DataOps and maybe DataVisuals
         */
        val postProcessing: List<DataProcessorInstance>? = null,
        /**
         * Contains exactly 1 Algorithm (could be implement as DataExecutionInstance as well)
         */
        val processing: DataProcessorInstance? = null
) : BaseEntity()

@Embeddable
class PerformanceMetrics {
    val jsonBlob: String = ""
    val time: Long = 0;
    val started: Long = 0;
    val finished: Long = 0;
}

/**
 * A DataProcessor can be applied onto Data to filter or manipulate the Data.
 * The result of DataOperation over Data is Data again, or in special cases, Visualisation output
 *
 * The source and input DataTypes must be defined to be usable for the community
 * The List of Parameters is ordered and names must be uniqe.
 *
 * DataOperations can be chained in a execution
 */
open class DataProcessor(
        @Id @GeneratedValue override val id: UUID? = null,
        val repository: MLCodeRepository? = null,
        val parameters: List<DOParameter> = listOf(),
        val inputDataType: DataType? = null,
        val slug: String = "",
        val name: String = "",
        val author: Subject? = null,
        val description: String = "",
        val visibilityScope: VisibilityScope? = null
) : BaseEntity() {

}

/**
 * DataOperation perform on Data and create Data.
 * Therefore they must be chainable
 */
class DataOperation : DataProcessor() {
    val resultDataType: DataType? = null
}

class DataVisualization : DataProcessor() {
    val resultFiles: List<File> = listOf()
}

/**
 * Proposal: Model DataAlgorithm as a Data processor, even if it not chainable
 */
class DataAlgorithm : DataProcessor() {
}

/**
 * An Instance of DataOperation or DataVisualisation contains instantiated values of Parameters
 */
interface DataProcessorInstance {
    val parent: DataProcessorInstance?
    val parameterValues: List<ParameterInstance>
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

class ParameterInstance {
    val parameter: DOParameter? = null
    val value: Any? = null
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
    COMPLEX,
    FLOAT,
    LIST,
    TUPLE,
    DICTIONARY,
    OBJECT,
    NUMPY_ARRAY
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
    VIDEO,
    SENSOR,
    NUMBER,
    TABULAR,
    TEXT,
    BINARY,
    MODEL
}
