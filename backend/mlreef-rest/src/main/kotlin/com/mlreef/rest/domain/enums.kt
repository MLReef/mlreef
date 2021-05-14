package com.mlreef.rest.domain

enum class AccessLevel(val accessCode: Int) {
    NONE(0),
    VISITOR(5), // Use VISITOR for PUBLIC projects as pseudo role
    GUEST(10),
    REPORTER(20),
    DEVELOPER(30),
    MAINTAINER(40),
    OWNER(50);

    companion object {
        @JvmStatic
        fun fromCode(code: Int?): AccessLevel? {
            return values().firstOrNull { it.accessCode == code }
        }

        fun parse(name: String): AccessLevel =
            parseOrNull(name) ?: throw EnumConstantNotPresentException(AccessLevel::class.java, name)

        fun parseOrNull(name: String?): AccessLevel? = values().firstOrNull { it.name.equals(name?.trim(), true) }

        @JvmStatic
        fun isSufficientFor(instance: AccessLevel?, limit: AccessLevel?): Boolean {
            if (limit == null) return true
            if (instance == null) return false
            return instance.accessCode >= limit.accessCode
        }
    }

    fun satisfies(limit: AccessLevel?) = isSufficientFor(this, limit)
}

enum class PublishStatus(val value: Int) {
    PUBLISH_CREATION_FAIL(0),
    PUBLISH_CREATED(0),
    PUBLISH_PENDING(1),
    PUBLISH_STARTING(2),
    PUBLISH_STARTED(3),
    PUBLISH_FINISHING(4),
    PUBLISHED(9),
    PUBLISH_FAILED(8),
    INCONSISTENT(99),
    OUTDATED(99),
    PIPELINE_MISSING(99),
    UNPUBLISH_CREATION_FAIL(0),
    UNPUBLISH_CREATED(0),
    UNPUBLISH_PENDING(1),
    UNPUBLISH_STARTING(2),
    UNPUBLISH_STARTED(3),
    UNPUBLISH_FINISHING(4),
    UNPUBLISHED(9),
    UNPUBLISH_FAILED(8),
    OTHER(99),
    REPUBLISH(100), //Republsih not real status (just to return that status to FE, not save it to db)
    ;

    companion object {
        fun fromGitlabStatusString(gitlabStatus: String?): PipelineStatus? {
            return when (gitlabStatus?.toLowerCase()) {
                "created", "waiting_for_resource", "preparing", "pending", "manual", "scheduled" -> PipelineStatus.PENDING
                "running" -> PipelineStatus.RUNNING
                "success" -> PipelineStatus.SUCCESS
                "failed" -> PipelineStatus.FAILED
                "canceled" -> PipelineStatus.CANCELED
                "skipped" -> PipelineStatus.OTHER
                null -> null
                else -> PipelineStatus.OTHER
            }
        }

        fun pipelineToPublishStatus(pipelineStatus: PipelineStatus, publishing: Boolean = true): PublishStatus {
            return when (pipelineStatus) {
                PipelineStatus.PENDING -> if (publishing) PUBLISH_PENDING else UNPUBLISH_PENDING
                PipelineStatus.RUNNING -> if (publishing) PUBLISH_STARTED else UNPUBLISH_STARTED
                PipelineStatus.SUCCESS -> if (publishing) PUBLISHED else UNPUBLISHED
                PipelineStatus.FAILED -> if (publishing) PUBLISH_FAILED else UNPUBLISH_FAILED
                else -> OTHER
            }
        }
    }

    fun isCompletedPipeline(): Boolean {
        return this == PUBLISHED ||
            this == PUBLISH_FAILED ||
            this == OUTDATED ||
            this == UNPUBLISHED ||
            this == UNPUBLISH_FAILED ||
            this == OTHER ||
            this == PUBLISH_CREATION_FAIL ||
            this == UNPUBLISH_CREATION_FAIL
    }

    fun isPending(): Boolean {
        return this == PUBLISH_PENDING || this == UNPUBLISH_PENDING
    }

    fun isWaitingPipeline(): Boolean {
        return this == PUBLISH_CREATED || this == PUBLISH_PENDING || this == UNPUBLISH_PENDING || this == UNPUBLISH_CREATED
    }

    fun isRunningPipeline(): Boolean {
        return this == PUBLISH_STARTING ||
            this == PUBLISH_STARTED ||
            this == PUBLISH_FINISHING ||
            this == UNPUBLISH_STARTING ||
            this == UNPUBLISH_STARTED ||
            this == UNPUBLISH_FINISHING
    }

    fun isPublishing(): Boolean {
        return !this.isUnpublishing()
    }

    fun isUnpublishing(): Boolean {
        return this == UNPUBLISH_CREATED ||
            this == UNPUBLISH_PENDING ||
            this == UNPUBLISH_STARTING ||
            this == UNPUBLISH_STARTED ||
            this == UNPUBLISH_FINISHING ||
            this == UNPUBLISHED ||
            this == UNPUBLISH_FAILED
    }

    fun isFinishing(): Boolean {
        return this == PUBLISH_FINISHING || this == UNPUBLISH_FINISHING
    }

    fun canUpdateTo(other: PublishStatus?): Boolean {
        return this.value < (other?.value ?: -1)
    }
}

enum class PipelineStatus(val stage: Int) {
    CREATED(1),
    PENDING(2),
    RUNNING(3),
    SKIPPED(3),
    FINISHING(4),
    SUCCESS(5),
    FAILED(5),
    CANCELED(5),
    ARCHIVED(6),
    OTHER(9);

    companion object {
        fun fromGitlabStatusString(gitlabStatus: String?): PipelineStatus? {
            return when (gitlabStatus?.toLowerCase()) {
                "created" -> CREATED
                "waiting_for_resource", "preparing", "pending", "manual", "scheduled" -> PENDING
                "running" -> RUNNING
                "success" -> SUCCESS
                "failed" -> FAILED
                "canceled" -> CANCELED
                "skipped" -> SKIPPED
                null -> null
                else -> OTHER
            }
        }

        operator fun PublishStatus.compareTo(other: PublishStatus?): Int {
            return this.value.compareTo(other?.value ?: -1)
        }
    }

    fun isActivePipeline(): Boolean {
        return this == CREATED || this == PENDING || this == RUNNING
    }

    fun isDone(): Boolean {
        return this == SUCCESS || this == FAILED || this == CANCELED || this == SKIPPED || this == OTHER
    }

    fun canUpdateTo(next: PipelineStatus): Boolean {
        return next.stage > this.stage || (this == FINISHING && next == RUNNING)
    }
}

operator fun PipelineStatus.compareTo(other: PipelineStatus?): Int {
    return this.stage.compareTo(other?.stage ?: 0)
}

enum class VisibilityScope {
    PRIVATE,
    PUBLIC,
    INTERNAL;

    fun toGitlabString(): String {
        return this.name.toLowerCase()
    }

    companion object {
        fun default(): VisibilityScope = PUBLIC
    }
}

enum class ExperimentStatus(private val stage: Int) {
    CREATED(1),
    PENDING(2),
    RUNNING(3),
    SKIPPED(3),
    SUCCESS(4),
    FAILED(4),
    CANCELED(4),
    ARCHIVED(5);

    fun isDone() {
        this == SUCCESS || this == FAILED
    }

    fun canUpdateTo(next: ExperimentStatus): Boolean {
        return next.stage >= this.stage
    }
}

/**
 * ParameterTypes are typical simple data types.
 * Lists and Objects should be supported, but cannot be interfered in a global scope.
 */
@Deprecated("To be removed")
enum class OldParameterType {
    BOOLEAN,
    STRING,
    INTEGER,
    COMPLEX,
    FLOAT,
    LIST,
    TUPLE,
    DICTIONARY,
    OBJECT,
    UNDEFINED;
}

@Deprecated("To be deleted")
enum class DataProcessorType {
    ALGORITHM,
    OPERATION,
    VISUALIZATION;

    companion object {
        fun default() = ALGORITHM
    }
}

@Deprecated("To be deleted")
enum class OldMetricType {
    RECALL,
    PRECISION,
    F1_SCORE,
    UNDEFINED
}

/**
 * DataTypes describe the Data of a MLDataProject on a higher level.
 * Some DataOperations will support Images, other just EventStreams, Arrays, Matrices or plain Numbers.
 *
 * Note: The singular/plural concept does not apply here, more the high semantic concept of the Machine Learning purpose
 *
 */
@Deprecated("To be deleted")
enum class OldDataType {
    ANY,
    AUDIO,
    BINARY,
    NONE,
    HIERARCHICAL,
    IMAGE,
    TABULAR,
    TEXT,
    TIME_SERIES,
    VIDEO,
    MODEL,
    NUMBER,
}

