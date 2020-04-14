package com.mlreef.rest

import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.NoRepositoryBean
import java.io.Serializable
import java.util.Optional

/**
 * Copied from https://github.com/systemkern/kommons
 */
@NoRepositoryBean
interface KtCrudRepository<T, ID : Serializable> : CrudRepository<T, ID> {

    override fun existsById(id: ID): Boolean

    override fun findAll(): Iterable<T>

    override fun findAllById(ids: Iterable<ID>): Iterable<T>

    override fun <S : T> save(entity: S): S

    override fun <S : T> saveAll(entities: Iterable<S>): Iterable<S>

    @Deprecated(
        message = "Java Optional is not the preferable way to handle database returns in Kotlin",
        replaceWith = ReplaceWith("CrudRepository.findByIdOrNull(id)")
    )
    override fun findById(id: ID): Optional<T>

    override fun delete(entity: T)

    override fun deleteById(id: ID)

    override fun deleteAll(ids: Iterable<T>)
}

@NoRepositoryBean
interface ReadOnlyRepository<T, ID : Serializable> : CrudRepository<T, ID> {

    override fun existsById(id: ID): Boolean

    override fun findAll(): Iterable<T>

    override fun findAllById(ids: Iterable<ID>): Iterable<T>

    @Deprecated(
        message = "Java Optional is not the preferable way to handle database returns in Kotlin",
        replaceWith = ReplaceWith("CrudRepository.findByIdOrNull(id)")
    )
    override fun findById(id: ID): Optional<T>
}
