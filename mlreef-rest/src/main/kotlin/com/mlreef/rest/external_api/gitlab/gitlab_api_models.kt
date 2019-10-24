package com.mlreef.rest.external_api.gitlab

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import org.springframework.context.annotation.Scope
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
@Scope("session")
class GitlabUser : Serializable {
    val id: String = ""
    val username: String = ""
    val name: String = ""
    val email: String = ""
    val publicEmail: String = ""
    val state: String = ""
//    val last_sign_in_at: Long = 0
//    val created_at: Long = 0
}
