package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonAutoDetect
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.external_api.gitlab.VariableType
import java.io.Serializable


@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonInclude(JsonInclude.Include.NON_NULL)
class GitlabVariable(
    val key: String,
    val value: String? = null,
    val variableType: VariableType = VariableType.ENV_VAR
) : Serializable
