package com.mlreef.parsing

import com.mlreef.rest.ProcessorParameter
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class MLParsingTest {

    @Test
    fun `ProcessorParameter have incrementing order `() {
        val result = testResult("resnet_annotations_demo.py")
        assertThat(result).isNotNull()
        assertThat(result.countMLFunctionParameters).isEqualTo(13)
        assertThat(result.mlAnnotations.size).isEqualTo(15)

        result.mlAnnotations.filterIsInstance(ProcessorParameter::class.java).forEachIndexed { index, baseEntity ->
            assertThat(baseEntity.order).isEqualTo(index + 1)
        }
    }

    @Test
    fun `RealTest - parse resnet_demo `() {
        val result = testResult("resnet_annotations_demo.py")
        assertThat(result).isNotNull()
        assertThat(result.countMLDataProcessor).isEqualTo(1)
        assertThat(result.countMLMetricSchema).isEqualTo(1)
        assertThat(result.countMLDecoratedFunctions).isEqualTo(2)
        assertThat(result.countMLFunctionParameters).isEqualTo(13)
    }

    @Test
    fun `RealTest - parse resnet_demo - ordered arguments`() {
        val result = testResult("resnet_annotations_demo_ordered.py")
        assertThat(result).isNotNull()
        assertThat(result.countMLDataProcessor).isEqualTo(1)
        assertThat(result.countMLDecoratedFunctions).isEqualTo(1)
        assertThat(result.countMLFunctionParameters).isEqualTo(12)
    }

    @Test
    fun `RealTest - parse resnet_demo - named arguments`() {
        val result = testResult("resnet_annotations_demo_named.py")
        assertThat(result).isNotNull()
        assertThat(result.countMLDataProcessor).isEqualTo(1)
        assertThat(result.countMLDecoratedFunctions).isEqualTo(1)
        assertThat(result.countMLFunctionParameters).isEqualTo(12)
    }

    @Test
    fun `RealTest - parse resnet_demo - named & ordered arguments`() {
        val result = testResult("resnet_annotations_demo_mixed.py")
        assertThat(result).isNotNull()
        assertThat(result.countMLDataProcessor).isEqualTo(1)
        assertThat(result.countMLMetricSchema).isEqualTo(1)
        assertThat(result.countMLDecoratedFunctions).isEqualTo(2)
        assertThat(result.countMLFunctionParameters).isEqualTo(12)
    }

    @Test
    fun `RealTest - parse decorators_example`() {
        val result = testResult("decorators_example.py")
        assertThat(result).isNotNull()
        assertThat(result.countMLDataProcessor).isEqualTo(1)
        assertThat(result.countMLDecoratedFunctions).isEqualTo(1)
        assertThat(result.countMLFunctionParameters).isEqualTo(2)
    }

    @Test
    fun `empty python files return an empty, notnull result`() {
        val result = testResult("python_empty.py")
        assertThat(result).isNotNull()
        assertThat(result.countFunctions).isEqualTo(0)
    }

    @Test
    fun `python files with a statement return an empty, notnull result`() {
        val result = testResult("python_stmt.py")
        assertThat(result).isNotNull()
        assertThat(result.countFunctions).isEqualTo(0)
    }

    @Test
    fun `python files with at least 1 funcdef are parsable`() {
        val result = testResult("python_funcdef.py")
        assertThat(result.countFunctions).isEqualTo(1)

        val result2 = testResult("python_funcdef_call.py")
        assertThat(result2.countFunctions).isEqualTo(1)
    }

    @Test
    fun `python files with funcdef and decorators are parsable`() {
        val result = testResult("python_funcdef_decorators.py", doValidate = false)
        assertThat(result.countFunctions).isEqualTo(1)
    }

    @Test
    fun `DataProcessors are found and contain a decorated function`() {
        val result = testResult("python_mlreef_dataoperation_valid.py")
        assertThat(result.countFunctions).isEqualTo(1)
        assertThat(result.countMLDecoratedFunctions).isEqualTo(1)
    }

    @Test
    fun `DataProcessor files contain a ML decorated function and ML parameters`() {
        val result = testResult("python_mlreef_dataoperation_valid.py")
        assertThat(result.countMLDecoratedFunctions).isEqualTo(1)
        assertThat(result.countMLDataProcessor).isEqualTo(1)
        assertThat(result.countMLFunctionParameters).isEqualTo(3)
        assertThat(result.mlAnnotations.size).isEqualTo(4)
    }

    @Test
    fun `DataProcessor functions have Decorators for each parameter`() {
        val result = testResult("python_mlreef_dataoperation_valid.py")
        assertThat(result.countMLDecoratedFunctions).isEqualTo(1)
        assertThat(result.countMLFunctionParameters).isEqualTo(3)
    }

    @Test
    fun `DataProcessor parameter Decorators must match a function parameter`() {
        val result = testResult("python_mlreef_dataoperation_valid.py")
        assertThat(result.countMLDecoratedFunctions).isEqualTo(1)
        assertThat(result.countMLFunctionParameters).isEqualTo(3)
    }

    @Test
    fun `DataProcessor functions parameters must be valid in python and bash`() {
        Assertions.assertThrows(PythonParserException::class.java) {
            testResult("python_mlreef_dataoperation_bad_param_names.py")
        }
    }

    @Test
    fun `DataProcessor files can contain other annotated functions`() {
        val result = testResult("python_mlreef_dataoperation_valid_second.py")
        assertThat(result.countFunctions).isEqualTo(2)
        assertThat(result.countMLDecoratedFunctions).isEqualTo(1)
    }

//    @Test(expected = MultipleDataProcessorsFoundException::class)
//    fun `DataProcessor files must not contain more than 1 DataProcessor`() {
//        testResult("python_mlreef_dataoperation_invalid_double.py")
//    }

    private fun testResult(filename: String, doValidate: Boolean = false): MLParseResult {
        val resource = javaClass.classLoader.getResourceAsStream("python_examples/$filename")
        val mlParser = MLPython3Parser()
        val result = mlParser.parse(resource!!)
        if (doValidate) result.validate()
        return result
    }
}
