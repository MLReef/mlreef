package com.mlreef.domain.entities
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.NoRepositoryBean
import java.io.Serializable
import java.util.*

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
            replaceWith = ReplaceWith("com.systemkern.kommons.KtCrudRepository.findById2(id)")
    )
    override fun findById(id: ID): Optional<T>

    override fun delete(entity: T)

    override fun deleteById(id: ID)

    override fun deleteAll(ids: Iterable<T>)

}

/**
 * unwraps the optional returned by findById to either the entity or null
 * @see CrudRepository.findById
 */
@Suppress("DEPRECATION")
fun <T, ID : Serializable> KtCrudRepository<T, ID>.findById2(id: ID): T? =
        findById(id).orElse(null)

/**
 * @throws IllegalArgumentException if no entity can be found
 */
@Suppress("DEPRECATION")
inline fun <reified T, ID : Serializable> KtCrudRepository<T, ID>.getById(id: ID): T =
        this.findById(id).orElse(null)
                ?: throw IllegalArgumentException("Could not find ${T::class.qualifiedName} with id $id")
