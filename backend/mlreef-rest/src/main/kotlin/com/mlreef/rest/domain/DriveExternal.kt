package com.mlreef.rest.domain

import com.mlreef.rest.feature.project.ExternalDriveType
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToMany
import javax.persistence.ManyToOne
import javax.persistence.Table

@Entity
@Table(name = "drives_external")
data class DriveExternal(
    @Id
    @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @Enumerated(EnumType.STRING)
    val driveType: ExternalDriveType,

    val alias: String,

    @Column(name = "region_name")
    val region: String? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    val account: Account,

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "projects_drives_external",
        joinColumns = [JoinColumn(name = "drive_id")],
        inverseJoinColumns = [JoinColumn(name = "project_id")]
    )
    val projects: MutableList<Project> = mutableListOf(),

    @Column(name = "key_1")
    val key1: String? = null,
    @Column(name = "key_2")
    val key2: String? = null,
    @Column(name = "key_3")
    val key3: String? = null,
    @Column(name = "key_4")
    val key4: String? = null,
    @Column(name = "key_5")
    val key5: String? = null,

    val externalId: String? = null,

    val path: String? = null,

    val mask: String? = null,
)