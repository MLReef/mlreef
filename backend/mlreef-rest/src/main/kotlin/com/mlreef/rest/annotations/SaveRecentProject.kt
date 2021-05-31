package com.mlreef.rest.annotations

@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FUNCTION)
annotation class SaveRecentProject(
    val projectId: String = "",
    val userId: String = "",
    val operation: String = ""
)