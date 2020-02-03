package com.mlreef.rest

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.time.ZonedDateTime
import java.util.*
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
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
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : AuditEntity(id, version, createdAt, updatedAt)

@Entity
@Table(name = "membership")
class Membership(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,
    @Column(name = "person_id")
    val personId: UUID,
    @Column(name = "group_id")
    val groupId: UUID
)

@Entity
class Person(
    id: UUID,
    override val slug: String,
    override val name: String,
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.REMOVE])
    @JoinColumn(name = "person_id")
    @Fetch(value = FetchMode.SUBSELECT)
//    @LazyCollection(LazyCollectionOption.FALSE)
    val memberships: List<Membership> = listOf(),
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : Subject(id, slug, name, version, createdAt, updatedAt) {
    fun copy(
        slug: String? = null,
        name: String? = null,
        memberships: List<Membership>? = null
    ): Person = Person(
        id = this.id,
        slug = slug ?: this.slug,
        name = name ?: this.name,
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
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.REMOVE])
    @JoinColumn(name = "group_id")
    @Fetch(value = FetchMode.SUBSELECT)
//    @LazyCollection(LazyCollectionOption.FALSE)
    val members: List<Membership> = listOf(),
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : Subject(id, slug, name, version, createdAt, updatedAt) {
    fun copy(
        slug: String? = null,
        name: String? = null,
        members: List<Membership>? = null
    ): Group = Group(
        id = this.id,
        slug = slug ?: this.slug,
        name = name ?: this.name,
        members = members ?: this.members,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}
