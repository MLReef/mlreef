package com.mlreef.rest

import com.mlreef.utils.Slugs

/**
 *
 * Describes a BaseEnvironment which is the base for a docker image instantiated DataProcessor
 * Should be transformend to a Entity sooner or later, similar to Tags. But currently we know not enough to design that,
 * and a Enum is sufficient.
 */
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
        requirements = "cycler==0.10.0\n" +
            "decorator==4.4.2\n" +
            "imageio==2.8.0\n" +
            "joblib==0.14.1\n" +
            "kiwisolver==1.2.0\n" +
            "matplotlib==3.2.1\n" +
            "networkx==2.4\n" +
            "numpy==1.18.4\n" +
            "nltk==3.5\n" +
            "num2words==0.5.10\n" +
            "opencv-python==4.2.0.34\n" +
            "Pillow==7.1.2\n" +
            "pyparsing==2.4.7\n" +
            "python-dateutil==2.8.1\n" +
            "PyWavelets==1.1.1\n" +
            "scikit-image==0.16.2\n" +
            "scikit-learn==0.23.1\n" +
            "scipy==1.4.1\n" +
            "six==1.14.0",
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