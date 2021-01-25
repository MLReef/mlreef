package com.mlreef.rest.api.v1

import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.data_processors.PythonParserService
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping(value = ["/api/v1/parser"])
class ParserController(
    private val pythonParserService: PythonParserService,
) {
    @RequestMapping(value = ["/parse/code"], method = [RequestMethod.POST])
    fun parseCode(
        @RequestBody request: String,
        tokenDetails: TokenDetails,
    ): ProcessorVersion? {
        return pythonParserService.parsePythonFile(request)?.processorVersion
    }

    @RequestMapping(value = ["/parse/project/{projectId}"], method = [RequestMethod.POST])
    fun parseFile(
        @PathVariable projectId: UUID,
        @RequestBody(required = false) request: PublishingRequest?,
        tokenDetails: TokenDetails,
    ): ProcessorVersion? {
        return pythonParserService.findAndParseDataProcessorInProject(projectId, request?.path).processorVersion
    }
}

