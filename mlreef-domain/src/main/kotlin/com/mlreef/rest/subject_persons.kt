package com.mlreef.rest

import com.mlreef.converters.AccessLevelConverter
import com.mlreef.rest.helpers.GroupOfUser
import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Convert
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.ForeignKey
import javax.persistence.Id
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.JoinColumn
import javax.persistence.OneToMany
import javax.persistence.Table

@Table(name = "subject")
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
abstract class Subject(
    id: UUID,
    val slug: String,
    val name: String,
    @Column(name = "gitlab_id")
    val gitlabId: Long?,
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : AuditEntity(id, version, createdAt, updatedAt)

@Entity
@Table(name = "membership")
// This is a speculative Entity, based on early ideas.
// It most probably needs to be refactored when implementing new features
class Membership(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,
    @Column(name = "person_id")
    val personId: UUID,
    @Column(name = "group_id")
    val groupId: UUID,

    @Column(name = "access_level")
    @Convert(converter = AccessLevelConverter::class)
    val accessLevel: AccessLevel?
) {
    fun copy(accessLevel: AccessLevel?): Membership =
        Membership(this.id, this.personId, this.groupId, accessLevel)
}

@Entity
class Person(
    id: UUID,
    override val slug: String,
    override val name: String,
    override val gitlabId: Long?,
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.REMOVE])
    @JoinColumn(
        name = "person_id",
        foreignKey = ForeignKey(name = "membership_person_person_id_fkey")
    )
    @Fetch(value = FetchMode.SUBSELECT)
//    @LazyCollection(LazyCollectionOption.FALSE)
    val memberships: List<Membership> = listOf(),
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : Subject(id, slug, name, gitlabId, version, createdAt, updatedAt) {
    fun copy(
        slug: String? = null,
        name: String? = null,
        memberships: List<Membership>? = null
    ): Person = Person(
        id = this.id,
        slug = slug ?: this.slug,
        name = name ?: this.name,
        gitlabId = gitlabId,
        memberships = memberships ?: this.memberships,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

@Entity
class Group(
    id: UUID,
    override val slug: String,
    override val name: String,
    override val gitlabId: Long?,
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.REMOVE])
    @JoinColumn(
        name = "group_id",
        foreignKey = ForeignKey(name = "membership_group_group_id_fkey")
    )
    @Fetch(value = FetchMode.SUBSELECT)
//    @LazyCollection(LazyCollectionOption.FALSE)
    val members: List<Membership> = listOf(),
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : Subject(id, slug, name, gitlabId, version, createdAt, updatedAt) {
    fun copy(
        slug: String? = null,
        name: String? = null,
        members: List<Membership>? = null
    ): Group = Group(
        id = this.id,
        slug = slug ?: this.slug,
        name = name ?: this.name,
        gitlabId = gitlabId,
        members = members ?: this.members,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )


    fun toGroupOfUser(accessLevel: AccessLevel?) = GroupOfUser(
        this.id,
        this.gitlabId,
        this.name,
        accessLevel
    )
}
