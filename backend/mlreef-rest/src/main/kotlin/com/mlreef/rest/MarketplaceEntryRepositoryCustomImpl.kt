package com.mlreef.rest

import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.repository.query.QueryUtils
import java.util.UUID
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext
import javax.persistence.criteria.CriteriaBuilder
import javax.persistence.criteria.CriteriaQuery
import javax.persistence.criteria.Expression
import javax.persistence.criteria.JoinType
import javax.persistence.criteria.Path
import javax.persistence.criteria.Predicate
import javax.persistence.criteria.Root

class ProjectRepositoryCustomImpl() : ProjectRepositoryCustom {

    @PersistenceContext
    private lateinit var entityManager: EntityManager

    override fun <T : Project> findAccessible(
        clazz: Class<T>,
        pageable: Pageable,
        ids: List<UUID>?,
        slugs: List<String>?,
        searchableType: SearchableType,
        inputDataTypes: List<DataType>?,
        outputDataTypes: List<DataType>?,
        tags: List<SearchableTag>?
    ): List<Project> {

        val pageNumber = pageable.pageNumber
        val pageSize = pageable.pageSize
        val builder = entityManager.criteriaBuilder

        val countQuery = builder.createQuery(Long::class.java)
        val countRoot = countQuery.from(clazz)
        val countPredicates = createPredicates(
            builder, countRoot, slugs, searchableType, inputDataTypes, outputDataTypes, tags)

        val entriesQuery: CriteriaQuery<T> = builder.createQuery(clazz)
        val entriesRoot: Root<T> = entriesQuery.from(clazz)

        val entriesPredicates = createPredicates(
            builder, entriesRoot, slugs, searchableType, inputDataTypes, outputDataTypes, tags)

        countQuery.select(builder.count(countRoot)).where(builder.and(*countPredicates.toTypedArray()))
        val countResult = entityManager.createQuery(countQuery).singleResult

        entriesQuery.select(entriesRoot).where(builder.and(*entriesPredicates.toTypedArray()))
        val sortOr = pageable.getSortOr(Sort.by("name"))
        val orders = QueryUtils.toOrders(sortOr, entriesRoot, builder)
        entriesQuery.orderBy(orders)
        val typedQuery = entityManager.createQuery(entriesQuery)

        var firstResultPosition = pageNumber * pageSize

        while (firstResultPosition < countResult) {
            typedQuery.firstResult = firstResultPosition
            typedQuery.maxResults = pageSize
            println("Current page: " + typedQuery.resultList);
            firstResultPosition += pageSize;
        }

        val resultList = typedQuery.resultList
        return resultList
    }

    private fun createPredicates(
        builder: CriteriaBuilder,
        root: Root<out Project>,
        slugs: List<String>?,
        searchableType: SearchableType,
        inputDataTypes: List<DataType>?,
        outputDataTypes: List<DataType>?,
        tags: List<SearchableTag>?
    ): ArrayList<Predicate> {
        val predicates = ArrayList<Predicate>()

        var joinPredicatesOverride = false
        addInClause(builder, slugs, root.get("globalSlug"))?.let { predicates.add(it) }
        if (searchableType == SearchableType.DATA_PROJECT) {
            predicates.add(builder.equal(root.get<ProjectType>("type"), ProjectType.DATA_PROJECT))
        } else {
            predicates.add(builder.equal(root.get<ProjectType>("type"), ProjectType.CODE_PROJECT))

            // in case of CodeProject, join with DataProcessors
            val join = root.join<DataProcessor, CodeProject>("dataProcessor", JoinType.LEFT)
            DataProcessorTypeConverter.from(searchableType)?.let {
                joinPredicatesOverride = true
                predicates.add(builder.equal(join.get<DataProcessorType>("type"), it))
                val dataInputTypes = addEqClauses(inputDataTypes, builder, join.get("inputDataType"))
                val dataOutputTypes = addEqClauses(outputDataTypes, builder, join.get("outputDataType"))
                dataInputTypes?.let { predicates.add(it) }
                dataOutputTypes?.let { predicates.add(it) }
            }
        }

        // OR-Filter now
        if (!joinPredicatesOverride) {
            val dataInputTypes = addListClauses(inputDataTypes, builder, root.get("inputDataTypes"))
            val dataOutputTypes = addListClauses(outputDataTypes, builder, root.get("outputDataTypes"))
            dataInputTypes?.let { predicates.add(it) }
            dataOutputTypes?.let { predicates.add(it) }
        }

        // AND-Filter for Tags now
        tags?.map {
            builder.isMember(it, root.get("tags"))
        }?.let {
            val groupPredicate = builder.and(*it.toTypedArray())
            // decide to use OR or AND for each specific subquery
            predicates.add(groupPredicate)
        }

        return predicates
    }

    private fun addListClauses(
        dataTypes: List<DataType>?,
        builder: CriteriaBuilder,
        path: Expression<MutableCollection<DataType>>
    ): Predicate? {
        return dataTypes?.map {
            builder.isMember(it, path)
        }?.let {
            builder.or(*it.toTypedArray()) // decide to use OR or AND for each specific subquery
        }
    }

    private fun addEqClauses(
        dataTypes: List<DataType>?,
        builder: CriteriaBuilder,
        path: Expression<DataType>
    ): Predicate? {
        return dataTypes?.map {
            builder.equal(path, it)
        }?.let {
            builder.or(*it.toTypedArray()) // decide to use OR or AND for each specific subquery
        }
    }

    private fun <T> addInClause(cb: CriteriaBuilder, list: Collection<T>?, path: Path<T>): CriteriaBuilder.In<T>? {
        return if (list != null && list.isNotEmpty()) {
            val inClause = cb.`in`(path)
            list.forEach { inClause.value(it) }
            inClause
        } else {
            null
        }
    }
}