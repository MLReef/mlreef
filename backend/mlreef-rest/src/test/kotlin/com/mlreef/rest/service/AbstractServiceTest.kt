package com.mlreef.rest.service

import com.mlreef.rest.ApplicationConfiguration
import com.mlreef.rest.persistence.AbstractRepositoryTest
import org.springframework.beans.factory.annotation.Autowired

abstract class AbstractServiceTest : AbstractRepositoryTest() {

    @Autowired
    lateinit var config: ApplicationConfiguration

}
