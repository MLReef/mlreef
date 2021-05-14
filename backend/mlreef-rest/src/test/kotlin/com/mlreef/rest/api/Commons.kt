package com.mlreef.rest.api

import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.request.ParameterDescriptor
import org.springframework.restdocs.request.RequestDocumentation

object TestTags {
    const val SLOW = "slow"
    const val UNIT = "unit"
    const val INTEGRATION = "integration"
    const val RESTDOC = "restdoc"
}

internal fun projectResponseFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "global_slug").optional().type(JsonFieldType.STRING).description("Global Slug must be unique for the whole platform"),
        fieldWithPath(prefix + "visibility_scope").type(JsonFieldType.STRING).description("Visibility scope"),
        fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("A Name which is unique per scope (owner's domain)"),
        fieldWithPath(prefix + "description").type(JsonFieldType.STRING).description("Text for description"),
        fieldWithPath(prefix + "tags").type(JsonFieldType.ARRAY).description("All Tags for this Project"),
        fieldWithPath(prefix + "owner_id").type(JsonFieldType.STRING).description("UUID of Subject who owns this Project"),
        fieldWithPath(prefix + "stars_count").type(JsonFieldType.NUMBER).description("Number of Stars"),
        fieldWithPath(prefix + "forks_count").type(JsonFieldType.NUMBER).description("Number of Forks"),
        fieldWithPath(prefix + "input_data_types").type(JsonFieldType.ARRAY).description("List of DataTypes used for Input"),
        fieldWithPath(prefix + "output_data_types").type(JsonFieldType.ARRAY).optional().description("List of DataTypes used for Output (code project only)"),
        fieldWithPath(prefix + "searchable_type").type(JsonFieldType.STRING).description("Type of searchable Entity"),
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Project id"),
        fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Project slug"),
        fieldWithPath(prefix + "url").type(JsonFieldType.STRING).description("URL in Gitlab domain"),
        fieldWithPath(prefix + "owner_id").type(JsonFieldType.STRING).description("Onwer id of the data project"),
        fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Project name"),
        fieldWithPath(prefix + "gitlab_namespace").type(JsonFieldType.STRING).description("The group/namespace where the project is in"),
        fieldWithPath(prefix + "gitlab_path").type(JsonFieldType.STRING).description("Project path"),
        fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab"),
        fieldWithPath(prefix + "published").optional().type(JsonFieldType.BOOLEAN).description("Project is published"),
        fieldWithPath(prefix + "processor_type").optional().type(JsonFieldType.STRING).description("Processor type (Code project only)"),
        fieldWithPath(prefix + "model_type").optional().type(JsonFieldType.STRING).description("Model type (Code project only)"),
        fieldWithPath(prefix + "ml_category").optional().type(JsonFieldType.STRING).description("ML category (Code project only)"),
    ).apply {
        this.add(fieldWithPath(prefix + "processors").optional().type(JsonFieldType.ARRAY).description("DataProcessors array"))
        this.addAll(dataProcessorFields(prefix + "processors[]."))
        this.addAll(searchableTags(prefix + "tags[]."))
    }.apply {
        this.add(fieldWithPath(prefix + "experiments").optional().type(JsonFieldType.ARRAY).description("Experiments (Data project only)"))
        this.addAll(experimentResponseFields(prefix + "experiments[]."))
    }
}

fun experimentResponseFields(prefix: String = ""): List<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("UUID"),
        fieldWithPath(prefix + "data_project_id").type(JsonFieldType.STRING).description("Id of DataProject"),
        fieldWithPath(prefix + "data_instance_id").optional().type(JsonFieldType.STRING).description("Id of DataPipelineInstance"),
        fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Local slug scoped to DataProject"),
        fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Name of that Experiment"),
        fieldWithPath(prefix + "number").type(JsonFieldType.NUMBER).description("Number of this Experiment in its DataProject scope"),
        fieldWithPath(prefix + "json_blob").type(JsonFieldType.STRING).optional().description("Json object describing experiments epochs statistics"),
        fieldWithPath(prefix + "status").type(JsonFieldType.STRING).description("Status of experiment"),
        fieldWithPath(prefix + "source_branch").type(JsonFieldType.STRING).description("Branch name"),
        fieldWithPath(prefix + "target_branch").type(JsonFieldType.STRING).description("Branch name"),
        fieldWithPath(prefix + "created_by").optional().type(JsonFieldType.STRING).description("Creator id"),
    ).apply {
        this.add(fieldWithPath(prefix + "post_processing").optional().type(JsonFieldType.ARRAY).description("Postprocessing processors array"))
        this.addAll(dataProcessorInstanceFields(prefix + "post_processing[]."))
    }.apply {
        this.add(fieldWithPath(prefix + "processing").optional().type(JsonFieldType.OBJECT).description("Processing processors array"))
        this.addAll(dataProcessorInstanceFields(prefix + "processing."))
    }.apply {
        this.add(fieldWithPath(prefix + "input_files").optional().type(JsonFieldType.ARRAY).description("Input files/directories for experiment"))
        this.addAll(fileLocationsFields(prefix + "input_files[]."))
    }.apply {
        this.add(fieldWithPath(prefix + "pipeline_job_info").type(JsonFieldType.OBJECT).optional().description("An optional PipelineInfo describing the gitlab pipeline info"))
        this.addAll(pipelineInfoDtoResponseFields(prefix + "pipeline_job_info."))
    }
}

fun experimentRequestFields(prefix: String = ""): List<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "data_instance_id").optional().type(JsonFieldType.STRING).description("An optional UUID of a optional DataInstance. Check that it matches the source_branch"),
        fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("A slug which is unique scoped to this DataProject"),
        fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("A name for that Experiment. I does not have to be unique, but it should be."),
        fieldWithPath(prefix + "input_files").type(JsonFieldType.ARRAY).description("List of input files (folders) for processing"),
        fieldWithPath(prefix + "source_branch").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
        fieldWithPath(prefix + "target_branch").type(JsonFieldType.STRING).description("Branch name for destination"),
        fieldWithPath(prefix + "post_processing").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PostProcessing"),
        fieldWithPath(prefix + "processing").type(JsonFieldType.OBJECT).optional().description("An optional DataAlgorithm")
    ).apply {
        this.add(fieldWithPath(prefix + "post_processing").optional().type(JsonFieldType.ARRAY).description("Postprocessing processors array"))
        this.addAll(dataProcessorInstanceFields(prefix + "post_processing[]."))
    }.apply {
        this.add(fieldWithPath(prefix + "processing").optional().type(JsonFieldType.OBJECT).description("Processing processors array"))
        this.addAll(dataProcessorInstanceFields(prefix + "processing."))
    }.apply {
        this.add(fieldWithPath(prefix + "input_files").optional().type(JsonFieldType.ARRAY).description("Input files/directories for experiment"))
        this.addAll(fileLocationsFields(prefix + "input_files[]."))
    }
}

internal fun searchableTags(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).optional().description("Unique UUID"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).optional().description("Name of Tag, unique, useful and readable"),
        fieldWithPath(prefix + "type").type(JsonFieldType.STRING).optional().description("Type or Family of this Tag"),
        fieldWithPath(prefix + "public").type(JsonFieldType.BOOLEAN).optional().description("Flag indicating whether this is public or not")
    )
}

internal fun searchableTagsRequestFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).optional().description("Unique UUID"),
        fieldWithPath(prefix + "owner_id").optional().type(JsonFieldType.STRING).optional().description("Nullable owner_id"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).optional().description("Name of Tag, unique, useful and readable"),
        fieldWithPath(prefix + "type").type(JsonFieldType.STRING).optional().description("Type or Family of this Tag"),
        fieldWithPath(prefix + "public").type(JsonFieldType.BOOLEAN).optional().description("Flag indicating whether this is public or not")
    )
}

internal fun projectUpdateRequestFields(): List<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath("description").type(JsonFieldType.STRING).optional().description("Description of Project"),
        fieldWithPath("name").type(JsonFieldType.STRING).optional().description("Name of Project"),
        fieldWithPath("visibility").type(JsonFieldType.STRING).optional().description("Visibility of Project"),
        fieldWithPath("input_data_types").type(JsonFieldType.ARRAY).optional().description("List of DataTypes for input"),
        fieldWithPath("output_data_types").type(JsonFieldType.ARRAY).optional().description("List of DataTypes for output"),
        fieldWithPath("tags").type(JsonFieldType.ARRAY).optional().description("List of Tags")
    ).apply {
        addAll(searchableTagsRequestFields("tags[]."))
    }
}

internal fun dataProcessorInstanceFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).optional().description("Unique UUID of Processor"),
        fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).optional().description("Unique slug of Processor"),
        fieldWithPath(prefix + "project_id").type(JsonFieldType.STRING).optional().description("Project id (either id or slug or project_id + branch + version)"),
        fieldWithPath(prefix + "branch").type(JsonFieldType.STRING).optional().description("Branch of processor (use it with project_id only)"),
        fieldWithPath(prefix + "version").type(JsonFieldType.STRING).optional().description("Version of processor (use it with project_id and branch only)"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).optional().description("Optional Name of this DataProcessor ( not needed in Inputs)"),
        fieldWithPath(prefix + "parameters").type(JsonFieldType.ARRAY).optional().description("Name of Parameter"),
        fieldWithPath(prefix + "parameters[].name").type(JsonFieldType.STRING).optional().description("Name of Parameter"),
        fieldWithPath(prefix + "parameters[].type").type(JsonFieldType.STRING).optional().description("Provided ParameterType of this Parameter"),
        fieldWithPath(prefix + "parameters[].required").type(JsonFieldType.BOOLEAN).optional().description("Parameter required?"),
        fieldWithPath(prefix + "parameters[].description").type(JsonFieldType.STRING).optional().description("Textual description of this Parameter"),
        fieldWithPath(prefix + "parameters[].value").type(JsonFieldType.STRING).optional().description("Provided value (as parsable String) of Parameter ")
    )
}

fun pageableResourceParameters(): Array<ParameterDescriptor> {
    return arrayOf(
        RequestDocumentation.parameterWithName("page").optional().description("Page number (starting from 0)"),
        RequestDocumentation.parameterWithName("size").optional().description("Number elements on the page"),
        RequestDocumentation.parameterWithName("sort").optional().description("Sort by field (eg. &sort=id,asc)")
    )
}

fun wrapToPage(content: List<FieldDescriptor>): List<FieldDescriptor> {
    return mutableListOf(
        fieldWithPath("last").type(JsonFieldType.BOOLEAN).description("Is the last page"),
        fieldWithPath("total_pages").type(JsonFieldType.NUMBER).description("Total pages count"),
        fieldWithPath("total_elements").type(JsonFieldType.NUMBER).description("Total elements count ([pages count] x [page size])"),
        fieldWithPath("size").type(JsonFieldType.NUMBER).description("Requested elements count per page. Request parameter 'size'. Default 20"),
        fieldWithPath("number").type(JsonFieldType.NUMBER).description("Current page number"),
        fieldWithPath("number_of_elements").type(JsonFieldType.NUMBER).description("Elements count in current page"),
        fieldWithPath("first").type(JsonFieldType.BOOLEAN).description("Is the first page"),
        fieldWithPath("empty").type(JsonFieldType.BOOLEAN).description("Is the current page empty")
    ).apply {
        addAll(content.map { it.copy("content[].${it.path}") })
        addAll(pageableFields())
        addAll(sortFields())
    }
}

private fun pageableFields(): List<FieldDescriptor> {
    val prefix = "pageable."
    return mutableListOf(
        fieldWithPath(prefix + "offset").type(JsonFieldType.NUMBER).description("Current offset (starting from 0). Request parameter 'page' or 'offset'"),
        fieldWithPath(prefix + "page_size").type(JsonFieldType.NUMBER).description("Requested elements count per page. Request parameter 'size'. Default 20"),
        fieldWithPath(prefix + "page_number").type(JsonFieldType.NUMBER).description("Current page number"),
        fieldWithPath(prefix + "unpaged").type(JsonFieldType.BOOLEAN).description("Is the result unpaged"),
        fieldWithPath(prefix + "paged").type(JsonFieldType.BOOLEAN).description("Is the result paged")
    ).apply {
        addAll(sortFields(prefix))
    }
}

private fun sortFields(prefix: String = ""): List<FieldDescriptor> {
    return listOf(
        fieldWithPath(prefix + "sort.sorted").type(JsonFieldType.BOOLEAN).description("Is the result sorted. Request parameter 'sort', values '=field,direction(asc,desc)'"),
        fieldWithPath(prefix + "sort.unsorted").type(JsonFieldType.BOOLEAN).description("Is the result unsorted"),
        fieldWithPath(prefix + "sort.empty").type(JsonFieldType.BOOLEAN).description("Is the sort empty")
    )
}

internal fun pageable(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "content").type(JsonFieldType.ARRAY).optional().description(""),
        fieldWithPath(prefix + "pageable.sort").type(JsonFieldType.OBJECT).optional().description(""),
        fieldWithPath(prefix + "pageable.sort.unsorted").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "pageable.sort.sorted").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "pageable.sort.empty").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "pageable.page_size").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "pageable.page_number").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "pageable.offset").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "pageable.paged").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "pageable.unpaged").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "total_elements").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "total_pages").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "last").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "first").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "number_of_elements").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "sort").type(JsonFieldType.OBJECT).optional().description(""),
        fieldWithPath(prefix + "sort.unsorted").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "sort.sorted").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "sort.empty").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "size").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "number").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "empty").type(JsonFieldType.BOOLEAN).optional().description("")
    )
}

internal fun dataProcessorFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Unique UUID of this DataProcessor"),
        fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Unique slug of this DataProcessor"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING)
            .description("Optional Name of this DataProcessor ( not needed in Inputs)"),
        fieldWithPath(prefix + "input_data_type").type(JsonFieldType.ARRAY).description("DataType for input data"),
        fieldWithPath(prefix + "output_data_type").type(JsonFieldType.ARRAY).description("DataType for output data"),
        fieldWithPath(prefix + "type").type(JsonFieldType.STRING).description("ALGORITHM, OPERATION or VISUALIZATION"),
        fieldWithPath(prefix + "visibility_scope").type(JsonFieldType.STRING).optional()
            .description("PUBLIC or PRIVATE"),
        fieldWithPath(prefix + "description").optional().type(JsonFieldType.STRING).description("Description"),
        fieldWithPath(prefix + "code_project_id").type(JsonFieldType.STRING).optional()
            .description("CodeProject this Processor belongs to"),
        fieldWithPath(prefix + "author_id").optional().type(JsonFieldType.STRING).optional()
            .description("Publisher id"),
        fieldWithPath(prefix + "branch").optional().type(JsonFieldType.STRING).optional().description("Branch name"),
        fieldWithPath(prefix + "version").optional().type(JsonFieldType.STRING).optional().description("Version"),
        fieldWithPath(prefix + "publish_started_at").optional().type(JsonFieldType.STRING).optional()
            .description("Date/time of publish start"),
        fieldWithPath(prefix + "publish_finished_at").optional().type(JsonFieldType.STRING).optional()
            .description("Date/time of publish finish"),
        fieldWithPath(prefix + "status").optional().type(JsonFieldType.STRING).optional()
            .description("Status of publishing pipeline"),
        fieldWithPath(prefix + "model_type").optional().type(JsonFieldType.STRING).optional().description("Model type"),
        fieldWithPath(prefix + "ml_category").optional().type(JsonFieldType.STRING).optional()
            .description("ML category"),
    ).apply {
        add(fieldWithPath(prefix + "environment").optional().type(JsonFieldType.OBJECT).description("Environment"))
        addAll(environmentsFields(prefix + "environment."))
    }.apply {
        add(
            fieldWithPath(prefix + "metrics_schema").optional().type(JsonFieldType.OBJECT).description("Metrics schema")
        )
        addAll(metricSchemaFields(prefix + "metrics_schema."))
    }.apply {
        add(
            fieldWithPath(prefix + "parameters").optional().type(JsonFieldType.ARRAY)
                .description("Processor parameters")
        )
        addAll(processorParametersFields(prefix + "parameters[]."))
    }
}

internal fun processorVersionFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Unique UUID of this DataProcessorVersion"),
        fieldWithPath(prefix + "data_processor_id").type(JsonFieldType.STRING).description("Unique UUID of this DataProcessor"),
        fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Unique slug of this DataProcessor"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).description("Optional Name of this DataProcessor ( not needed in Inputs)"),
        fieldWithPath(prefix + "number").optional().type(JsonFieldType.NUMBER).description("Relative number of this DataProcessor Version"),
        fieldWithPath(prefix + "branch").optional().type(JsonFieldType.STRING).description("Branch this Version was built on"),
        fieldWithPath(prefix + "command").optional().type(JsonFieldType.STRING).description("Python command to execute"),
//        fieldWithPath(prefix + "base_environment").optional().type(JsonFieldType.STRING).description("Identifier of BaseEnvironment"),
        fieldWithPath(prefix + "published_at").optional().type(JsonFieldType.STRING).description("Timestamp of publication"),
        fieldWithPath(prefix + "input_data_type").type(JsonFieldType.STRING).description("DataType for input data"),
        fieldWithPath(prefix + "output_data_type").type(JsonFieldType.STRING).description("DataType for output data"),
        fieldWithPath(prefix + "type").type(JsonFieldType.STRING).description("ALGORITHM, OPERATION or VISUALIZATION"),
        fieldWithPath(prefix + "visibility_scope").type(JsonFieldType.STRING).optional().description("PUBLIC or PRIVATE"),
        fieldWithPath(prefix + "description").optional().type(JsonFieldType.STRING).description("Description"),
        fieldWithPath(prefix + "code_project_id").type(JsonFieldType.STRING).optional().description("CodeProject this Processor belongs to"),
        fieldWithPath(prefix + "author_id").optional().type(JsonFieldType.STRING).optional().description("Author who created this"),
        fieldWithPath(prefix + "publisher_id").optional().type(JsonFieldType.STRING).optional().description("Author who created this"),
        fieldWithPath(prefix + "metric_type").type(JsonFieldType.STRING).description("Type of Metric"),
        fieldWithPath(prefix + "parameters").type(JsonFieldType.ARRAY).optional().description("Name of Parameter"),
        fieldWithPath(prefix + "parameters[].name").type(JsonFieldType.STRING).optional().description("Name of Parameter"),
        fieldWithPath(prefix + "parameters[].type").type(JsonFieldType.STRING).optional().description("Provided ParameterType of this Parameter"),
        fieldWithPath(prefix + "parameters[].order").type(JsonFieldType.NUMBER).optional().description("Provided ParameterType of this Parameter"),
        fieldWithPath(prefix + "parameters[].default_value").type(JsonFieldType.STRING).optional().description("Provided value (as parsable String) of Parameter "),
        fieldWithPath(prefix + "parameters[].required").type(JsonFieldType.BOOLEAN).optional().description("Parameter required?"),
        fieldWithPath(prefix + "parameters[].description").type(JsonFieldType.STRING).optional().description("Textual description of this Parameter"),
        fieldWithPath(prefix + "pipeline_job_info").optional().type(JsonFieldType.OBJECT).optional().description("Gitlab Pipeline information")
    ).apply {
        addAll(pipelineInfoDtoResponseFields(prefix + "pipeline_job_info."))
    }.apply {
        addAll(environmentsFields(prefix + "base_environment."))
    }
}

internal fun pipelineInfoDtoResponseFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.NUMBER).optional().description("Json object describing specific metrics"),
        fieldWithPath(prefix + "commit_sha").type(JsonFieldType.STRING).optional().description("Json object describing specific metrics"),
        fieldWithPath(prefix + "ref").type(JsonFieldType.STRING).optional().description("Json object describing specific metrics"),
        fieldWithPath(prefix + "committed_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was committed"),
        fieldWithPath(prefix + "created_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was created"),
        fieldWithPath(prefix + "started_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was started"),
        fieldWithPath(prefix + "updated_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was updated"),
        fieldWithPath(prefix + "finished_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was finished")
    )
}

internal fun fileLocationsFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "location").type(JsonFieldType.STRING).description("A URL, URI or simple path describing the location of a file/folder"),
        fieldWithPath(prefix + "location_type").type(JsonFieldType.STRING).description("PATH, URL or AWS_ID ")
    )
}

internal fun commitFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return mutableListOf(
        fieldWithPath(prefix + "author_email").optional().type(JsonFieldType.STRING).description("User's email"),
        fieldWithPath(prefix + "author_name").optional().type(JsonFieldType.STRING).description("Username"),
        fieldWithPath(prefix + "authored_date").optional().type(JsonFieldType.STRING).description("Date of publish"),
        fieldWithPath(prefix + "committer_email").optional().type(JsonFieldType.STRING).description("Commiter email"),
        fieldWithPath(prefix + "committer_name").optional().type(JsonFieldType.STRING).description("Commiter name"),
        fieldWithPath(prefix + "committed_date").optional().type(JsonFieldType.STRING).description("Date of commit"),
        fieldWithPath(prefix + "title").type(JsonFieldType.STRING).description("Commit title"),
        fieldWithPath(prefix + "message").type(JsonFieldType.STRING).description("Commit message"),
        fieldWithPath(prefix + "id").optional().type(JsonFieldType.STRING).description("Username"),
        fieldWithPath(prefix + "short_id").optional().type(JsonFieldType.STRING).description("Username"),
    )
}

internal fun publishingProcessFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return mutableListOf(
        fieldWithPath(prefix + "id").optional().type(JsonFieldType.STRING).description("Data processor id"),
        fieldWithPath(prefix + "branch").optional().type(JsonFieldType.STRING).description("Published branch"),
        fieldWithPath(prefix + "version").optional().type(JsonFieldType.STRING).description("Version"),
        fieldWithPath(prefix + "project_id").optional().type(JsonFieldType.STRING).description("Published project id"),
        fieldWithPath(prefix + "script_path").optional().type(JsonFieldType.STRING).description("Main script path"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).description("Published processor name"),
        fieldWithPath(prefix + "slug").optional().type(JsonFieldType.STRING).description("Published processor slug"),
        fieldWithPath(prefix + "description").optional().type(JsonFieldType.STRING).description("Description"),
        fieldWithPath(prefix + "commit_sha").optional().type(JsonFieldType.STRING).description("Publishing commit sha"),
        fieldWithPath(prefix + "published_at").optional().type(JsonFieldType.STRING)
            .description("Publishing process initiated time (it is not start time)"),
        fieldWithPath(prefix + "published_by").optional().type(JsonFieldType.STRING).description("Published user"),
        fieldWithPath(prefix + "status").optional().type(JsonFieldType.STRING)
            .description("Status of publishing process"),
        fieldWithPath(prefix + "modelType").optional().type(JsonFieldType.STRING).description("Model type"),
        fieldWithPath(prefix + "ml_category").optional().type(JsonFieldType.STRING).description("ML Category"),
        fieldWithPath(prefix + "job_started_at").optional().type(JsonFieldType.STRING)
            .description("Publishing pipeline start time"),
        fieldWithPath(prefix + "job_finished_at").optional().type(JsonFieldType.STRING)
            .description("Publishing pipeline finish time"),
    ).apply {
        addAll(environmentsFields(prefix + "environment."))
    }
}

internal fun publishingInfoFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "commit_sha").type(JsonFieldType.STRING).optional().description("Publishing commit sha"),
        fieldWithPath(prefix + "published_at").type(JsonFieldType.STRING).optional().description("Timestamp when the project was published"),
        fieldWithPath(prefix + "published_by").type(JsonFieldType.STRING).optional().description("Published person id"),
    )
}

internal fun environmentsFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return mutableListOf(
        fieldWithPath(prefix + "id").optional().type(JsonFieldType.STRING).description("Environment id"),
        fieldWithPath(prefix + "title").optional().type(JsonFieldType.STRING).description("Title"),
        fieldWithPath(prefix + "description").type(JsonFieldType.STRING).optional().description("Description"),
        fieldWithPath(prefix + "requirements").type(JsonFieldType.STRING).optional()
            .description("Library requirements"),
        fieldWithPath(prefix + "docker_image").optional().type(JsonFieldType.STRING).description("Docker image"),
        fieldWithPath(prefix + "machine_type").optional().type(JsonFieldType.STRING).description("Machine type"),
        fieldWithPath(prefix + "sdk_version").optional().type(JsonFieldType.STRING)
            .description("SDK version (Python, Java etc)"),
    )
}

internal fun metricSchemaFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "metric_type").type(JsonFieldType.STRING).optional().description("Metric schema type"),
        fieldWithPath(prefix + "ground_truth").type(JsonFieldType.STRING).optional().description("Ground truth"),
        fieldWithPath(prefix + "prediction").type(JsonFieldType.STRING).optional().description("Prediction"),
    )
}

internal fun processorParametersFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).optional().description("Parameter id"),
        fieldWithPath(prefix + "name").type(JsonFieldType.STRING).optional().description("Parameter name"),
        fieldWithPath(prefix + "type").type(JsonFieldType.STRING).optional().description("Parameter type"),
        fieldWithPath(prefix + "order").type(JsonFieldType.NUMBER).optional().description("Order"),
        fieldWithPath(prefix + "default_value").type(JsonFieldType.STRING).optional().description("Default value"),
        fieldWithPath(prefix + "required").type(JsonFieldType.BOOLEAN).optional().description("Required"),
        fieldWithPath(prefix + "group").type(JsonFieldType.STRING).optional().description("Group"),
        fieldWithPath(prefix + "description").type(JsonFieldType.STRING).optional().description("Description"),
    )
}
