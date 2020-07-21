package com.mlreef.rest

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles


@SpringBootTest(classes = [
    ApplicationConfiguration::class,
    GitlabConfiguration::class,
    EpfConfiguration::class
])
@EnableConfigurationProperties
@ActiveProfiles("config-test")
internal class ConfigurationTest {

    @Autowired lateinit var config: ApplicationConfiguration

    @Test
    fun `Can load configuration from application_yml`() {
        assertThat(config.epf.imageTag).isEqualTo("test-latest")
        assertThat(config.epf.backendUrl).isEqualTo("epf-backend-test-url")
        assertThat(config.epf.gitlabUrl).isEqualTo("epf-gitlab-test-url")

        assertThat(config.gitlab.rootUrl).isEqualTo("gitlab-external-test-url")
        assertThat(config.gitlab.adminUsername).isEqualTo("admin")
        assertThat(config.gitlab.adminPassword).isEqualTo("password")
        assertThat(config.gitlab.adminUserToken).isEqualTo("test-token")
    }
}


@SpringBootTest(classes = [
    ApplicationConfiguration::class,
    GitlabConfiguration::class,
    EpfConfiguration::class
])
@EnableConfigurationProperties
internal class MainConfigurationTest {

    @Autowired
    lateinit var config: ApplicationConfiguration

    @Test
    fun `Can load configuration from application_yml`() {
        assertThat(config.epf.imageTag).isNotEmpty()
        assertThat(config.epf.backendUrl).isNotEmpty()
        assertThat(config.epf.gitlabUrl).isNotEmpty()

        assertThat(config.gitlab.rootUrl).isNotEmpty()
        assertThat(config.gitlab.adminUserToken).isNotEmpty()
    }
}