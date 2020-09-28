package com.mlreef.rest.integration

import org.springframework.beans.factory.annotation.Autowired

class CodeProjectPublishingIntegrationTest : AbstractIntegrationTest() {
    val rootUrl = "/api/v1/code-projects"

    @Autowired
    private lateinit var integrationTestsHelper: IntegrationTestsHelper


}