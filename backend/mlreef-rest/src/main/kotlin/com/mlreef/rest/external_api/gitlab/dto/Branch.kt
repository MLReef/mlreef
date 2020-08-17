package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.io.Serializable

//https://docs.gitlab.com/ee/api/branches.html
@JsonIgnoreProperties(ignoreUnknown = true)
class Branch(
    val name: String = "",
    val merged: Boolean = false,
    val protected: Boolean = false,
    val default: Boolean = false,
    val developersCanPush: Boolean = false,
    val developersCanMerge: Boolean = false,
    val canPush: Boolean = false,
    val webUrl: String = ""
) : Serializable
