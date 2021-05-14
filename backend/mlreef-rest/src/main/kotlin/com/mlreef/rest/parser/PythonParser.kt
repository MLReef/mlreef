package com.mlreef.rest.parser

import com.mlreef.antlr.Python3BaseVisitor
import com.mlreef.antlr.Python3Lexer
import com.mlreef.antlr.Python3Parser
import com.mlreef.rest.domain.EPFAnnotation
import com.mlreef.rest.domain.MetricType
import com.mlreef.rest.domain.MetricsSchema
import com.mlreef.rest.domain.Parameter
import com.mlreef.rest.domain.ParameterType
import com.mlreef.rest.domain.Processor
import com.mlreef.rest.domain.repositories.MetricTypesRepository
import com.mlreef.rest.domain.repositories.ParameterTypesRepository
import org.antlr.v4.runtime.CharStreams
import org.antlr.v4.runtime.CommonTokenStream
import org.slf4j.LoggerFactory
import java.io.InputStream
import java.util.UUID

class PythonParser(
    private val parameterTypesRepository: ParameterTypesRepository,
    private val metricTypesRepository: MetricTypesRepository,
) : Python3BaseVisitor<Any>() {

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    private lateinit var result: MLParseResult

    fun parsePython(inStream: InputStream, errorMessage: MutableList<String>? = null): MLParseResult {
        result = MLParseResult()

        val parser: Python3Parser = CharStreams.fromStream(inStream)
            .let { Python3Lexer(it) }
            .let { CommonTokenStream(it) }
            .let { Python3Parser(it) }

        parser.setParsingErrorProcessor { row, col, msg ->
            errorMessage?.apply {
                add("Error in line $row, column $col: $msg")
            }
        }

        this.visit(parser.file_input())

        return result.apply {
            validate()
        }
    }

    override fun visitFuncdef(ctx: Python3Parser.FuncdefContext?) {
        if (ctx == null) return
        result.countFunctions += 1
    }

    // Annotations on Python are called Decorators
    // ==> one Decorated context is equal to an annotation
    override fun visitDecorated(context: Python3Parser.DecoratedContext?) {
        if (context == null) return
        log.info("parsing decorated function: ${context.funcdef()?.NAME()} with ${context.decorators()?.text}")
        result.countFunctions += 1
        nullSafeVisitDecorated(context)
    }

    private fun nullSafeVisitDecorated(context: Python3Parser.DecoratedContext) {
        var index = 0
        var processor: Processor? = null

        context.decorators().children
            .filterIsInstance<Python3Parser.DecoratorContext>()
            .mapNotNull {
                println("Annotation: ${it.text}")
                try {
                    //e.g. @parameter(parameters...)
                    //@parameters => Dotted_namedContext
                    //parameters.. => arglist
                    //children[0] = "@"
                    //children[1] = "parameter"
                    //children[2] = "("
                    //children[3] = parameters...
                    //children[4] = "4"
                    val mlAnnotation = create(
                        nameContext = it.children[1] as Python3Parser.Dotted_nameContext,
                        arglistContext = it.children[3] as Python3Parser.ArglistContext,
                        processor = processor,
                        index = index++,
                    )
                    result.mlAnnotations += mlAnnotation
                    when (mlAnnotation) {
                        is Processor -> {
                            result.countMLDataProcessor += 1
                            processor = mlAnnotation
                        }
                        is Parameter -> result.countMLFunctionParameters += 1
                        is MetricsSchema -> result.countMLMetricSchema += 1
                        else -> log.warn("Could not handle:$mlAnnotation")
                    }
                    return@mapNotNull mlAnnotation
                } catch (error: Exception) {
                    log.warn(error.message)
                    return@mapNotNull null // will be filtered out and thus ignored
                }
            }
            .also {
                if (it.isNotEmpty()) result.countMLDecoratedFunctions += 1
            }
    }

    private fun create(
        nameContext: Python3Parser.Dotted_nameContext,
        arglistContext: Python3Parser.ArglistContext,
        processor: Processor?,
        index: Int
    ): EPFAnnotation {
        val name: String = nameContext.text
        val arguments = arglistContext.argument()
        // transform context to map
        val argMap: Map<String, String> = arguments
            .filter { argumentContext -> argumentContext.text.isNotBlank() && argumentContext.test().size > 1 }
            .map { argumentContext ->
                val tupleKey = argumentContext.test(0).text
                val tupleValue = argumentContext.test(1).text.replace("\"", "")
                tupleKey to tupleValue.clean()
            }.toMap()
        // transform context orderedList
        val argList: List<String> = arguments
            .filter { it.text.isNotBlank() && it.test().size > 0 }
            .map { it.test(0).text.clean() }
        return when (name) {
            // hardcoded name for MLReef annotations
            "param", "parameter" -> createParameter(
                argMap,
                argList,
                processor ?: throw IncorrectParametersOrder(),
                index
            )
            "processor", "data_processor" -> createProcessor(argMap)
            "metric" -> createMetric(argMap, argList)
            else -> throw IllegalArgumentException("Not supported Annotation: $name")
        }
    }

    fun createProcessor(values: Map<String, String>): EPFAnnotation {
        val slug: String = values["slug"]
            ?: values["name"]?.toSlug()
            ?: throw NullPointerException()
        val name: String = values["name"]
            ?: values["slug"]
            ?: throw NullPointerException()
        val description: String = values["description"] ?: ""

        return Processor(
            UUID.randomUUID(),
            description = description,
        )
    }

    private fun createParameter(
        namedArguments: Map<String, String>,
        sequentialArguments: List<String>,
        processor: Processor,
        index: Int
    ): EPFAnnotation {
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

        return Parameter(
            id = UUID.randomUUID(),
            name = name,
            parameterType = getParameterType(parameterTypeString),
            required = getBoolean(requiredString),
            defaultValue = defaultValue,
            order = index,
            description = description,
            processor = processor
        )
    }

    // @metric(name='recall', ground_truth=test_truth, prediction=test_pred)
    private fun createMetric(namedArguments: Map<String, String>, sequentialArguments: List<String>): EPFAnnotation {
        var typeString: String? = null
        var groundTruth: String? = null
        var prediction: String? = null

        val countOrderedValues = sequentialArguments.size - namedArguments.size
        if (countOrderedValues > 0) {
            // begin with parsing the ordered arguments
            typeString = takeUntil(sequentialArguments = sequentialArguments, index = 0, upperBount = countOrderedValues)
            groundTruth = takeUntil(sequentialArguments, 1, countOrderedValues)
            prediction = takeUntil(sequentialArguments, 2, countOrderedValues)
        }
        typeString = typeString ?: getOrFail(namedArguments, "name")
        groundTruth = groundTruth ?: getOrFail(namedArguments, "ground_truth")
        prediction = prediction ?: getOrFail(namedArguments, "prediction")

        return MetricsSchema(
            metricType = getMetricType(typeString),
            groundTruth = groundTruth,
            prediction = prediction,
        )
    }

    private fun String.clean(): String = this
        .replace("\"", "")
        .replace("'", "")

    private fun String?.toSlug(): String? = this?.toLowerCase()?.replace(Regex("[\\t\\s -_]"), "-")

    private fun takeUntil(sequentialArguments: List<String>, index: Int, upperBount: Int): String? =
        if (index >= upperBount) {
            null
        } else {
            sequentialArguments.getOrNull(index)
        }

    private fun getBoolean(arg: String): Boolean =
        when (arg.toUpperCase()) {
            ("TRUE") -> true
            ("FALSE") -> false
            else -> false
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

    private fun getParameterType(parameterTypeString: String): ParameterType {
        val finalType = (if (parameterTypeString.equals("Str", true)) {
            "String"
        } else if (parameterTypeString.equals("Int", true)) {
            "Integer"
        } else if (parameterTypeString.equals("Bool", true)) {
            "Boolean"
        } else {
            parameterTypeString
        }).trim()

        return parameterTypesRepository.findByNameIgnoreCase(finalType)
            ?: parameterTypesRepository.findByNameIgnoreCase("Undefined")
            ?: throw BadParameterTypeException(parameterTypeString)
    }

    private fun getMetricType(metricTypeString: String): MetricType {
        return metricTypesRepository.findByNameIgnoreCase(metricTypeString)
            ?: metricTypesRepository.findByNameIgnoreCase("Undefined")
            ?: throw BadMetricTypeException(metricTypeString)
    }
}

abstract class PythonParserException(message: String) : IllegalStateException(message)
class MultipleDataProcessorsFoundException : PythonParserException("Multiple DataProcessors were found, but just 1 is supported")
class BadParameterNameException(name: String) : PythonParserException("Bad parameter naming: $name")
class BadParameterTypeException(typeName: String) : PythonParserException("Bad parameter type: $typeName")
class BadMetricTypeException(typeName: String) : PythonParserException("Bad metric type: $typeName")
class IncorrectParametersOrder() : PythonParserException("@parameter annotation must be placed after @data_processor")

class MLParseResult {
    var mlAnnotations: List<EPFAnnotation> = mutableListOf()
    var countFunctions: Int = 0
    var countMLDecoratedFunctions: Int = 0
    var countMLFunctionParameters: Int = 0
    var countMLDataProcessor: Int = 0
    var countMLMetricSchema: Int = 0

    /** Validates python variable names to be alphanumeric + underscore. */
    fun validate() {
        val nameValidator = Regex("[a-zA-Z0-9_-]*")

        val annotatedParameterNames = mlAnnotations.filterIsInstance<Parameter>().map { it.name }

        annotatedParameterNames.forEach {
            if (!nameValidator.matches(it)) {
                throw BadParameterNameException(it)
            }
        }
    }
}