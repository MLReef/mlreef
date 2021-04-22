package com.mlreef.rest.feature.data_processors

import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.DataType
import com.mlreef.rest.PublishingMachineType
import com.mlreef.rest.Subject
import com.mlreef.rest.feature.data_processors.dsl.DSLContextBuilder
import com.mlreef.rest.feature.data_processors.dsl.ensureData
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.util.UUID.fromString

@Profile(value = [ApplicationProfiles.DEV, ApplicationProfiles.DOCKER])
@Component
class InitialDataLoader {
    val augment_projectId = fromString("1000000-0000-0001-0001-000000000000")
    val augment_id = fromString("1000000-0000-0001-0002-000000000000")
    val randomCrop_projectId = fromString("1000000-0000-0002-0001-000000000000")
    val randomCrop_id = fromString("1000000-0000-0002-0002-000000000000")
    val leeFilter_projectId = fromString("1000000-0000-0003-0001-000000000000")
    val leeFilter_id = fromString("1000000-0000-0003-0002-000000000000")
    val resnet50_projectId = fromString("1000000-1000-0003-0001-000000000000")
    val resnet50_id = fromString("1000000-1000-0003-0002-000000000000")
    val forecasting_projectId = fromString("e1e3abfa-08c6-11eb-adc1-0242ac120002")
    val forecasting_id = fromString("e1e3ae20-08c7-11eb-adc1-0242ac120002")
    val bertsent_projectId = fromString("e6452744-0edb-11eb-adc1-0242ac120002")
    val bertsent_id = fromString("e645299c-0edb-11eb-adc1-0242ac120002")
    val multimodel_projectId = fromString("fe957942-d0cf-11ea-87d0-0242ac130003")
    val multimodel_id = fromString("fe957a00-d0cf-11ea-87d0-0242ac130003")
    val chatbot_model_projectId = fromString("fe957abe-d0cf-11ea-87d0-0242ac130003")
    val chatbot_id = fromString("fe957b7c-d0cf-11ea-87d0-0242ac130003")
    val dummy_projectId = fromString("1000000-2000-0003-0001-000000000000")
    val dummy_id = fromString("1000000-2000-0003-0002-000000000000")
    val im_add_noise_projectId = fromString("fe956934-d0cf-11ea-87d0-0242ac130003")
    val im_add_noise_id = fromString("fe956b64-d0cf-11ea-87d0-0242ac130003")
    val im_color_modifier_projectId = fromString("fe956c5e-d0cf-11ea-87d0-0242ac130003")
    val im_color_modifier_id = fromString("fe956d3a-d0cf-11ea-87d0-0242ac130003")
    val im_create_thumbnails_projectId = fromString("fe956e02-d0cf-11ea-87d0-0242ac130003")
    val im_create_thumbnails_id = fromString("fe957050-d0cf-11ea-87d0-0242ac130003")
    val im_distort_affine_projectId = fromString("fe957122-d0cf-11ea-87d0-0242ac130003")
    val im_distort_affine_id = fromString("fe9571e0-d0cf-11ea-87d0-0242ac130003")
    val im_random_erasing_projectId = fromString("fe957294-d0cf-11ea-87d0-0242ac130003")
    val im_random_erasing_id = fromString("fe95735c-d0cf-11ea-87d0-0242ac130003")
    val im_rotate_projectId = fromString("fe957410-d0cf-11ea-87d0-0242ac130003")
    val im_rotate_id = fromString("fe957582-d0cf-11ea-87d0-0242ac130003")
    val txt_ops_projectId = fromString("723076c6-eee5-11ea-adc1-0242ac120002")
    val txt_ops_id = fromString("72307a68-eee5-11ea-adc1-0242ac120002")
    val tsne_projectId = fromString("fe9577b2-d0cf-11ea-87d0-0242ac130003")
    val tsne_id = fromString("fe957884-d0cf-11ea-87d0-0242ac130003")
    val scatterplot_projectId = fromString("a827c776-008c-11eb-adc1-0242ac120002")
    val scatterplot_id = fromString("a827c83e-008c-11eb-adc1-0242ac120002")
    val wordcloud_projectId = fromString("a827c906-008c-11eb-adc1-0242ac120002")
    val wordcloud_id = fromString("a827c9c4-008c-11eb-adc1-0242ac120002")
    val asfinagtreecover_projectId = fromString("e4575902-2fe2-11eb-adc1-0242ac120002")
    val asfinagtreecover_id = fromString("e4575b82-2fe2-11eb-adc1-0242ac120002")
    val python_environment_id = fromString("870a0b67-f36b-40c8-9e76-560c32d5f3e8")


    fun prepare(author: Subject, token: String): DSLContextBuilder {

        return ensureData(author, token) {

            //        tag {
            //            id = fromString("2000000-0000-0001-0001-000000000000")
            //            name = "Some-tag-maybe"
            //            // See SearchableTagType enum class
            //            type = SearchableTagType.UNDEFINED
            //        }
            // ############## ENVIRONMENT
            val environment = environment {
                id = python_environment_id
                title = "Base environment tensorflow/tensorflow:2.1.0-gpu-py3"
                dockerImage = "tensorflow/tensorflow:2.1.0-gpu-py3"
                description = "GPU nvidia drivers and TF 2.1, compatible python 3.6-3.8"
                requirements = """
                                Ubuntu
                                python3
                                tensorflow-gpu 2.1.0
                                CUDA 10.1
                                CUDNN 7
                """.trimMargin()
                machineType = PublishingMachineType.GPU
                sdkVersion = "3.6"
            }

            // ############## OPERATION
            val codeProject_txtops = codeProject {
                id = txt_ops_projectId
                slug = "commons-txt-ops"
                name = "Text processing operations"
                gitlabNamespace = "mlreef"
                gitlabPath = "txt_ops"
                inputDataTypes = hashSetOf(DataType.TEXT)
                outputDataTypes = hashSetOf(DataType.TEXT)
                description = "Removes numbers,tokenization,numbers to words, filter words."
            }
            operation {
                linkToCodeProject(codeProject_txtops)
                linkToEnvironments(environment)
                id = txt_ops_id
                command = "txt_ops"
                number = 1
                inputDataType = DataType.TEXT
                outputDataType = DataType.TEXT
                publisher = author

                parameters {
                    STRING {
                        id = fromString("72309534-eee5-11ea-adc1-0242ac120002")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the csv file."
                    }
                    STRING {
                        id = fromString("72307b80-eee5-11ea-adc1-0242ac120002")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "output directory to save the processed text"
                    }
                    BOOLEAN {
                        id = fromString("72307c70-eee5-11ea-adc1-0242ac120002")
                        name = "stemmed"
                        defaultValue = "FALSE"
                        required = false
                        description = "If this parameter is true the words will be stemmed using Snowballer stemmer."
                    }
                    BOOLEAN {
                        id = fromString("72307d4c-eee5-11ea-adc1-0242ac120002")
                        name = "filternums"
                        defaultValue = "FALSE"
                        required = false
                        description = "If this parameter is true the numbers will be removed from the texts."
                    }
                    BOOLEAN {
                        id = fromString("72307e14-eee5-11ea-adc1-0242ac120002")
                        name = "num2words"
                        defaultValue = "FALSE"
                        required = false
                        description = "If this parameter is true all the numbers will be transformed in to letters, for example 2 : two ."
                    }
                    BOOLEAN {
                        id = fromString("72307edc-eee5-11ea-adc1-0242ac120002")
                        name = "stopwords"
                        defaultValue = "TRUE"
                        required = false
                        description = "If this parameter is true some words in a premade list will be filtered from the text. This script uses english stopwords list from nltk."
                    }
                }
            }

            val codeProject_add_noise = codeProject {
                id = im_add_noise_projectId
                slug = "commons-add-noise"
                name = "Add noise"
                gitlabNamespace = "mlreef"
                gitlabPath = "im_add_noise"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = "Adds noise to an image: gaussian , localvar , poisson , salt , pepper , speckle"
            }
            operation {
                linkToCodeProject(codeProject_add_noise)
                linkToEnvironments(environment)
                id = im_add_noise_id
                command = "im_add_noise"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("a26bec48-d0ff-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for transformation"
                    }
                    STRING {
                        id = fromString("a26bef36-d0ff-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "output directory to save images"
                    }
                    STRING {
                        id = fromString("a26bf044-d0ff-11ea-87d0-0242ac130003")
                        name = "mode"
                        defaultValue = "[{ \"value\": \"gaussian\" }, { \"value\": \"localvar\" }, { \"value\": \"poisson\" },{ \"value\": \"salt\" },{ \"value\": \"pepper\" },{ \"value\": \"speckle\" }]"
                        required = false
                        description = "noise mode it can take only these values: gaussian | localvar | poisson | salt | pepper | speckle"
                    }
                }
            }

            val codeProject_color_modifier = codeProject {
                id = im_color_modifier_projectId
                slug = "commons-color-modifier"
                name = "Color modifier"
                gitlabNamespace = "mlreef"
                gitlabPath = "im_color_modifier"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = """Changes the color in the image: contrast, saturation and value"""
            }
            operation {
                linkToCodeProject(codeProject_color_modifier)
                linkToEnvironments(environment)
                id = im_color_modifier_id
                command = "im_color_modifier"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("a26bf116-d0ff-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for transformation"
                    }
                    STRING {
                        id = fromString("a26bf1e8-d0ff-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "output directory to save images"
                    }
                    FLOAT {
                        id = fromString("a26bf300-d0ff-11ea-87d0-0242ac130003")
                        name = "brightness"
                        defaultValue = "0.5"
                        required = false
                        description = "Brightness value"
                    }
                    FLOAT {
                        id = fromString("a26bf436-d0ff-11ea-87d0-0242ac130003")
                        name = "contrast"
                        defaultValue = "0.5"
                        required = false
                        description = "contrast value"
                    }
                    FLOAT {
                        id = fromString("a26bf602-d0ff-11ea-87d0-0242ac130003")
                        name = "saturation"
                        defaultValue = "2"
                        required = false
                        description = "saturation value"
                    }
                }
            }

            val codeProject_create_thumbnails = codeProject {
                id = im_create_thumbnails_projectId
                slug = "commons-create-thumbnails"
                name = "Create Thumbnaills"
                gitlabNamespace = "mlreef"
                gitlabPath = "im_create_thumbnails"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = """Creates an smaller (in pixels) square version of the image."""
            }
            operation {
                linkToCodeProject(codeProject_create_thumbnails)
                linkToEnvironments(environment)
                id = im_create_thumbnails_id
                command = "im_create_thumbnails"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c5026-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for transformation"
                    }
                    STRING {
                        id = fromString("2c9c50f8-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "output directory to save images"
                    }
                    INTEGER {
                        id = fromString("2c9c51c0-d16c-11ea-87d0-0242ac130003")
                        name = "size"
                        defaultValue = "128"
                        required = false
                        description = "size of thumbnail width = height"
                    }
                }
            }

            val codeProject_distort_affine = codeProject {
                id = im_distort_affine_projectId
                slug = "commons-distort-affine"
                name = "Distort Affine"
                gitlabNamespace = "mlreef"
                gitlabPath = "im_distort_affine"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = """Transform the images with affine distortion."""
            }
            operation {
                linkToCodeProject(codeProject_distort_affine)
                linkToEnvironments(environment)
                id = im_distort_affine_id
                command = "im_distort_affine"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c5288-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for transformation"
                    }
                    STRING {
                        id = fromString("2c9c54d6-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "output directory to save images"
                    }
                    FLOAT {
                        id = fromString("2c9c55a8-d16c-11ea-87d0-0242ac130003")
                        name = "rotation"
                        defaultValue = "60"
                        required = false
                        description = "Angle of rotation"
                    }
                    FLOAT {
                        id = fromString("2c9c5670-d16c-11ea-87d0-0242ac130003")
                        name = "shear"
                        defaultValue = "5"
                        required = false
                        description = "Shear level"
                    }
                }
            }

            val codeProject_random_erasing = codeProject {
                id = im_random_erasing_projectId
                slug = "commons-random-erasing"
                name = "Random erasing"
                gitlabNamespace = "mlreef"
                gitlabPath = "im_random_erasing"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = """Deletes randoms areas from the images and replaces them with noise or gray"""
            }
            operation {
                linkToCodeProject(codeProject_random_erasing)
                linkToEnvironments(environment)
                id = im_random_erasing_id
                command = "im_random_erasing"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c572e-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for transformation"
                    }
                    STRING {
                        id = fromString("2c9c57f6-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "output directory to save images"
                    }
                    FLOAT {
                        id = fromString("2c9c58b4-d16c-11ea-87d0-0242ac130003")
                        name = "scale_min"
                        defaultValue = "0.1"
                        required = false
                        description = "min percentage of area to erase"
                    }
                    FLOAT {
                        id = fromString("2c9c5986-d16c-11ea-87d0-0242ac130003")
                        name = "scale_max"
                        defaultValue = "0.2"
                        required = false
                        description = "max percentage of area to erase"
                    }
                    FLOAT {
                        id = fromString("2c9c5b7a-d16c-11ea-87d0-0242ac130003")
                        name = "ratio"
                        defaultValue = "0.3"
                        required = false
                        description = "Ratio of area to erase"
                    }
                    FLOAT {
                        id = fromString("2c9c5c4c-d16c-11ea-87d0-0242ac130003")
                        name = "prob"
                        defaultValue = "0.9"
                        required = false
                        description = "Probability of erase"
                    }
                }
            }

            val codeProject_rotate = codeProject {
                id = im_rotate_projectId
                slug = "commons-rotate"
                name = "Rotate"
                gitlabNamespace = "mlreef"
                gitlabPath = "im_rotate"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = """Rotates the images in certain angle"""
            }
            operation {
                linkToCodeProject(codeProject_rotate)
                linkToEnvironments(environment)
                id = im_rotate_id
                command = "im_rotate"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c5d0a-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for transformation"
                    }
                    STRING {
                        id = fromString("2c9c5dd2-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "output directory to save images"
                    }
                    FLOAT {
                        id = fromString("2c9c628c-d16c-11ea-87d0-0242ac130003")
                        name = "angle"
                        defaultValue = "30"
                        required = false
                        description = "Angle of rotation"
                    }
                }
            }

            val codeProject_augment = codeProject {
                id = augment_projectId
                slug = "commons-augment"
                name = "Augment"
                gitlabNamespace = "mlreef"
                gitlabPath = "augment"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = """Data augmentation multiplies and tweakes the data by changing angle of rotation,""" +
                    """ flipping the images, zooming in, etc."""
            }

            operation {
                linkToCodeProject(codeProject_augment)
                linkToEnvironments(environment)
                id = augment_id
                command = "augment"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("1000000-0000-0001-0011-000000000000")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for augmentation"
                    }
                    STRING {
                        id = fromString("1000000-0000-0001-0012-000000000000")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "Output path to save models and logs"
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0001-0013-000000000000")
                        name = "iterations"
                        defaultValue = "5"
                        required = true
                        description = "Amount of time the process of augmentation will run"
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0001-0014-000000000000")
                        name = "rotation-range"
                        defaultValue = "15"
                        required = true
                        description = "Degree range for random rotations."
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0001-0015-000000000000")
                        name = "width-shift-range"
                        defaultValue = "0"
                        required = true
                        description = "FLOAT, 1-D array-like or INT - FLOAT: fraction of total width, if < 1, or pixels if >= 1. - 1-D array-like: random elements from the array. - INT: Integer number of pixels from Interval (-width_shift_range, +width_shift_range) - With width_shift_range=2 possible values are Integers [-1, 0, +1], same as with width_shift_range=[-1, 0, +1], while with width_shift_range=1.0 possible values are FLOATs in the INTerval [-1.0, +1.0)."
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0001-0016-000000000000")
                        name = "height-shift-range"
                        defaultValue = "0"
                        required = true
                        description = " FLOAT, 1-D array-like or INT - FLOAT: fraction of total height, if < 1, or pixels if >= 1. - 1-D array-like: random elements from the array. - INT: Integer number of pixels from interval (-height_shift_range, +height_shift_range) - With height_shift_range=2 possible values are INTegers [-1, 0, +1], same as with height_shift_range=[-1, 0, +1], while with height_shift_range=1.0 possible values are FLOATs in the INTerval [-1.0, +1.0)."
                    }
                    FLOAT {
                        id = fromString("1000000-0000-0001-0017-000000000000")
                        name = "shear-range"
                        defaultValue = "0"
                        required = true
                        description = "Shear intensity (Shear angle in counter-clockwise direction in degrees)"
                    }
                    FLOAT {
                        id = fromString("1000000-0000-0001-0018-000000000000")
                        name = "zoom-range"
                        defaultValue = "0"
                        required = true
                        description = "Zoom range from 0 none to 100"
                    }
                    BOOLEAN {
                        id = fromString("1000000-0000-0001-0019-000000000000")
                        name = "horizontal-flip"
                        defaultValue = "TRUE"
                        required = true
                        description = "Use of horizonal flip for augmentation"
                    }
                    BOOLEAN {
                        id = fromString("1000000-0000-0001-0020-000000000000")
                        name = "vertical-flip"
                        defaultValue = "TRUE"
                        required = true
                        description = "Use of vertical flip for augmentation"
                    }
                }
            }
            val codeProject_randomCrop = codeProject {
                id = randomCrop_projectId
                slug = "commons-random-crop"
                name = "Random crop"
                gitlabNamespace = "mlreef"
                gitlabPath = "random-crop"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = """This pipeline operation randomly crops a NxM (height x width) portion of the given dataset.
                        This is used to randomly extract parts of the image incase we need to remove bias present in image data.""".trimMargin()
            }

            operation {
                linkToCodeProject(codeProject_randomCrop)
                linkToEnvironments(environment)
                id = randomCrop_id
                command = "im_random_crop"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("1000000-0000-0002-0009-000000000000")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for transformation"
                    }
                    STRING {
                        id = fromString("1000000-0000-0002-0010-000000000000")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "path to save processed images"
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0002-0011-000000000000")
                        name = "height"
                        defaultValue = "35"
                        required = false
                        description = "height of final cropped image"
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0002-0012-000000000000")
                        name = "width"
                        defaultValue = "35"
                        required = false
                        description = "width of final cropped image"
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0002-0013-000000000000")
                        name = "seed"
                        defaultValue = "3"
                        required = false
                        group = "advanced"
                        description = "seed for randomness"
                    }
                }
            }

            val codeProject_leeFilter = codeProject {
                id = leeFilter_projectId
                slug = "commons-lee-filter"
                name = "Lee filter"
                gitlabNamespace = "mlreef"
                gitlabPath = "lee-filter"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = """The presence of speckle noise in Synthetic Aperture Radar (SAR) images makes the interpretation of the contents difficult, 
                        thereby degrading the quality of the image. Therefore an efficient speckle noise removal technique, the Lee Filter is used to 
                        smoothen the static-like noise present in these images""".trimMargin()
            }

            operation {
                linkToCodeProject(codeProject_leeFilter)
                linkToEnvironments(environment)
                id = leeFilter_id
                command = "im_lee_filter"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("1000000-0000-0003-0011-000001000000")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for transformation"
                    }
                    STRING {
                        id = fromString("1000000-0000-0003-0012-000200000000")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "path to directory of images processed"
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0003-0013-000300000000")
                        name = "intensity"
                        defaultValue = "5"
                        required = true
                        description = "window size of Lee Filter"
                    }
                }
            }

            // ############## VISUALISATION
            val codeProject_scatterplot = codeProject {
                id = scatterplot_projectId
                slug = "commons-scatterplot"
                name = "Scatter Plot"
                gitlabNamespace = "mlreef"
                gitlabPath = "scatterplot"
                inputDataTypes = hashSetOf(DataType.TABULAR)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = "Scatter plot with matplotlib"
            }
            visualization {
                linkToCodeProject(codeProject_scatterplot)
                linkToEnvironments(environment)
                id = scatterplot_id
                command = "scatterPlot"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("a827cb90-008c-11eb-adc1-0242ac120002")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the folder with the csv files"
                    }
                    STRING {
                        id = fromString("a827cdfc-008c-11eb-adc1-0242ac120002")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "path to directory to save the scatter plots"
                    }
                    INTEGER {
                        id = fromString("a827cfa0-008c-11eb-adc1-0242ac120002")
                        name = "column-x"
                        defaultValue = "0"
                        required = false
                        description = "Selects the csv column data to plot in axis x"
                    }
                    INTEGER {
                        id = fromString("a827d07c-008c-11eb-adc1-0242ac120002")
                        name = "column-y"
                        defaultValue = "1"
                        description ="Selects the csv column data to plot in axis y"
                        required = false
                    }
                    STRING {
                        id = fromString("a827d144-008c-11eb-adc1-0242ac120002")
                        name = "label-x"
                        defaultValue = "x"
                        required = false
                        description = "Label for axis x"
                    }
                    STRING {
                        id = fromString("a827d374-008c-11eb-adc1-0242ac120002")
                        name = "label-y"
                        defaultValue = "y"
                        required = false
                        description = "Label for axis x"
                    }
                    STRING {
                        id = fromString("a827d446-008c-11eb-adc1-0242ac120002")
                        name = "title"
                        defaultValue = "Scatter plot x.vs y"
                        required = false
                        description = "Title of plot"
                    }
                }
            }
            val codeProject_wordcloud = codeProject {
                id = wordcloud_projectId
                slug = "commons-wordcloud"
                name = "WordCloud"
                gitlabNamespace = "mlreef"
                gitlabPath = "wordcloud"
                inputDataTypes = hashSetOf(DataType.TEXT)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = "Rectangular word cloud from text"
            }
            visualization {
                linkToCodeProject(codeProject_wordcloud)
                linkToEnvironments(environment)
                id = wordcloud_id
                command = "wordcloud_square"
                number = 2
                inputDataType = DataType.TEXT
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("a827d504-008c-11eb-adc1-0242ac120002")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the folder with the text files"
                    }
                    STRING {
                        id = fromString("a827d5c2-008c-11eb-adc1-0242ac120002")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "path to directory to save the wordcloud images"
                    }
                }
            }
            val codeProject_tsne = codeProject {
                id = tsne_projectId
                slug = "commons-tsne"
                name = "T-SNE"
                gitlabNamespace = "mlreef"
                gitlabPath = "tsne"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = "t-distributed Stochastic Neighbor Embedding Data visualization"
            }
            visualization {
                linkToCodeProject(codeProject_tsne)
                linkToEnvironments(environment)
                id = tsne_id
                command = "tsne"
                number = 3
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c637c-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for dimensional reduction"
                    }
                    STRING {
                        id = fromString("2c9c644e-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "path to directory to save the tsne mapping image"
                    }
                    INTEGER {
                        id = fromString("2c9c6716-d16c-11ea-87d0-0242ac130003")
                        name = "pca-components"
                        defaultValue = "200"
                        required = false
                        description = "Number of PCA components"
                    }
                    INTEGER {
                        id = fromString("2c9c6516-d16c-11ea-87d0-0242ac130003")
                        name = "num-dimensions"
                        defaultValue = "2"
                        required = false
                        description = "Number of dimensions of the mapping"
                    }
                    INTEGER {
                        id = fromString("2c9c66ce-d16c-11ea-87d0-0242ac130003")
                        name = "perplexity"
                        defaultValue = "50"
                        description ="this parameter balances the attention between local and global aspects"
                        required = false
                    }
                    FLOAT {
                        id = fromString("2c9c67c8-d16c-11ea-87d0-0242ac130003")
                        name = "learning-rate"
                        defaultValue = "150"
                        required = false
                        description = "learning rate"
                    }
                    INTEGER {
                        id = fromString("2c9c69d0-d16c-11ea-87d0-0242ac130003")
                        name = "max-iter"
                        defaultValue = "1000"
                        required = false
                        description = "maximum number of iterations"
                    }
                }
            }

            // ############## MODEL #################
            val codeProject_bertsent = codeProject {
                id = bertsent_projectId
                slug = "commons-bertsent"
                name = "Bert Sentiment classification"
                gitlabNamespace = "mlreef"
                gitlabPath = "code-project-bertsent"
                inputDataTypes = hashSetOf(DataType.TEXT)
                outputDataTypes = hashSetOf(DataType.MODEL)
                description = "BERT sentiment classification with Imdb dataset."
            }
            model {
                linkToCodeProject(codeProject_bertsent)
                linkToEnvironments(environment)
                id = bertsent_id
                command = "bertscript"
                number = 3
                inputDataType = DataType.TEXT
                outputDataType = DataType.MODEL
                publisher = author

                parameters {
                    STRING {
                        id = fromString("e6452bf4-0edb-11eb-adc1-0242ac120002")
                        name = "input-path"
                        defaultValue = "data"
                        required = true
                        description = "Path to input folder"
                    }
                    STRING {
                        id = fromString("e6452ce4-0edb-11eb-adc1-0242ac120002")
                        name = "train-file"
                        defaultValue = "imdb_train.txt"
                        required = true
                        description = "Name of training data csv file"
                    }
                    STRING {
                        id = fromString("e6452dca-0edb-11eb-adc1-0242ac120002")
                        name = "test-file"
                        defaultValue = "imdb_test.txt"
                        required = true
                        description = "Name of test data csv file"
                    }
                    STRING {
                        id = fromString("e6452e9c-0edb-11eb-adc1-0242ac120002")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "path to output save weights"
                    }
                    BOOLEAN {
                        id = fromString("e6452f6e-0edb-11eb-adc1-0242ac120002")
                        name = "train"
                        defaultValue = "true"
                        required = true
                        description = "True for training"
                    }
                    INTEGER {
                        id = fromString("e6453040-0edb-11eb-adc1-0242ac120002")
                        name = "epochs"
                        defaultValue = "10"
                        required = true
                        description = "Amount of epochs for training"
                    }
                    BOOLEAN {
                        id = fromString("e64533ce-0edb-11eb-adc1-0242ac120002")
                        name = "evaluate"
                        defaultValue = "false"
                        required = false
                        description = "True for model evaluation"
                    }
                    BOOLEAN {
                        id = fromString("e64534b4-0edb-11eb-adc1-0242ac120002")
                        name = "predict"
                        defaultValue = "false"
                        required = false
                        description = "True to use the model"
                    }
                }
            }

            val codeProject_forecasting = codeProject {
                id = forecasting_projectId
                slug = "commons-forecasting"
                name = "Forecasting"
                gitlabNamespace = "mlreef"
                gitlabPath = "code-project-forecasting"
                inputDataTypes = hashSetOf(DataType.TABULAR)
                outputDataTypes = hashSetOf(DataType.MODEL)
                description = "Forecasting sales with fbprophet, featuring a kaggle dataset."
            }
            model {
                linkToCodeProject(codeProject_forecasting)
                linkToEnvironments(environment)
                id = forecasting_id
                command = "forecasting"
                number = 3
                inputDataType = DataType.TABULAR
                outputDataType = DataType.MODEL
                publisher = author

                parameters {
                    STRING {
                        id = fromString("e1e3b01e-08c6-11eb-adc1-0242ac120002")
                        name = "input-path"
                        defaultValue = "data"
                        required = true
                        description = "Path to input folder"
                    }
                    STRING {
                        id = fromString("e1e3b104-08c6-11eb-adc1-0242ac120002")
                        name = "input-file"
                        defaultValue = "train.csv"
                        required = true
                        description = "Name of training data csv file"
                    }
                    STRING {
                        id = fromString("e1e3b1cc-08c6-11eb-adc1-0242ac120002")
                        name = "test-file"
                        defaultValue = "test.csv"
                        required = true
                        description = "Name of test data csv file"
                    }
                    STRING {
                        id = fromString("e1e3b35c-08c6-11eb-adc1-0242ac120002")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                        description = "path to output save predictions"
                    }
                    INTEGER {
                        id = fromString("e1e3b42e-08c6-11eb-adc1-0242ac120002")
                        name = "seasonality"
                        defaultValue = "monthly"
                        required = true
                        description = "Choose between monthly, quarterly or hourly"
                    }
                    FLOAT {
                        id = fromString("e1e3b4f6-08c6-11eb-adc1-0242ac120002")
                        name = "period"
                        defaultValue = "30.5"
                        required = true
                        description = "Float number of days in one period"
                    }
                    INTEGER {
                        id = fromString("e1e3b5b4-08c6-11eb-adc1-0242ac120002")
                        name = "fourier-order"
                        defaultValue = "5"
                        required = false
                        description = "Integer number of Fourier components to use"
                    }
                    INTEGER {
                        id = fromString("e1e3b7e4-08c6-11eb-adc1-0242ac120002")
                        name = "future-periods"
                        defaultValue = "10"
                        required = false
                        description = "Number of periods to predict"
                    }
                }
            }

            val codeProject_chatbot = codeProject {
                id = chatbot_model_projectId
                slug = "commons-chatbot"
                name = "Small chatbot"
                gitlabNamespace = "mlreef"
                gitlabPath = "code-project-chatbot"
                inputDataTypes = hashSetOf(DataType.TEXT)
                outputDataTypes = hashSetOf(DataType.MODEL)
                description = "Chatbot training for small group of sentences."
            }
            model {
                linkToCodeProject(codeProject_chatbot)
                linkToEnvironments(environment)
                id = chatbot_id
                command = "chatbot_model"
                number = 1
                inputDataType = DataType.TEXT
                outputDataType = DataType.MODEL
                publisher = author

                parameters {
                    STRING {
                        id = fromString("723080a8-eee5-11ea-adc1-0242ac120002")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the json file to train the model."
                    }
                    STRING {
                        id = fromString("7230817a-eee5-11ea-adc1-0242ac120002")
                        name = "output-path"
                        defaultValue = "./output"
                        description = "path to save the trained model"
                    }
                    INTEGER {
                        id = fromString("72308238-eee5-11ea-adc1-0242ac120002")
                        name = "epochs"
                        defaultValue = "400"
                        description = "number of epochs for training"
                    }
                    INTEGER {
                        id = fromString("72308300-eee5-11ea-adc1-0242ac120002")
                        name = "batch-size"
                        defaultValue = "8"
                        required = false
                        description = "batch size fed to the neural network (int)"
                    }
                    FLOAT {
                        id = fromString("723083be-eee5-11ea-adc1-0242ac120002")
                        name = "learning-rate"
                        defaultValue = "0.01"
                        required = false
                        description = "learning rate"
                    }
                }
            }
            val codeProject_resnet50 = codeProject {
                id = resnet50_projectId
                slug = "commons-resnet-50"
                name = "Resnet50"
                gitlabNamespace = "mlreef"
                gitlabPath = "code-project-resnet-50"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.MODEL)
                description = "ResNet50 is a 50 layer Residual Network."
            }
            model {
                linkToCodeProject(codeProject_resnet50)
                linkToEnvironments(environment)
                id = resnet50_id
                command = "resnet50"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.MODEL
                publisher = author

                parameters {
                    STRING {
                        id = fromString("1000000-1000-0003-0010-000000000000")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for training"
                    }
                    STRING {
                        id = fromString("1000000-1000-0003-0011-000000000000")
                        name = "output-path"
                        defaultValue = "./output"
                        description = "path to output metrics and model"
                    }
                    INTEGER {
                        id = fromString("1000000-1000-0003-0012-000000000000")
                        name = "height"
                        defaultValue = "224"
                        description = "height of images (int)"
                    }
                    INTEGER {
                        id = fromString("1000000-1000-0003-0013-000000000000")
                        name = "width"
                        defaultValue = "224"
                        description = "width of images (int)"
                    }
                    INTEGER {
                        id = fromString("1000000-1000-0003-0014-000000000000")
                        name = "epochs"
                        defaultValue = "35"
                        description = "number of epochs for training"
                    }
                    INTEGER {
                        id = fromString("1000000-1000-0003-0015-000000000000")
                        name = "channels"
                        defaultValue = "3"
                        required = false
                        description = "channels of images: 1 = grayscale, 3 = RGB ,4=RGBA (int)"
                    }
                    BOOLEAN {
                        id = fromString("1000000-1000-0003-0016-000000000000")
                        name = "use-pretrained"
                        defaultValue = "true"
                        required = false
                        description = "use pretrained ResNet50 weights (bool)"
                    }
                    INTEGER {
                        id = fromString("1000000-1000-0003-0017-000000000000")
                        name = "batch-size"
                        defaultValue = "25"
                        required = false
                        description = "batch size fed to the neural network (int)"
                    }
                    FLOAT {
                        id = fromString("1000000-1000-0003-0018-000000000000")
                        name = "validation-split"
                        defaultValue = "0.2"
                        required = false
                        description = "fraction of images to be used for validation (float)"
                    }
                    STRING {
                        id = fromString("1000000-1000-0003-0019-000000000000")
                        name = "class_mode"
                        defaultValue = "[{ \"value\": \"categorical\" }, { \"value\": \"binary\" }, { \"value\": \"sparse\" }]"
                        required = true
                        description = "class mode : if class_mode is categorical (default value) it must include the label column with the class/es of each image. Values in column can be string/list/tuple if a single class or list/tuple if multiple classes. if class_mode is binary or sparse it must include the given label column with class values as strings. if class_mode is raw or multi_output it should contain the columns specified in labels. if class_mode is input or None no extra column is needed."
                    }
                    FLOAT {
                        id = fromString("1000000-1000-0003-0020-000000000000")
                        name = "learning-rate"
                        defaultValue = "0.0001"
                        required = false
                        description = "learning rate of Adam Optimizer (float)"
                    }
                    STRING {
                        id = fromString("1000000-1000-0003-0021-000000000000")
                        name = "loss"
                        defaultValue = "sparse_categorical_crossentropy"
                        required = false
                        description = ": Use sparse_categorical_crossentropy loss function when there are two or more label classes. We expect labels to be provided as integers. If you want to provide labels using one-hot representation, please use categorial_crossentropy loss, binary_crossentropy means that the labels (there can be only 2) are encoded as float32 scalars with values 0 or 1."
                    }
                }
            }
            val codeProject_multimodel = codeProject {
                id = multimodel_projectId
                slug = "commons-multimodel"
                name = "CNN Multimodel"
                gitlabNamespace = "mlreef"
                gitlabPath = "code-project-multimodel"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.MODEL)
                description = "This script allows you to test several CNN models for image classification only adjusting args, you can choose between:" +
                    "resnet, alexnet,vgg, squeezenet, densenet,inception. You can use the pretrained version of those models or you can customize" +
                    "the behavior retraining with you own data."
            }

            model {
                linkToCodeProject(codeProject_multimodel)
                linkToEnvironments(environment)
                id = multimodel_id
                command = "multimodel"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.MODEL
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c6aac-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                        description = "Data input, path to the images used for training"
                    }
                    STRING {
                        id = fromString("2c9c6b6a-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        description = "path for output metrics and model"
                    }
                    INTEGER {
                        id = fromString("2c9c6c46-d16c-11ea-87d0-0242ac130003")
                        name = "batch-size"
                        defaultValue = "24"
                        description = "batch size fed to the neural network (int)"
                    }
                    INTEGER {
                        id = fromString("2c9c6c47-d16c-11ea-87d0-0242ac130003")
                        name = "num-classes"
                        defaultValue = "11"
                        description = "amount of classes present in the training data"
                    }
                    INTEGER {
                        id = fromString("2c9c6d0e-d16c-11ea-87d0-0242ac130003")
                        name = "epochs"
                        defaultValue = "100"
                        description = "number of epochs for training"
                    }
                    STRING {
                        id = fromString("2c9c6de0-d16c-11ea-87d0-0242ac130003")
                        name = "model-name"
                        defaultValue = "vgg"
                        description = "choose the model :resnet, alexnet, vgg, squeezenet, densenet, inception"

                    }
                    BOOLEAN {
                        id = fromString("2c9c7060-d16c-11ea-87d0-0242ac130003")
                        name = "feature-extract"
                        defaultValue = "true"
                        required = false
                        description = "select true if you want to extract features or false for classification using the trained model"

                    }
                }
            }

            //asfinag_tree_cover.py
            val codeProject_asfinagtree = codeProject {
                id = asfinagtreecover_projectId
                slug = "code-asfinag-treecover"
                name = "ASFINAG Tree cover"
                gitlabNamespace = "mlreef"
                gitlabPath = "code-asfinag-treecover"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.MODEL)
                description = "ASFINAG use case for semantic segmentation to mark tree covered areas"
            }

            model {
                linkToCodeProject(codeProject_asfinagtree)
                linkToEnvironments(environment)
                id = asfinagtreecover_id
                command = "asfinag_tree_cover"
                number = 5
                inputDataType = DataType.IMAGE
                outputDataType = DataType.MODEL
                publisher = author

                parameters {
                    STRING {
                        id = fromString("c55180da-2fe4-11eb-adc1-0242ac120002")
                        name = "input-path"
                        defaultValue = "example_data"
                        required = true
                        description = "Data folder with geojson files"
                    }
                    STRING {
                        id = fromString("c55181fc-2fe4-11eb-adc1-0242ac120002")
                        name = "output-path"
                        defaultValue = "output"
                        description = "path for output metrics and model"
                        required= true
                    }
                    STRING {
                        id = fromString("c5518300-2fe4-11eb-adc1-0242ac120002")
                        name = "filename"
                        defaultValue = "eastern_france.geojson"
                        description = "filename geojson file to train"
                        required= true
                    }
                    INTEGER {
                        id = fromString("c55183f0-2fe4-11eb-adc1-0242ac120002")
                        name = "width"
                        defaultValue = "256"
                        description = "width of images to train"
                        required = false
                    }
                    INTEGER {
                        id = fromString("c55184e0-2fe4-11eb-adc1-0242ac120002")
                        name = "height"
                        defaultValue = "256"
                        description = "height of images to train"
                        required = false

                    }
                    STRING {
                        id = fromString("c55185d0-2fe4-11eb-adc1-0242ac120002")
                        name = "instance-id"
                        defaultValue = ""
                        required = false
                        description = "Instance id in sentinel hub account"

                    }
                    STRING {
                        id = fromString("c5518878-2fe4-11eb-adc1-0242ac120002")
                        name = "time-start"
                        defaultValue = "2017-01-01"
                        required = true
                        description = "Start of time interval to extract images"

                    }
                    STRING {
                        id = fromString("c5518972-2fe4-11eb-adc1-0242ac120002")
                        name = "time-end"
                        defaultValue = "2017-12-31"
                        required = true
                        description = "End of time interval to extract images"

                    }
                    FLOAT {
                        id = fromString("c5518900-2fe4-11eb-adc1-0242ac120002")
                        name = "max-acc"
                        defaultValue = "0.2"
                        required = false
                        description = "Threshold of accuracy for training"
                    }
                  }
                }
            val codeProject_dummy = codeProject {
                id = dummy_projectId
                slug = "code-project-dummy"
                name = "Dummy debug_dataprocessor"
                gitlabNamespace = "mlreef"
                gitlabPath = "code-project-dummy"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = "Dummy Pipeline."
            }

            model {
                linkToCodeProject(codeProject_dummy)
                linkToEnvironments(environment)
                id = dummy_id
                command = "debug_dataprocessor"
                number = 1
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    INTEGER {
                        id = fromString("1000000-2000-0003-0011-000000000000")
                        name = "epochs"
                        defaultValue = "10"
                        description = ""
                    }
                    INTEGER {
                        id = fromString("1000000-2000-0003-0012-000000000000")
                        name = "batch_size"
                        defaultValue = "10"
                        description = ""
                    }
                }
            }
        }
    }
}
