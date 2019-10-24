package com.mlreef.domain.entities

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface ExperimentRepository : KtCrudRepository<Experiment,UUID>
