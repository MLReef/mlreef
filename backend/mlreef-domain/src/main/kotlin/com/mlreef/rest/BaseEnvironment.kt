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
        title = "Base environment python-3.6-GPU",
        docker_image = "tensorflow/tensorflow:2.1.0-gpu-py3",
        description = "GPU nvidia drivers and TF 2.1, python 3.6",
        requirements = """
            |cycler==0.10.0
            |decorator==4.4.2
            |imageio==2.8.0
            |joblib==0.14.1
            |kiwisolver==1.2.0
            |matplotlib==3.2.1
            |networkx==2.4
            |numpy==1.18.4
            |nltk==3.5
            |num2words==0.5.10
            |opencv-python==4.2.0.34
            |Pillow==7.1.2
            |pyparsing==2.4.7
            |python-dateutil==2.8.1
            |PyWavelets==1.1.1
            |scikit-image==0.16.2
            |scikit-learn==0.23.1
            |scipy==1.4.1
            |six==1.14.0
            """.trimMargin(),
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
