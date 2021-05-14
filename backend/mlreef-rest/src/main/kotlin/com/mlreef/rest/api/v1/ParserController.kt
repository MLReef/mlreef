package com.mlreef.rest.api.v1

import com.mlreef.rest.domain.Processor
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.processors.PythonParserService
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
    ): Processor? {
        return pythonParserService.parsePythonFile(request)
    }

    @RequestMapping(value = ["/parse/project/{projectId}"], method = [RequestMethod.POST])
    fun parseFile(
        @PathVariable projectId: UUID,
        @RequestBody(required = false) request: PublishingRequest?,
        tokenDetails: TokenDetails,
    ): Processor? {
        return pythonParserService.findAndParseDataProcessorInProject(request?.path, projectId = projectId)
    }
}

