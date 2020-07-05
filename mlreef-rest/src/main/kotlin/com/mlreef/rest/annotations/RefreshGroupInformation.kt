package com.mlreef.rest.annotations

@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FUNCTION)
annotation class RefreshGroupInformation(
    val groupId: String = "",
    val gitlabId: String = "",
    val list: String = ""
)
