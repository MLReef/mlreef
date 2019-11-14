package com.mlreef.rest

import org.springframework.stereotype.Repository
import java.util.*

@Repository interface SubjectRepository : KtCrudRepository<Subject, UUID>

@Repository interface PersonRepository : KtCrudRepository<Person, UUID>

@Repository interface GroupRepository : KtCrudRepository<Group, UUID>

@Repository interface ExperimentRepository : KtCrudRepository<Experiment, UUID>

@Repository interface DataProjectRepository : KtCrudRepository<DataProject, UUID>

@Repository interface CodeProjectRepository : KtCrudRepository<CodeProject, UUID>

@Repository interface OutputFileRepository : KtCrudRepository<OutputFile, UUID>

@Repository interface DataProcessorRepository : KtCrudRepository<DataProcessor, UUID>

@Repository interface OperationRepository : KtCrudRepository<Operation, UUID>

@Repository interface VisualizationRepository : KtCrudRepository<Visualization, UUID>

@Repository interface ModelRepository : KtCrudRepository<Model, UUID>


@Repository interface ProcessorParameterRepository : KtCrudRepository<ProcessorParameter, UUID>

// instances of experiments
@Repository interface ParameterInstanceRepository : KtCrudRepository<ParameterInstance, UUID>

@Repository interface DataProcessorInstanceRepository : KtCrudRepository<DataProcessorInstance, UUID>
