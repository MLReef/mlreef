package com.mlreef.rest.feature.data_processors

import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.BaseEnvironment
import com.mlreef.rest.DataType
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
    val im_distort_afine_projectId = fromString("fe957122-d0cf-11ea-87d0-0242ac130003")
    val im_distort_afine_id = fromString("fe9571e0-d0cf-11ea-87d0-0242ac130003")
    val im_random_erasing_projectId = fromString("fe957294-d0cf-11ea-87d0-0242ac130003")
    val im_random_erasing_id = fromString("fe95735c-d0cf-11ea-87d0-0242ac130003")
    val im_rotate_projectId = fromString("fe957410-d0cf-11ea-87d0-0242ac130003")
    val im_rotate_id = fromString("fe957582-d0cf-11ea-87d0-0242ac130003")
    val tsne_projectId = fromString("fe9577b2-d0cf-11ea-87d0-0242ac130003")
    val tsne_id = fromString("fe957884-d0cf-11ea-87d0-0242ac130003")

    fun prepare(author: Subject, token: String): DSLContextBuilder {

        return ensureData(author, token) {

            //        tag {
            //            id = fromString("2000000-0000-0001-0001-000000000000")
            //            name = "Some-tag-maybe"
            //            // See SearchableTagType enum class
            //            type = SearchableTagType.UNDEFINED
            //        }
            //TODO: HOW TO CHANGE IT FOR DATA VISUALIZATION
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
                id = tsne_id
                command = "tsne"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c637c-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("2c9c644e-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                    }
                    INTEGER {
                        id = fromString("2c9c6516-d16c-11ea-87d0-0242ac130003")
                        name = "num_dimensions"
                        defaultValue = "2"
                        required = false
                    }
                    INTEGER {
                        id = fromString("2c9c66ce-d16c-11ea-87d0-0242ac130003")
                        name = "perplexity"
                        defaultValue = "350"
                        required = false
                    }
                    FLOAT {
                        id = fromString("2c9c67c8-d16c-11ea-87d0-0242ac130003")
                        name = "learning_rate"
                        defaultValue = "150"
                        required = false
                    }
                    INTEGER {
                        id = fromString("2c9c69d0-d16c-11ea-87d0-0242ac130003")
                        name = "max_iter"
                        defaultValue = "1000"
                        required = false
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
                id = im_add_noise_id
                command = "im_add_noise"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("a26bec48-d0ff-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("a26bef36-d0ff-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                    }
                    STRING {
                        id = fromString("a26bf044-d0ff-11ea-87d0-0242ac130003")
                        name = "mode"
                        defaultValue = "gaussian"
                        required = false
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
                id = im_color_modifier_id
                command = "im_color_modifier"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("a26bf116-d0ff-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("a26bf1e8-d0ff-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                    }
                    FLOAT {
                        id = fromString("a26bf300-d0ff-11ea-87d0-0242ac130003")
                        name = "brightness"
                        defaultValue = "0.5"
                        required = false
                    }
                    FLOAT {
                        id = fromString("a26bf436-d0ff-11ea-87d0-0242ac130003")
                        name = "contrast"
                        defaultValue = "0.5"
                        required = false
                    }
                    FLOAT {
                        id = fromString("a26bf602-d0ff-11ea-87d0-0242ac130003")
                        name = "saturation"
                        defaultValue = "2"
                        required = false
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
                id = im_create_thumbnails_id
                command = "im_create_thumbnails"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c5026-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("2c9c50f8-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                    }
                    INTEGER {
                        id = fromString("2c9c51c0-d16c-11ea-87d0-0242ac130003")
                        name = "size"
                        defaultValue = "128"
                        required = false
                    }
                }
            }

            val codeProject_distort_affine = codeProject {
                id = im_distort_afine_projectId
                slug = "commons-distort-affine"
                name = "Distort Affine"
                gitlabNamespace = "mlreef"
                gitlabPath = "im_distort_afine"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = """Transform the images with afine distortion."""
            }
            operation {
                linkToCodeProject(codeProject_distort_affine)
                id = im_distort_afine_id
                command = "im_distort_afine"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c5288-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("2c9c54d6-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                    }
                    FLOAT {
                        id = fromString("2c9c55a8-d16c-11ea-87d0-0242ac130003")
                        name = "rotation"
                        defaultValue = "60"
                        required = false
                    }
                    FLOAT {
                        id = fromString("2c9c5670-d16c-11ea-87d0-0242ac130003")
                        name = "shear"
                        defaultValue = "5"
                        required = false
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
                id = im_random_erasing_id
                command = "im_ramdom_erasing"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c572e-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("2c9c57f6-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                    }
                    FLOAT {
                        id = fromString("2c9c58b4-d16c-11ea-87d0-0242ac130003")
                        name = "scale_min"
                        defaultValue = "0.1"
                        required = false
                    }
                    FLOAT {
                        id = fromString("2c9c5986-d16c-11ea-87d0-0242ac130003")
                        name = "scale_max"
                        defaultValue = "0.2"
                        required = false
                    }
                    FLOAT {
                        id = fromString("2c9c5b7a-d16c-11ea-87d0-0242ac130003")
                        name = "ratio"
                        defaultValue = "0.3"
                        required = false
                    }
                    FLOAT {
                        id = fromString("2c9c5c4c-d16c-11ea-87d0-0242ac130003")
                        name = "prob"
                        defaultValue = "0.9"
                        required = false
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
                id = im_rotate_id
                command = "im_rotate"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c5d0a-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("2c9c5dd2-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                    }
                    FLOAT {
                        id = fromString("2c9c628c-d16c-11ea-87d0-0242ac130003")
                        name = "angle"
                        defaultValue = "30"
                        required = false
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
                id = augment_id
                command = "augment"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("1000000-0000-0001-0011-000000000000")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("1000000-0000-0001-0012-000000000000")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0001-0013-000000000000")
                        name = "iterations"
                        defaultValue = "5"
                        required = true
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0001-0014-000000000000")
                        name = "rotation-range"
                        defaultValue = "15"
                        required = true
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0001-0015-000000000000")
                        name = "width-shift-range"
                        defaultValue = "0"
                        required = true
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0001-0016-000000000000")
                        name = "height-shift-range"
                        defaultValue = "0"
                        required = true
                    }
                    FLOAT {
                        id = fromString("1000000-0000-0001-0017-000000000000")
                        name = "shear-range"
                        defaultValue = "0"
                        required = true
                    }
                    FLOAT {
                        id = fromString("1000000-0000-0001-0018-000000000000")
                        name = "zoom-range"
                        defaultValue = "0"
                        required = true
                    }
                    BOOLEAN {
                        id = fromString("1000000-0000-0001-0019-000000000000")
                        name = "horizontal-flip"
                        defaultValue = "TRUE"
                        required = true
                    }
                    BOOLEAN {
                        id = fromString("1000000-0000-0001-0020-000000000000")
                        name = "vertical-flip"
                        defaultValue = "TRUE"
                        required = true
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
                id = randomCrop_id
                command = "im_random_crop"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("1000000-0000-0002-0009-000000000000")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("1000000-0000-0002-0010-000000000000")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0002-0011-000000000000")
                        name = "height"
                        defaultValue = "35"
                        required = false
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0002-0012-000000000000")
                        name = "width"
                        defaultValue = "35"
                        required = false
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0002-0013-000000000000")
                        name = "seed"
                        defaultValue = "3"
                        required = false
                        group = "advanced"
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
                id = leeFilter_id
                command = "im_lee_filter"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("1000000-0000-0003-0011-000001000000")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("1000000-0000-0003-0012-000200000000")
                        name = "output-path"
                        defaultValue = "./output"
                        required = true
                    }
                    INTEGER {
                        id = fromString("1000000-0000-0003-0013-000300000000")
                        name = "intensity"
                        defaultValue = "5"
                        required = true
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
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = "ResNet50 is a 50 layer Residual Network."
            }

            model {
                linkToCodeProject(codeProject_resnet50)
                id = resnet50_id
                command = "resnet50"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("1000000-1000-0003-0010-000000000000")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("1000000-1000-0003-0011-000000000000")
                        name = "output-path"
                        defaultValue = "."
                    }
                    INTEGER {
                        id = fromString("1000000-1000-0003-0012-000000000000")
                        name = "height"
                        defaultValue = "36"
                    }
                    INTEGER {
                        id = fromString("1000000-1000-0003-0013-000000000000")
                        name = "width"
                        defaultValue = "36"
                    }
                    INTEGER {
                        id = fromString("1000000-1000-0003-0014-000000000000")
                        name = "epochs"
                        defaultValue = "35"
                    }
                    INTEGER {
                        id = fromString("1000000-1000-0003-0015-000000000000")
                        name = "channels"
                        defaultValue = "3"
                        required = false
                    }
                    BOOLEAN {
                        id = fromString("1000000-1000-0003-0016-000000000000")
                        name = "use-pretrained"
                        defaultValue = "true"
                        required = false
                    }
                    INTEGER {
                        id = fromString("1000000-1000-0003-0017-000000000000")
                        name = "batch-size"
                        defaultValue = "25"
                        required = false
                    }
                    FLOAT {
                        id = fromString("1000000-1000-0003-0018-000000000000")
                        name = "validation-split"
                        defaultValue = "0.2"
                        required = false
                    }
                    STRING {
                        id = fromString("1000000-1000-0003-0019-000000000000")
                        name = "class_mode"
                        defaultValue = "categorical"
                        required = false
                    }
                    FLOAT {
                        id = fromString("1000000-1000-0003-0020-000000000000")
                        name = "learning-rate"
                        defaultValue = "0.0001"
                        required = false
                    }
                    FLOAT {
                        id = fromString("1000000-1000-0003-0021-000000000000")
                        name = "loss"
                        defaultValue = "0.1"
                        required = false
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
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = "This script allows you to test several CNN models for image classification only adjusting args, you can choose between:" +
                    "resnet, alexnet,vgg, squeezenet, densenet,inception. You can use the pretrained version of those models or you can customize" +
                    "the behavior retraining with you own data."
            }

            model {
                linkToCodeProject(codeProject_multimodel)
                id = multimodel_id
                command = "multimodel"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    STRING {
                        id = fromString("2c9c6aac-d16c-11ea-87d0-0242ac130003")
                        name = "input-path"
                        defaultValue = "."
                        required = true
                    }
                    STRING {
                        id = fromString("2c9c6b6a-d16c-11ea-87d0-0242ac130003")
                        name = "output-path"
                        defaultValue = "./output"
                    }
                    INTEGER {
                        id = fromString("2c9c6c46-d16c-11ea-87d0-0242ac130003")
                        name = "batch-size"
                        defaultValue = "24"
                    }
                    INTEGER {
                        id = fromString("2c9c6d0e-d16c-11ea-87d0-0242ac130003")
                        name = "epochs"
                        defaultValue = "100"
                    }
                    STRING {
                        id = fromString("2c9c6de0-d16c-11ea-87d0-0242ac130003")
                        name = "model-name"
                        defaultValue = "vgg"
                    }
                    BOOLEAN {
                        id = fromString("2c9c7060-d16c-11ea-87d0-0242ac130003")
                        name = "feature-extract"
                        defaultValue = "true"
                        required = false
                    }
                }
            }
            val codeProject_dummy = codeProject {
                id = dummy_projectId
                slug = "code-project-dummy"
                name = "Dummy debug_dataprocessor"
                gitlabId = 11
                gitlabNamespace = "mlreef"
                gitlabPath = "code-project-dummy"
                inputDataTypes = hashSetOf(DataType.IMAGE)
                outputDataTypes = hashSetOf(DataType.IMAGE)
                description = "Dummy Pipeline."
            }

            model {
                linkToCodeProject(codeProject_dummy)
                id = dummy_id
                command = "debug_dataprocessor"
                number = 1
                baseEnvironment = BaseEnvironment.default()
                inputDataType = DataType.IMAGE
                outputDataType = DataType.IMAGE
                publisher = author

                parameters {
                    INTEGER {
                        id = fromString("1000000-2000-0003-0011-000000000000")
                        name = "epochs"
                        defaultValue = "10"
                    }
                    INTEGER {
                        id = fromString("1000000-2000-0003-0012-000000000000")
                        name = "batch_size"
                        defaultValue = "10"
                    }
                }
            }
        }
    }
}
