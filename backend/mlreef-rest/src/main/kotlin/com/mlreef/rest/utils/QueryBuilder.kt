package com.mlreef.rest.utils

import org.hibernate.query.criteria.internal.CriteriaQueryImpl
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import javax.persistence.EntityManager
import javax.persistence.criteria.CriteriaBuilder
import javax.persistence.criteria.CriteriaQuery
import javax.persistence.criteria.Expression
import javax.persistence.criteria.Join
import javax.persistence.criteria.JoinType
import javax.persistence.criteria.Order
import javax.persistence.criteria.Predicate
import javax.persistence.criteria.Root
import javax.persistence.criteria.Selection

class QueryBuilder<T>(
    private val em: EntityManager,
    classOf: Class<T>,
    val strictMode: Boolean = false,
    private val grouping: Boolean = false
) {
    private val builder: CriteriaBuilder
    private val query: CriteriaQuery<T>
    private val queryCount: CriteriaQuery<Long>
    private val groupingQuery: CriteriaQuery<Array<Any>>
    private val from: Root<T>
    private var wherePredicate: Predicate? = null
    private var havingPredicate: Predicate? = null

    private val wherePredicatesList: MutableList<PredicateRecord> = mutableListOf()
    private val havingPredicatesList: MutableList<PredicateRecord> = mutableListOf()

    private var currentPredicateRecord: PredicateRecord? = null
    private var currentLogicOperator: LogicOperator? = null

    private val orderBy = mutableListOf<Order>()

    private val joins: MutableMap<String, Join<*, *>> = mutableMapOf()

    private var isWherePredicates: Boolean = true

    private val currentPredicatesList: MutableList<PredicateRecord>
        get() = if (currentPredicateRecord != null) {
            currentPredicateRecord!!.predicatesList!!
        } else if (isWherePredicates) {
            wherePredicatesList
        } else {
            havingPredicatesList
        }

    private val currentGroupingSelections = mutableListOf<Selection<*>>()
    private val currentGroupingList = mutableListOf<Expression<*>>()


    private var limit: Int? = null
    private var offset: Int? = null

    fun select(distinct: Boolean? = null): List<T> {
        if (grouping) throw RuntimeException("Grouping query builder. Use 'grouping=false' in constructor or selectGrouped() method instead")

        query.select(from)

        distinct?.let { query.distinct(it) }

        buildWherePredicates()

        wherePredicate?.let { query.where(it) }

        if (orderBy.isNotEmpty()) {
            query.orderBy(orderBy)
        }

        val resultQuery = em.createQuery(query)

        limit?.let { resultQuery.maxResults = it }
        offset?.let { resultQuery.firstResult = it }

        return resultQuery.resultList
    }

    fun select(page: Pageable?, distinct: Boolean? = null): Page<T> {
        if (grouping) throw RuntimeException("Grouping query builder. Use 'grouping=false' in constructor or selectGrouped() method instead")

        if (page != null) {
            this.withLimit(page.pageSize)
            this.withOffset(page.pageNumber)
            this.orderBy(page.sort)
        }

        val content = this.select(distinct)
        val pageable = if (page != null) PageRequest.of(page.pageNumber, page.pageSize, page.sort) else Pageable.unpaged()

        return PageImpl<T>(content, pageable, this.count(distinct))
    }

    fun selectGrouped(distinct: Boolean? = null): List<Array<Any>> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor or select() method instead")

        groupingQuery.multiselect(currentGroupingSelections)
        distinct?.let { groupingQuery.distinct(it) }

        buildWherePredicates()
        buildHavingPredicates()

        wherePredicate?.let { groupingQuery.where(it) }

        if (orderBy.isNotEmpty()) {
            groupingQuery.orderBy(orderBy)
        }

        if (currentGroupingList.isNotEmpty()) {
            groupingQuery.groupBy(currentGroupingList)
        }

        havingPredicate?.let { groupingQuery.having(it) }

        val resultQuery = em.createQuery(groupingQuery)

        limit?.let { resultQuery.maxResults = it }
        offset?.let { resultQuery.firstResult = it }

        return resultQuery.resultList
    }

    fun count(distinct: Boolean? = null): Long {
        queryCount.select(if (distinct ?: false) builder.countDistinct(from) else builder.count(from))

        buildWherePredicates()

        wherePredicate?.let { queryCount.where(it) }

        (queryCount as CriteriaQueryImpl).roots.add(from)

        return em.createQuery(queryCount).singleResult
    }

    fun <J> joinLeft(field: String, joinedAlias: String? = null, alias: String? = null): QueryBuilder<T> {
        joins[alias ?: field] = if (joinedAlias != null)
            joins[joinedAlias]?.join<J, T>(field, JoinType.LEFT)
                ?: throw RuntimeException("Join with name $joinedAlias was not found")
        else from.join<J, T>(field, JoinType.LEFT)

        return this
    }

    fun <J> joinInner(field: String, joinedAlias: String? = null, alias: String? = null): QueryBuilder<T> {
        joins[alias ?: field] = if (joinedAlias != null)
            joins[joinedAlias]?.join<J, T>(field, JoinType.INNER)
                ?: throw RuntimeException("Join with name $joinedAlias was not found")
        else from.join<J, T>(field, JoinType.INNER)

        return this
    }

    @Deprecated("Doesn't suppert by Hibernate")
    fun <J> joinRight(field: String, joinedAlias: String? = null, alias: String? = null): QueryBuilder<T> {
        joins[alias ?: field] = if (joinedAlias != null)
            joins[joinedAlias]?.join<J, T>(field, JoinType.RIGHT)
                ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.join<J, T>(field, JoinType.RIGHT)

        return this
    }

    fun withLimit(limit: Int): QueryBuilder<T> {
        this.limit = limit
        return this
    }

    fun withOffset(offset: Int): QueryBuilder<T> {
        this.offset = offset
        return this
    }

    fun orderBy(fieldsList: List<String>): QueryBuilder<T> {
        for (field in fieldsList) {
            orderBy(field)
        }
        return this
    }

    fun orderBy(field: String): QueryBuilder<T> {
        if (field.startsWith("-")) {
            orderBy.add(builder.desc(from.get<Any>(field.substring(1))))
        } else {
            orderBy.add(builder.asc(from.get<Any>(field)))
        }
        return this
    }

    fun orderBy(sort: Sort) {
        if (sort.isUnsorted) return
        sort.forEach {
            if (it.isAscending) this.ascOrderBy(it.property)
            else this.descOrderBy(it.property)
        }
    }

    fun ascOrderBy(field: String): QueryBuilder<T> {
        orderBy.add(builder.asc(from.get<Any>(field)))
        return this
    }

    fun descOrderBy(field: String): QueryBuilder<T> {
        orderBy.add(builder.desc(from.get<Any>(field)))
        return this
    }

    //################################################################################################################//
    //                                        Where-Having switchers                                                  //
    //################################################################################################################//

    fun where(): QueryBuilder<T> {
        isWherePredicates = true

        return this
    }

    fun having(): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor or where() method instead")

        isWherePredicates = false

        return this
    }

    //################################################################################################################//
    //                                                Brackets                                                        //
    //################################################################################################################//

    fun openBracket(): QueryBuilder<T> {
        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                predicatesList = mutableListOf(),
                parent = currentPredicateRecord
            )
        )
        currentPredicateRecord = currentPredicatesList.last()
        currentLogicOperator = null
        return this
    }

    fun closeBracket(): QueryBuilder<T> {
        currentPredicateRecord = currentPredicateRecord?.parent
        currentLogicOperator = null
        return this
    }

    //################################################################################################################//
    //                                            Logical functions                                                   //
    //################################################################################################################//

    fun and(): QueryBuilder<T> {
        if (currentPredicatesList.size == 0 && strictMode)
            throw RuntimeException("Starting with logic operator is not allowed in Strict Mode")

        if (currentLogicOperator != null && strictMode)
            throw RuntimeException("Already has a trailing logic operator ${currentLogicOperator!!.name}")

        currentLogicOperator = if (currentPredicatesList.size > 0) LogicOperator.AND else currentLogicOperator
        return this
    }

    fun or(): QueryBuilder<T> {
        if (currentPredicatesList.size == 0 && strictMode)
            throw RuntimeException("Starting with logic operator is not allowed in Strict Mode")

        if (currentLogicOperator != null && strictMode)
            throw RuntimeException("Already has a trailing logic operator ${currentLogicOperator!!.name}")

        currentLogicOperator = if (currentPredicatesList.size > 0) LogicOperator.OR else currentLogicOperator
        return this
    }

    //################################################################################################################//
    //                                        Where or Having functions                                               //
    //################################################################################################################//

    fun equals(field: String, value: Any, joinedAlias: String? = null, caseSensitive: Boolean = true): QueryBuilder<T> {
        checkPredicateIsAllowed()

        val predicate = if (caseSensitive) {
            val ex: Expression<*> = if (joinedAlias != null)
                joins[joinedAlias]?.get<Any>(field)
                    ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
            else from.get<Any>(field)

            builder.equal(ex, value)
        } else {
            val ex: Expression<String> = if (joinedAlias != null)
                joins[joinedAlias]?.get<String>(field)
                    ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
            else from.get<String>(field)

            builder.equal(builder.lower(ex), value.toString().toLowerCase())
        }

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                predicate
            )
        )

        currentLogicOperator = null
        return this
    }

    fun isNull(field: String, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        val ex: Expression<*> = if (joinedAlias != null)
            joins[joinedAlias]?.get<Any>(field)
                ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.get<Any>(field)

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                builder.isNull(ex)
            )
        )

        currentLogicOperator = null
        return this
    }

    fun isNotNull(field: String, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        val ex: Expression<*> = if (joinedAlias != null)
            joins[joinedAlias]?.get<Any>(field)
                ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.get<Any>(field)

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                builder.isNotNull(ex)
            )
        )

        currentLogicOperator = null
        return this
    }

    fun <V> `in`(field: String, values: Collection<V>, joinedAlias: String? = null, caseSensitive: Boolean = true): QueryBuilder<T> {
        checkPredicateIsAllowed()

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                buildInSubPredicate(field, values, joinedAlias, caseSensitive)
            )
        )

        currentLogicOperator = null
        return this
    }

    fun <V> contains(field: String, value: V, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        val expression: Expression<Collection<V>> = if (joinedAlias != null)
            joins[joinedAlias]?.get(field) ?: throw RuntimeException("Join with name $joinedAlias was not found")
        else from.get(field)

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                builder.isMember(value, expression)
            )
        )

        currentLogicOperator = null
        return this
    }

    fun <V> containsAll(field: String, values: Collection<V>, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        if (values.isNotEmpty()) {
            this.openBracket()
            values.forEach { this.contains(field, it, joinedAlias).and() }
            this.closeBracket()
        }

        currentLogicOperator = null
        return this
    }

    fun <V> containsAny(field: String, values: Collection<V>, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        if (values.isNotEmpty()) {
            this.openBracket()
            values.forEach { this.contains(field, it, joinedAlias).or() }
            this.closeBracket()
        }

        currentLogicOperator = null
        return this
    }

    fun <V> notContains(field: String, value: V, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        val expression: Expression<Collection<V>> = if (joinedAlias != null)
            joins[joinedAlias]?.get(field) ?: throw RuntimeException("Join with name $joinedAlias was not found")
        else from.get(field)

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                builder.isNotMember(value, expression)
            )
        )

        currentLogicOperator = null
        return this
    }

    fun <V : Comparable<V>> greaterThan(field: String, value: V, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                buildCompareSubPredicate(field, value, true, false, joinedAlias)
            )
        )

        currentLogicOperator = null
        return this
    }

    fun <V : Comparable<V>> greaterOrEqualThan(field: String, value: V, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                buildCompareSubPredicate(field, value, true, true, joinedAlias)
            )
        )

        currentLogicOperator = null
        return this
    }

    fun <V : Comparable<V>> lessThan(field: String, value: V, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                buildCompareSubPredicate(field, value, false, false, joinedAlias)
            )
        )

        currentLogicOperator = null
        return this
    }

    fun <V : Comparable<V>> lessOrEqualThan(field: String, value: V, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                buildCompareSubPredicate(field, value, false, true, joinedAlias)
            )
        )

        currentLogicOperator = null
        return this
    }

    fun <V : Comparable<V>> between(field: String, value1: V, value2: V, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                buildBetweenSubPredicate(field, value1, value2, joinedAlias)
            )
        )

        currentLogicOperator = null
        return this
    }

    fun like(field: String, value: Any, caseSensitive: Boolean = true, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        val ex: Expression<String> = if (joinedAlias != null)
            joins[joinedAlias]?.get(field) ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.get(field)

        val str = value as? String ?: value.toString()

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                if (caseSensitive) builder.like(ex, str) else builder.like(builder.lower(ex), str.toLowerCase())
            )
        )

        currentLogicOperator = null

        return this
    }

    //################################################################################################################//
    //                                             Grouping functions                                                 //
    //################################################################################################################//

    fun groupBy(field: String, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex: Expression<*> = if (joinedAlias != null)
            joins[joinedAlias]?.get<Any>(field)
                ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.get<Any>(field)

        currentGroupingList.add(ex)
        currentGroupingSelections.add(ex)

        return this
    }

    fun <N : Number> max(field: String, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex: Expression<N> = if (joinedAlias != null)
            joins[joinedAlias]?.get<N>(field)
                ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.get<N>(field)

        currentGroupingSelections.add(builder.max(ex))

        return this
    }

    fun <N : Number> min(field: String, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex: Expression<N> = if (joinedAlias != null)
            joins[joinedAlias]?.get<N>(field)
                ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.get<N>(field)

        currentGroupingSelections.add(builder.min(ex))

        return this
    }

    fun <N : Number> avg(field: String, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex: Expression<N> = if (joinedAlias != null)
            joins[joinedAlias]?.get<N>(field)
                ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.get<N>(field)

        currentGroupingSelections.add(builder.avg(ex))

        return this
    }

    fun <N : Number> sum(field: String, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex: Expression<N> = if (joinedAlias != null)
            joins[joinedAlias]?.get<N>(field)
                ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.get<N>(field)

        currentGroupingSelections.add(builder.sum(ex))

        return this
    }

    fun count(field: String, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex: Expression<*> = if (joinedAlias != null)
            joins[joinedAlias]?.get<Any>(field)
                ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.get<Any>(field)

        currentGroupingSelections.add(builder.count(ex))

        return this
    }

    //################################################################################################################//

    private fun checkPredicateIsAllowed() {
        if (currentPredicatesList.size > 0 && currentLogicOperator == null)
            throw RuntimeException("No logic operator")
    }

    private fun buildWherePredicates() {
        if (wherePredicate != null) return

//        if (currentPredicateRecord != null) throw RuntimeException("Bracket(s) were not closed")
//        if (currentLogicOperator != null) throw  RuntimeException("Logic operator (and/or) is not closed by argument")

        wherePredicate = buildPredicateFromList(wherePredicatesList)
    }

    private fun buildHavingPredicates() {
        if (havingPredicate != null) return

//        if (currentPredicateRecord != null) throw RuntimeException("Bracket(s) were not closed")
//        if (currentLogicOperator != null) throw  RuntimeException("Logic operator (and/or) is not closed by argument")

        havingPredicate = buildPredicateFromList(havingPredicatesList)
    }

    private fun buildPredicateFromList(predicatesList: List<PredicateRecord>): Predicate? {
        var predicate: Predicate? = null

        predicatesList.forEach {
            val currentPredicate = if (it.predicatesList != null) {
                buildPredicateFromList(it.predicatesList)
            } else {
                it.predicate
            }

            predicate = if (predicate == null) {
                currentPredicate
            } else if (currentPredicate != null) {
                when (it.operator) {
                    LogicOperator.OR -> builder.or(predicate, currentPredicate)
                    LogicOperator.AND -> builder.and(predicate, currentPredicate)
                    else -> throw RuntimeException("Incorrect logic connection")
                }
            } else {
                predicate
            }
        }

        return predicate
    }

    private fun <V : Comparable<V>> buildBetweenSubPredicate(key: String, value1: V, value2: V, joinedAlias: String?): Predicate {
        val expression: Expression<V> = if (joinedAlias != null)
            joins[joinedAlias]?.get<V>(key) ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.get<V>(key)

        return builder.between<V>(expression, value1, value2)
    }

    private fun <V : Comparable<V>> buildCompareSubPredicate(key: String, value: V, greater: Boolean, equal: Boolean, joinedAlias: String?): Predicate {
        val expression: Expression<V> = if (joinedAlias != null)
            joins[joinedAlias]?.get<V>(key) ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.get<V>(key)

        return when {
            greater && equal -> builder.greaterThanOrEqualTo(expression, value)
            greater && !equal -> builder.greaterThan(expression, value)
            !greater && equal -> builder.lessThanOrEqualTo(expression, value)
            !greater && !equal -> builder.lessThan(expression, value)
            else -> throw RuntimeException()
        }
    }

    private fun <V> buildInSubPredicate(key: String, values: Collection<V>, joinedAlias: String?, caseSensitive: Boolean): Predicate {
        return if (caseSensitive) {
            val expression: Expression<V> = if (joinedAlias != null)
                joins[joinedAlias]?.get(key) ?: throw RuntimeException("Join with name $joinedAlias was not found")
            else from.get(key)

            val inPredicate = builder.`in`(expression)

            values.forEach {
                inPredicate.value(it)
            }

            inPredicate
        } else {
            val expression: Expression<String> = if (joinedAlias != null)
                joins[joinedAlias]?.get(key) ?: throw RuntimeException("Join with name $joinedAlias was not found")
            else from.get(key)

            val inPredicate = builder.`in`(builder.lower(expression))

            values.forEach {
                inPredicate.value((it as String).toLowerCase())
            }

            inPredicate
        }
    }

    private enum class LogicOperator {
        AND,
        OR;
    }

    private data class PredicateRecord(
        val operator: LogicOperator? = null,
        val predicate: Predicate? = null,
        val predicatesList: MutableList<PredicateRecord>? = null,
        val parent: PredicateRecord? = null
    )

    init {
        builder = em.criteriaBuilder
        query = builder.createQuery(classOf)
        queryCount = builder.createQuery(Long::class.java)
        groupingQuery = builder.createQuery(Array<Any>::class.java)
        from = if (grouping) groupingQuery.from(classOf) else query.from(classOf)
    }
}