package com.mlreef.rest.utils

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.ChronoUnit
import java.util.Date

fun Instant.resetSecondsToZero(): Instant {
    return this.truncatedTo(ChronoUnit.MINUTES)
}

fun Instant.resetTimeToZero(): Instant {
    return this.truncatedTo(ChronoUnit.DAYS)
}

fun Instant.endOfDay(): Instant {
    return this.resetTimeToZero()
        .plus(23, ChronoUnit.HOURS)
        .plus(59, ChronoUnit.MINUTES)
        .plusSeconds(59)
        .plusMillis(999)
}

fun Instant.startOfDay(): Instant {
    return this.resetTimeToZero()
}

fun Instant.toDate(): Date {
    return Date.from(this)
}

fun Instant.toLocalDate(): LocalDate {
    return this.atZone(ZoneId.of("UTC")).toLocalDate()
}

fun LocalDate.toInstant(): Instant {
    return this.atStartOfDay(ZoneId.of("UTC")).toInstant()
}

fun Instant.dayOfWeek(): Int {
    return this.toLocalDate().dayOfWeek.value
}

fun Instant.minusDays(days: Long): Instant {
    return this.minusSeconds(60L * 60L * 24L * days)
}

fun Instant.minusDays(days: Int): Instant {
    return this.minusSeconds(60L * 60L * 24L * days)
}

fun Instant.plusDays(days: Long): Instant {
    return this.plusSeconds(60L * 60L * 24L * days)
}

fun Instant.plusDays(days: Int): Instant {
    return this.plusSeconds(60L * 60L * 24L * days)
}

fun Instant.minusHours(hours: Long): Instant {
    return this.minusSeconds(60L * 60L * hours)
}

fun Instant.minusHours(hours: Int): Instant {
    return this.minusSeconds(60L * 60L * hours)
}

fun Instant.plusHours(hours: Long): Instant {
    return this.plusSeconds(60L * 60L * hours)
}

fun Instant.plusHours(hours: Int): Instant {
    return this.plusSeconds(60L * 60L * hours)
}

fun Instant.minusMinutes(minutes: Long): Instant {
    return this.minusSeconds(60L * minutes)
}

fun Instant.minusMinutes(minutes: Int): Instant {
    return this.minusSeconds(60L * minutes)
}

fun Instant.plusMinutes(minutes: Long): Instant {
    return this.plusSeconds(60L * minutes)
}

fun Instant.plusMinutes(minutes: Int): Instant {
    return this.plusSeconds(60L * minutes)
}