package com.mlreef.rest.annotations

@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FUNCTION)
annotation class RefreshProject(
    val projectId: String = "",
    val list: String = ""
)