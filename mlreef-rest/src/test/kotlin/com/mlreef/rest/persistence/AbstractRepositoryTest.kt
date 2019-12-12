package com.mlreef.rest.persistence

import com.mlreef.rest.ApplicationProfiles
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import javax.persistence.EntityManager
import javax.sql.DataSource


@TestPropertySource(properties = [
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
])
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
@DataJpaTest(showSql = false)
@ActiveProfiles(ApplicationProfiles.TEST)
class AbstractRepositoryTest {
    @Autowired
    val dataSource: DataSource? = null
    @Autowired
    val jdbcTemplate: JdbcTemplate? = null
    @Autowired
    val entityManager: EntityManager? = null

}
