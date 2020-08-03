package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonAutoDetect
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.external_api.gitlab.VariableType
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Deprecated("Use GitlabVariable if possible")
class GroupVariable(
    val key: String,
    val variableType: VariableType = VariableType.ENV_VAR,
    val value: String? = null,
    val protected: Boolean = false
) : Serializable
