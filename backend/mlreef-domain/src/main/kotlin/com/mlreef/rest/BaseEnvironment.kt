package com.mlreef.rest

import com.mlreef.utils.Slugs

/**
 *
 * Describes a BaseEnvironment which is the base for a docker image instantiated DataProcessor
 * Should be transformend to a Entity sooner or later, similar to Tags. But currently we know not enough to design that,
 * and a Enum is sufficient.
 */
@Deprecated("Was replaced with com.mlreef.rest.BaseEnvironments entity. To be deleted")
enum class BaseEnvironment(
    val title: String,
    val docker_image: String,
    val description: String,
    val requirements: String,
    val machine_type: String,
    val python_version: String
) {
    UNDEFINED("", "", "", "", "", ""),
    PYTHON_3_6_GPU(
        title = "Base environment python3, GPU and TF 2.1.0",
        docker_image = "tensorflow/tensorflow:2.1.0-gpu-py3",
        description = "GPU nvidia drivers and TF 2.1, compatible with python 3.6-3.8",
        requirements = "".trimMargin(),
        machine_type = "GPU",
        python_version = "3.6"
    );

    /**
     * Can be used in GUI, but should not be stored in Database. Use JPA and the Enum for that.
     */
    fun slug(): String = Slugs.toSlug(this.name)

    companion object {
        fun fromSlug(slug: String): BaseEnvironment? {
            return values().firstOrNull { it.slug() == slug }
        }

        fun default() = PYTHON_3_6_GPU
    }


}
