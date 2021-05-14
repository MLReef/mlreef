package com.mlreef.rest.domain

import java.io.Serializable
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Id
import javax.persistence.MappedSuperclass

@MappedSuperclass
abstract class ListBaseClass(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    open var id: UUID,
    open var name: String,
) : Serializable