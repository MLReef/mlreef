package com.mlreef.rest.external_api.aws

import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.regions.Regions
import com.amazonaws.services.s3.AmazonS3ClientBuilder
import com.amazonaws.services.s3.model.Bucket

class AwsClient(
    private val accessKey: String,
    private val secretAccessKey: String,
    private val region: String? = null,
) {
    companion object {
        private val S3_PATH_PREFIX = "s3://"

        fun getRegions() = Regions.values().toList()
    }

    private val credentials: BasicAWSCredentials = BasicAWSCredentials(
        accessKey, secretAccessKey
    )

    private val s3Client = AmazonS3ClientBuilder
        .standard()
        .withCredentials(AWSStaticCredentialsProvider(credentials))
        .withRegion(getCurrentRegion())
        .build();

    fun getBuckets(): List<Bucket> {
        return s3Client.listBuckets()
    }

    fun getObjectsKeysInBucket(bucketName: String, startPath: String? = null): List<String> {
        return s3Client.listObjects(bucketName, startPath ?: "").objectSummaries.map { it.key }
    }

    fun parseBucketName(path: String): String {
        return path.removePrefix(S3_PATH_PREFIX).substringBefore("/")
    }

    private fun getCurrentRegion(): Regions {
        return region?.let { Regions.fromName(it) } ?: Regions.DEFAULT_REGION
    }

}