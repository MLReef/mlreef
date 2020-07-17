package com.mlreef.parsing

import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.EPFAnnotation
import com.mlreef.rest.MetricSchema
import com.mlreef.rest.MetricType
import com.mlreef.rest.ParameterType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.VisibilityScope
import java.io.InputStream
import java.util.UUID.randomUUID

interface MLParser {
    fun parse(inStream: InputStream): MLParseResult
}

abstract class PythonParserException(message: String) : IllegalStateException(message)
class MultipleDataProcessorsFoundException : PythonParserException("Multiple DataProcessors were found, but just 1 is supported")
class BadParameterNameException(name: String) : PythonParserException("Bad parameter naming: $name")

object ModelExtractor {
    fun createDataOperation(values: Map<String, String>): EPFAnnotation {
        var slug: String? = null
        var name: String? = null
        var command: String? = null
        var description: String? = null

        if (values.containsKey("slug")) slug = values["slug"]
        if (values.containsKey("name")) name = values["name"]
        if (values.containsKey("command")) command = values["command"]
        if (values.containsKey("description")) description = values["description"]
        if (slug.isNullOrEmpty()) {
            slug = name?.toSlug()
        }
        if (command.isNullOrEmpty()) {
            command = name?.toSlug() + ".py"
        }
        val processorType = DataProcessorType.valueOf(enumOrFail(values, "type"))
        val inputDataType = DataType.valueOf(enumOrFail(values, "input_type"))
        val outputDataType = DataType.valueOf(enumOrFail(values, "output_type"))
        val visibilityScope = VisibilityScope.valueOf(enumOrFail(values, "visibility"))

        val processor: DataProcessor = when (processorType) {
            DataProcessorType.VISUALISATION -> createDataVisualisation(name, slug, command, description, inputDataType, visibilityScope)
            DataProcessorType.OPERATION -> createDataOperation(name, slug, command, description, inputDataType, outputDataType, visibilityScope)
            DataProcessorType.ALGORITHM -> createDataAlgorithm(name, slug, command, description, inputDataType, outputDataType, visibilityScope)
        }
        return processor
    }

    private fun createDataOperation(name: String?, slug: String?, command: String, description: String?, inputDataType: DataType, outputDataType: DataType, visibilityScope: VisibilityScope): DataOperation {
        return DataOperation(
            id = randomUUID(),
            name = name!!,
            slug = slug!!,
            author = null,
            description = description ?: "",
            inputDataType = inputDataType,
            outputDataType = outputDataType,
            visibilityScope = visibilityScope)
    }


    private fun createDataAlgorithm(name: String?, slug: String?, command: String, description: String?, inputDataType: DataType, outputDataType: DataType, visibilityScope: VisibilityScope) =
        DataAlgorithm(
            id = randomUUID(),
            name = name!!,
            slug = slug!!,
            author = null,
            description = description ?: "",
            inputDataType = inputDataType,
            outputDataType = outputDataType,
            visibilityScope = visibilityScope)

    private fun createDataVisualisation(name: String?, slug: String?, command: String, description: String?, inputDataType: DataType, visibilityScope: VisibilityScope) =
        DataVisualization(
            id = randomUUID(),
            name = name!!,
            slug = slug!!,
            author = null,
            description = description ?: "",
            inputDataType = inputDataType,
            visibilityScope = visibilityScope)

    fun createParameter(context: ParsingContext, namedArguments: Map<String, String>, sequentialArguments: List<String>): EPFAnnotation {

        var name: String? = null
        var parameterTypeString: String? = null
        var requiredString: String? = null
        var defaultValue: String? = null
        var description: String? = null

        val countOrderedValues = sequentialArguments.size - namedArguments.size
        if (countOrderedValues > 0) {
            // begin with parsing the ordered arguments
            name = takeUntil(sequentialArguments, 0, countOrderedValues)
            parameterTypeString = takeUntil(sequentialArguments, 1, countOrderedValues)
            requiredString = takeUntil(sequentialArguments, 2, countOrderedValues)
            defaultValue = takeUntil(sequentialArguments, 3, countOrderedValues)
            description = takeUntil(sequentialArguments, 4, countOrderedValues)
        }
        name = name ?: getOrFail(namedArguments, "name")
        parameterTypeString = parameterTypeString ?: getOrFail(namedArguments, "type")
        requiredString = requiredString ?: getOrFail(namedArguments, "required")
        defaultValue = defaultValue ?: getOrFail(namedArguments, "defaultValue")
        description = description ?: getOrEmpty(namedArguments, "description")

        val parameterType = getParameterType(parameterTypeString.toUpperCase())
        val required = getBoolean(requiredString.toUpperCase())

        val order = context.countParameters + 1
        context.countParameters++

        val dataProcessor = context.dataProcessor!!

        return ProcessorParameter(
            id = randomUUID(), processorVersionId = dataProcessor.id,
            name = name, type = parameterType, required = required,
            defaultValue = defaultValue, order = order, description = description)
    }

    // @metric(name='recall', ground_truth=test_truth, prediction=test_pred)
    fun createMetric(namedArguments: Map<String, String>, sequentialArguments: List<String>): EPFAnnotation {
        var typeString: String? = null
        var groundTruth: String? = null
        var prediction: String? = null

        val countOrderedValues = sequentialArguments.size - namedArguments.size
        if (countOrderedValues > 0) {
            // begin with parsing the ordered arguments
            typeString = takeUntil(sequentialArguments, 0, countOrderedValues)
            groundTruth = takeUntil(sequentialArguments, 1, countOrderedValues)
            prediction = takeUntil(sequentialArguments, 2, countOrderedValues)
        }
        typeString = typeString ?: getOrFail(namedArguments, "name")
        groundTruth = groundTruth ?: getOrFail(namedArguments, "ground_truth")
        prediction = prediction ?: getOrFail(namedArguments, "prediction")

        val metricType = getMetricType(typeString.toUpperCase())

        val metricSchema = MetricSchema(metricType, groundTruth, prediction)


        return metricSchema
    }

    private fun getParameterType(parameterTypeString: String): ParameterType {
        return when (parameterTypeString) {
            ("STRING") -> ParameterType.STRING
            ("STR") -> ParameterType.STRING
            ("INTEGER") -> ParameterType.INTEGER
            ("INT") -> ParameterType.INTEGER
            ("FLOAT") -> ParameterType.FLOAT
            ("BOOLEAN") -> ParameterType.BOOLEAN
            ("BOOL") -> ParameterType.BOOLEAN
            ("COMPLEX") -> ParameterType.COMPLEX
            ("DICTIONARY") -> ParameterType.DICTIONARY
            ("LIST") -> ParameterType.LIST
            ("TUPLE") -> ParameterType.TUPLE
            else -> ParameterType.UNDEFINED
        }
    }

    private fun getMetricType(parameterTypeString: String): MetricType {
        return when (parameterTypeString) {
            ("RECALL") -> MetricType.RECALL
            ("PRECISION") -> MetricType.PRECISION
            ("F1_SCORE") -> MetricType.F1_SCORE
            ("F1") -> MetricType.F1_SCORE
            else -> MetricType.UNDEFINED
        }
    }

    private fun takeUntil(sequentialArguments: List<String>, index: Int, upperBount: Int): String? {
        return if (index >= upperBount) {
            null
        } else {
            sequentialArguments.getOrNull(index)
        }
    }

    private fun getBoolean(toUpperCase: String): Boolean {
        return when (toUpperCase) {
            ("TRUE") -> true
            ("FALSE") -> false
            else -> false
        }
    }

    private fun enumOrFail(values: Map<String, String>, key: String): String = getOrFail(values, key).toUpperCase()

    private fun getOrFail(values: Map<String, String>, key: String): String {
        return if (values.containsKey(key)) {
            values[key]!!
        } else {
            error("No $key provided")
        }
    }

    private fun getOrEmpty(values: Map<String, String>, key: String): String {
        return if (values.containsKey(key)) {
            values[key]!!
        } else {
            ""
        }
    }
}

private fun String?.toSlug(): String? {
    return this?.toLowerCase()?.replace(Regex("[\\t\\s -_]"), "-")
}

class MLParseResult {
    var mlAnnotations: List<EPFAnnotation> = mutableListOf()
    var countFunctions: Int = 0
    var countMLDecoratedFunctions: Int = 0
    var countMLFunctionParameters: Int = 0
    var countMLDataProcessor: Int = 0
    var countMLMetricSchema: Int = 0

    fun validate() {
        val nameValidator = Regex("[a-zA-Z0-9_]*")

        val annotatedParameterNames = mlAnnotations.filterIsInstance<ProcessorParameter>().map { it.name }

        annotatedParameterNames.forEach {
            if (!nameValidator.matches(it)) {
                throw BadParameterNameException(it)
            }
        }
    }
}
