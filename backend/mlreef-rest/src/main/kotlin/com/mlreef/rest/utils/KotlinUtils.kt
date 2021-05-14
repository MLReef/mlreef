package com.mlreef.rest.utils

public infix fun <K, V, A : Pair<K, V>, B> A.too(that: B): Triple<K, V, B> = Triple(this.first, this.second, that)