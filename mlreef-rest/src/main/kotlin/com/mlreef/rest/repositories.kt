package com.mlreef.rest

import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface ExperimentRepository : KtCrudRepository<Experiment, UUID>
