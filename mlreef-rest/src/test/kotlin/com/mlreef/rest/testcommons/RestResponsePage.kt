package com.mlreef.rest.testcommons

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import java.util.ArrayList

@JsonIgnoreProperties(ignoreUnknown = true)
internal class RestResponsePage<T> : PageImpl<T> {
    companion object {
        private const val serialVersionUID = 3248189030448292002L
    }

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    constructor(@JsonProperty("content") content: MutableList<T>,
                @JsonProperty("number") number: Int,
                @JsonProperty("size") size: Int,
                @JsonProperty("total_elements") totalElements: Long?,
                @JsonProperty("pageable") pageable: JsonNode?,
                @JsonProperty("total_pages") totalPages: Int?,
                @JsonProperty("sort") sort: JsonNode?,
                @JsonProperty("first") first: Boolean?,
                @JsonProperty("last") last: Boolean?,
                @JsonProperty("empty") empty: Boolean?,
                @JsonProperty("number_of_elements") numberOfElements: Int?) : super(content, PageRequest.of(number, size), totalElements ?: 0L) {
    }

    constructor(content: MutableList<T>, pageable: Pageable, total: Long) : super(content, pageable, total) {}
    constructor(content: MutableList<T>) : super(content) {}
    constructor() : super(ArrayList<T>()) {}
}