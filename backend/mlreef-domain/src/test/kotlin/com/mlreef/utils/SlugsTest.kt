package com.mlreef.utils

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class SlugsTest {

    @Test
    fun `lowercase and dashes are ok`() {
        checkValid("asdf-basdf123asdf-basdf", true)
        checkValid("asdf-basdfa-sd123f-basdf", true)
        checkValid("asdf-basdfa123-sdf-basf", true)
    }

    @Test
    fun `lowercase, pluses and dashes are ok`() {
        checkValid("asdf-basdf123asdf-bas++-df", true)
        checkValid("asdf-bas+dfa-sdf-ba123s+df", true)
        checkValid("asdf-basd123fa-sdf-bas+df", true)
    }

    @Test
    fun `whitespace is not valid`() {
        checkValid("asdf-basdf asdf-basdf", false)
    }

    @Test
    fun `uppercase is not valid`() {
        checkValid("asdf-AAA-basdf", false)
        checkValid("Eins-123", false)
        checkValid("asdf-Asdf", false)
    }

    @Test
    fun `special html chars are not valid (#'"§$%&=) `() {
        checkValid("asdf-#-basdf", false)
        checkValid("asdf§", false)
        checkValid("asdf$", false)
        checkValid("asdf%", false)
        checkValid("asdf&", false)
        checkValid("asdf/", false)
        checkValid("asdf(", false)
        checkValid("asdf)", false)
        checkValid("asdf?", false)
        checkValid("asdf~", false)
        checkValid("asdf#", false)
    }

    @Test
    fun `strings are lowercased and cleaned `() {
        checkToSlug("Eins123 #3123", "eins123--3123")
        checkToSlug("Eins123 3123", "eins123-3123")
        checkToSlug("+#&%$", "+----")
    }

    @Test
    fun `valid strings are idempotent `() {
        val valid1 = "asdf-basdf123asdf-bas++-df"
        val valid2 = "asdf-basdfa123-sdf-basf"
        checkToSlug(valid1, valid1)
        checkToSlug(valid2, valid2)
    }

    @Test
    fun `special html chars are replaced (#'"§$%&=) `() {
        checkToSlug("asdf-#-basdf", "asdf---basdf")
        checkToSlug("asdf§", "asdf-")
        checkToSlug("asdf$", "asdf-")
        checkToSlug("asdf%", "asdf-")
        checkToSlug("asdf&", "asdf-")
        checkToSlug("asdf/", "asdf-")
        checkToSlug("asdf(", "asdf-")
        checkToSlug("asdf)", "asdf-")
        checkToSlug("asdf?", "asdf-")
        checkToSlug("asdf~", "asdf-")
        checkToSlug("asdf#", "asdf-")
    }

    private fun checkValid(string: String, expected: Boolean) {
        val valid = Slugs.isValid(string)
        Assertions.assertThat(valid).isEqualTo(expected)
    }

    private fun checkToSlug(string: String, expected: String) {
        val slug = Slugs.toSlug(string)
        Assertions.assertThat(slug).isEqualTo(expected)
    }
}