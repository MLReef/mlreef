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
import javax.persistence.criteria.Path
import javax.persistence.criteria.Predicate
import javax.persistence.criteria.Root
import javax.persistence.criteria.Selection
import javax.persistence.criteria.Subquery

class QueryBuilder<T> private constructor(
    val classOf: Class<T>,
    val strictMode: Boolean = false,
    val grouping: Boolean = false
) {
    private lateinit var em: EntityManager

    private lateinit var builder: CriteriaBuilder
    private lateinit var query: CriteriaQuery<T>
    private lateinit var queryCount: CriteriaQuery<Long>
    private lateinit var subquery: Subquery<Any>
    private lateinit var groupingQuery: CriteriaQuery<Array<Any>>
    private lateinit var from: Root<T>

    private var wherePredicate: Predicate? = null
    private var havingPredicate: Predicate? = null

    private val wherePredicatesList: MutableList<PredicateRecord> = mutableListOf()
    private val havingPredicatesList: MutableList<PredicateRecord> = mutableListOf()

    private var currentPredicateRecord: PredicateRecord? = null
    private var currentLogicOperator: LogicOperator? = null

    private val orderBy = mutableListOf<Order>()

    private val joins: MutableMap<String, Join<*, *>> = mutableMapOf()

    private val subselects: MutableMap<String, QueryBuilder<*>> = mutableMapOf()

    private var isWherePredicates: Boolean = true

    private var isDistinct: Boolean? = null
    private var isSubSelect: Boolean = false

    //For subqueries as they should return a single field. If it's null then the first value from grouping expressions will be taken
    private var singleFieldSelect: String? = null

    constructor(
        em: EntityManager,
        classOf: Class<T>,
        strictMode: Boolean = false,
        grouping: Boolean = false
    ) : this(classOf, strictMode, grouping) {
        this.em = em
        builder = em.criteriaBuilder
        query = builder.createQuery(classOf)
        queryCount = builder.createQuery(Long::class.java)
        groupingQuery = builder.createQuery(Array<Any>::class.java)
        from = if (grouping) groupingQuery.from(classOf) else query.from(classOf)
    }

    private constructor(
        subquery: Subquery<Any>,
        builder: CriteriaBuilder,
        classOf: Class<T>,
        singleFieldSelect: String?,
        strictMode: Boolean = false,
        grouping: Boolean = false,
    ) : this(classOf, strictMode, grouping) {
        this.builder = builder
        this.subquery = subquery
        from = this.subquery.from(classOf)
        isSubSelect = true
        this.singleFieldSelect = singleFieldSelect
    }

    private val currentPredicatesList: MutableList<PredicateRecord>
        get() = if (currentPredicateRecord != null) {
            currentPredicateRecord!!.predicatesList!!
        } else if (isWherePredicates) {
            wherePredicatesList
        } else {
            havingPredicatesList
        }

    private val currentFrom: Root<*>
        get() = if (isSubSelect) {
            from
        } else {
            from
        }

    private val currentGroupingSelections = mutableMapOf<String, Selection<*>>()
    private val currentGroupingList = mutableListOf<Expression<*>>()

    private var limit: Int? = null
    private var offset: Int? = null

    fun select(distinct: Boolean? = null): List<T> {
        if (grouping) throw RuntimeException("Grouping query builder. Use 'grouping=false' in constructor or selectGrouped() method instead")

        prepareSelect(distinct ?: isDistinct)

        val resultQuery = em.createQuery(query)

        limit?.let { resultQuery.maxResults = it }
        offset?.let { resultQuery.firstResult = it }

        return resultQuery.resultList
    }

    fun select(page: Pageable?, distinct: Boolean? = null): Page<T> {
        if (grouping) throw RuntimeException("Grouping query builder. Use 'grouping=false' in constructor or selectGrouped() method instead")

        page?.takeIf { it.isPaged }?.let {
            this.withLimit(it.pageSize)
            this.withOffset(it.pageNumber * it.pageSize)
            this.orderBy(it.sort)
        }

        val content = this.select(distinct)

        val pageable = page?.takeIf { it.isPaged }?.let {
            PageRequest.of(it.pageNumber, it.pageSize, it.sort)
        } ?: Pageable.unpaged()

        return PageImpl<T>(content, pageable, this.count(distinct))
    }

    fun selectGrouped(distinct: Boolean? = null): List<Array<Any>> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor or select() method instead")

        prepareGroupedSelect(distinct ?: isDistinct)

        val resultQuery = em.createQuery(groupingQuery)

        limit?.let { resultQuery.maxResults = it }
        offset?.let { resultQuery.firstResult = it }

        return resultQuery.resultList
    }

    private fun prepare(distinct: Boolean?) {
        if (grouping) prepareGroupedSelect(distinct) else prepareSelect(distinct)
    }

    private fun prepareSelect(distinct: Boolean?) {
        subselects.forEach {
            it.value.prepareSubSelect()
        }

        query.select(from)

        distinct?.let { query.distinct(it) }

        buildWherePredicates()
        buildOrderBy()
    }

    private fun prepareGroupedSelect(distinct: Boolean?) {
        subselects.forEach {
            it.value.prepareSubSelect()
        }

        groupingQuery.multiselect(currentGroupingSelections.values.toList())
        distinct?.let { groupingQuery.distinct(it) }

        buildWherePredicates()
        buildHavingPredicates()
        buildOrderBy()

        if (currentGroupingList.isNotEmpty()) {
            groupingQuery.groupBy(currentGroupingList)
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun prepareSubSelect() {
        subquery.select(
            singleFieldSelect?.let { getExpressionByPath<Any>(it, null) }
                ?: currentGroupingSelections.map { it.value as Expression<Any> }.first()
        )
        isDistinct?.let { subquery.distinct(it) }
        buildWherePredicates()
        buildHavingPredicates()
        if (currentGroupingList.isNotEmpty()) {
            subquery.groupBy(currentGroupingList)
        }
    }

    fun count(distinct: Boolean? = null): Long {
        queryCount.select(if (distinct ?: isDistinct ?: false) builder.countDistinct(from) else builder.count(from))

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

    fun <J> joinList(field: String, joinedAlias: String? = null, alias: String? = null): QueryBuilder<T> {
        joins[alias ?: field] = if (joinedAlias != null) {
            joins[joinedAlias]?.joinList<J, T>(field)
                ?: throw RuntimeException("Join with name $joinedAlias was not found")
        } else {
            from.joinList<T, J>(field)
        }

        return this
    }

    @Deprecated("Is not supported by Hibernate")
    fun <J> joinRight(field: String, joinedAlias: String? = null, alias: String? = null): QueryBuilder<T> {
        joins[alias ?: field] = if (joinedAlias != null)
            joins[joinedAlias]?.join<J, T>(field, JoinType.RIGHT)
                ?: throw RuntimeException("Join with name/alias $joinedAlias was not found")
        else from.join<J, T>(field, JoinType.RIGHT)

        return this
    }

    fun <R : Any, S> subSelect(
        singleFieldSelect: String? = null,
        resultClassOf: Class<R>,
        subSelectEntity: Class<S>,
        alias: String,
        grouping: Boolean = false,
    ): QueryBuilder<S> {
        val subquery = query.subquery(Any::class.java)

        val subSelect = QueryBuilder(subquery, builder, subSelectEntity, singleFieldSelect, strictMode, grouping)

        subselects[alias] = subSelect

        return subSelect
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

    fun distinct(distinct: Boolean = true): QueryBuilder<T> {
        isDistinct = distinct
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
            val ex = getExpressionByPath<Any>(field, joinedAlias)
            builder.equal(ex, value)
        } else {
            val ex = getExpressionByPath<String>(field, joinedAlias)
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

        val ex = getExpressionByPath<Any>(field, joinedAlias)

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

        val ex = getExpressionByPath<Any>(field, joinedAlias)

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                builder.isNotNull(ex)
            )
        )

        currentLogicOperator = null
        return this
    }

    // For one-to-many (single value field in some collection)
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

    // Add sub query with a single field in result
    fun <V> `in`(field: String, subqueryAlias: String, joinedAlias: String? = null, caseSensitive: Boolean = true): QueryBuilder<T> {
        checkPredicateIsAllowed()

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                buildInSubqueryPredicate<V>(field, joinedAlias, subqueryAlias, caseSensitive)
            )
        )

        currentLogicOperator = null
        return this
    }

    // For one-to-many (single value field in some collection)
    fun <V> notIn(field: String, values: Collection<V>, joinedAlias: String? = null, caseSensitive: Boolean = true): QueryBuilder<T> {
        checkPredicateIsAllowed()

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                buildInSubPredicate(field, values, joinedAlias, caseSensitive, not = true)
            )
        )

        currentLogicOperator = null
        return this
    }

    // Add sub query with a single field in result
    fun <V> notIn(field: String, subqueryAlias: String, joinedAlias: String? = null, caseSensitive: Boolean = true): QueryBuilder<T> {
        checkPredicateIsAllowed()

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                buildInSubqueryPredicate<V>(field, joinedAlias, subqueryAlias, caseSensitive, not = true)
            )
        )

        currentLogicOperator = null
        return this
    }

    // For many-to-one (multiple values field (child table) has some single value)
    fun <V> contains(field: String, value: V, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        val expression = getExpressionByPath<Collection<V>>(field, joinedAlias)

        currentPredicatesList.add(
            PredicateRecord(
                currentLogicOperator,
                builder.isMember(value, expression)
            )
        )

        currentLogicOperator = null
        return this
    }

    // For many-to-many (multiple values field (child table) has all multiple values)
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

    // For many-to-many (multiple values field (child table) has any of multiple values)
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

    // For many-to-many (multiple values field (child table) has any of multiple values)
    fun <V> notContainsAny(field: String, values: Collection<V>, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        if (values.isNotEmpty()) {
            this.openBracket()
            values.forEach { this.notContains(field, it, joinedAlias).and() }
            this.closeBracket()
        }

        currentLogicOperator = null
        return this
    }

    fun <V> notContains(field: String, value: V, joinedAlias: String? = null): QueryBuilder<T> {
        checkPredicateIsAllowed()

        val expression = getExpressionByPath<Collection<V>>(field, joinedAlias)

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

        val ex = getExpressionByPath<String>(field, joinedAlias)

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

    fun groupBy(field: String, alias: String? = null, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex = getExpressionByPath<Any>(field, joinedAlias)

        currentGroupingList.add(ex)
        currentGroupingSelections.put(alias ?: field, ex)

        return this
    }

    fun <N : Number> max(field: String, alias: String? = null, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex = getExpressionByPath<N>(field, joinedAlias)

        currentGroupingSelections.put(alias ?: "max_$field", builder.max(ex))

        return this
    }

    fun <N : Number> min(field: String, alias: String? = null, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex = getExpressionByPath<N>(field, joinedAlias)

        currentGroupingSelections.put(alias ?: "min_$field", builder.min(ex))

        return this
    }

    fun <N : Number> avg(field: String, alias: String? = null, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex = getExpressionByPath<N>(field, joinedAlias)

        currentGroupingSelections.put(alias ?: "avg_$field", builder.avg(ex))

        return this
    }

    fun <N : Number> sum(field: String, alias: String? = null, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex = getExpressionByPath<N>(field, joinedAlias)

        currentGroupingSelections.put(alias ?: "sum_$field", builder.sum(ex))

        return this
    }

    fun count(field: String, alias: String? = null, joinedAlias: String? = null): QueryBuilder<T> {
        if (!grouping) throw RuntimeException("Not grouping query builder. Use 'grouping=true' in constructor")

        val ex = getExpressionByPath<Any>(field, joinedAlias)

        currentGroupingSelections.put(alias ?: "count_$field", builder.count(ex))

        return this
    }

    //################################################################################################################//

    private fun checkPredicateIsAllowed() {
        if (currentPredicatesList.size > 0 && currentLogicOperator == null)
            throw RuntimeException("No logic operator")
    }

    private fun buildOrderBy() {
        if (orderBy.isNotEmpty()) {
            if (grouping) {
                groupingQuery.orderBy(orderBy)
            } else {
                query.orderBy(orderBy)
            }
        }
    }

    private fun buildWherePredicates() {
        if (wherePredicate != null) return

        wherePredicate = buildPredicateFromList(wherePredicatesList)

        wherePredicate?.let {
            if (isSubSelect) {
                subquery.where(it)
            } else if (grouping) {
                groupingQuery.where(it)
            } else {
                query.where(it)
            }
        }
    }

    private fun buildHavingPredicates() {
        if (havingPredicate != null) return

        havingPredicate = buildPredicateFromList(havingPredicatesList)

        havingPredicate?.let {
            if (isSubSelect) {
                subquery.having(it)
            } else {
                groupingQuery.having(it)
            }
        }
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
        val expression = getExpressionByPath<V>(key, joinedAlias)
        return builder.between<V>(expression, value1, value2)
    }

    private fun <V : Comparable<V>> buildCompareSubPredicate(key: String, value: V, greater: Boolean, equal: Boolean, joinedAlias: String?): Predicate {
        val expression = getExpressionByPath<V>(key, joinedAlias)

        return when {
            greater && equal -> builder.greaterThanOrEqualTo(expression, value)
            greater && !equal -> builder.greaterThan(expression, value)
            !greater && equal -> builder.lessThanOrEqualTo(expression, value)
            !greater && !equal -> builder.lessThan(expression, value)
            else -> throw RuntimeException()
        }
    }

    private fun <V> buildInSubPredicate(key: String, values: Collection<V>, joinedAlias: String?, caseSensitive: Boolean, not: Boolean = false): Predicate {
        val inPredicate = if (caseSensitive) {
            val expression = getExpressionByPath<V>(key, joinedAlias)

            val predicate = builder.`in`(expression)

            values.forEach {
                predicate.value(it)
            }

            predicate
        } else {
            val expression = getExpressionByPath<String>(key, joinedAlias)

            val predicate = builder.`in`(builder.lower(expression))

            values.forEach {
                predicate.value((it as String).toLowerCase())
            }

            predicate
        }

        return if (not) inPredicate.not() else inPredicate
    }

    @Suppress("UNCHECKED_CAST")
    private fun <V> buildInSubqueryPredicate(fieldName: String, joinedAlias: String?, subqueryAlias: String, caseSensitive: Boolean, not: Boolean = false): Predicate {
        val inPredicate = if (caseSensitive) {
            val fieldExpression = getExpressionByPath<V>(fieldName, joinedAlias)
            val subquery = subselects[subqueryAlias]?.subquery as Subquery<V>? ?: throw RuntimeException("Subselect $subqueryAlias not found")

            builder.`in`(fieldExpression).value(subquery)
        } else {
            val fieldExpression = getExpressionByPath<String>(fieldName, joinedAlias)
            val subquery = subselects[subqueryAlias]?.subquery as Subquery<String>? ?: throw RuntimeException("Subselect $subqueryAlias not found")

            builder.`in`(builder.lower(fieldExpression)).value(subquery)
        }

        return if (not) inPredicate.not() else inPredicate
    }

    private fun <Y> getExpressionByPath(path: String, joinedAlias: String?): Expression<Y> {
        val paths = path.split(".")

        if (paths.isEmpty()) {
            throw IllegalArgumentException("Incorrect path $path")
        } else if (paths.size == 1) {
            return getExpression(paths[0], joinedAlias)
        } else {
            var currentPath: Path<Y>? = null
            for (i in 0..paths.size - 2) {
                currentPath = getPath(paths[i], joinedAlias, currentPath)
            }
            return getExpression(paths.last(), joinedAlias, currentPath)
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun <Y> getExpression(key: String, joinedAlias: String?, path: Path<Y>? = null): Expression<Y> {
        return path?.get(key)
            ?: if (joinedAlias != null) {
                joins[joinedAlias]?.get(key)
//                    ?: subqueries[joinedAlias]?.first?.get(key)
                    ?: throw RuntimeException("Join with name $joinedAlias was not found")
            } else {
                currentGroupingSelections[key] as? Expression<Y>? ?: currentFrom.get(key)
            }
    }

    private fun <Y> getPath(key: String, joinedAlias: String?, path: Path<Y>? = null): Path<Y> {
        return path?.get(key)
            ?: if (joinedAlias != null) {
                joins[joinedAlias]?.get(key)
//                    ?: subqueries[joinedAlias]?.first?.get(key)
                    ?: throw RuntimeException("Join with name $joinedAlias was not found")
            } else {
                currentFrom.get(key)
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
}