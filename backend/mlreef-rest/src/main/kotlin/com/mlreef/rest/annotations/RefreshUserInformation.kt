package com.mlreef.rest.annotations

@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FUNCTION)
annotation class RefreshUserInformation(
    val userId: String = "",
    val gitlabId: String = "",
    val username: String = "",
    val list: String = ""
)
