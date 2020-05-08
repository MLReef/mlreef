package com.mlreef.rest.feature.marketplace

import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.marketplace.MarketplaceEntry
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.Star
import com.mlreef.rest.testcommons.EntityMocks
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.util.UUID
import java.util.UUID.randomUUID

@DisplayName("Marketplace Spec Entry")
open class MarketplaceEntrySpecTest {

    var marketplaceEntry: MarketplaceEntry? = null

    companion object {
        var lastGitlabId: Long = 1
    }

    private fun createEntity(id: UUID = randomUUID()): MarketplaceEntry {
        val author = Person(randomUUID(), "slug", "name", lastGitlabId++)
        val searchable = EntityMocks.dataProject()
        val entity = MarketplaceEntry(
            id = id, globalSlug = "slug",
            visibilityScope = VisibilityScope.PUBLIC,
            name = "title",
            description = "description",
            owner = author,
            searchableId = searchable.id,
            searchableType = searchable.getType())
        return entity
    }

    @DisplayName("A new Entry without stars")
    @Nested
    inner class EntryWithoutStars {

        @BeforeEach
        fun beforeEach() {
            marketplaceEntry = createEntity()
        }

        @Test
        fun `has no stars after creation`() {
            assertThat(marketplaceEntry!!.stars).isEmpty()
            assertThat(marketplaceEntry!!.starsCount).isEqualTo(0)
        }

        @Test
        fun `has 1 stars after starring by 1 distinct user`() {
            val entry = marketplaceEntry!!.addStar(EntityMocks.person())
            assertThat(entry.stars).hasSize(1)
            assertThat(entry.starsCount).isEqualTo(1)
        }

        @Test
        fun `has 2 stars after starring by 2 distinct user`() {
            val entry = marketplaceEntry!!
                .addStar(EntityMocks.person())
                .addStar(EntityMocks.person())
            assertThat(entry.stars).hasSize(2)
            assertThat(entry.starsCount).isEqualTo(2)
        }

        @Test
        fun `has 1 stars after starring by twice by same user`() {
            val person = EntityMocks.person()
            val entry = marketplaceEntry!!
                .addStar(person)
                .addStar(person)
            assertThat(entry.stars).hasSize(1)
            assertThat(entry.stars).contains(Star(marketplaceEntry!!.id, person.id))
        }
    }

    @DisplayName("An Entry with stars")
    @Nested
    inner class EntryWithStars {

        val owner1 = EntityMocks.person()
        val owner2 = EntityMocks.person()
        val owner3 = EntityMocks.person()

        @BeforeEach
        fun beforeEach() {
            marketplaceEntry = createEntity()
                .addStar(owner1)
                .addStar(owner2)
                .addStar(owner3)
        }

        @Test
        fun `has 3 stars after creation`() {
            assertThat(marketplaceEntry!!.stars).hasSize(3)
            assertThat(marketplaceEntry!!.starsCount).isEqualTo(3)
        }

        @Test
        fun `has 2 stars after removing one by previous fan`() {
            val removeStar = marketplaceEntry!!.removeStar(owner1)
            assertThat(removeStar.stars).hasSize(2)
            assertThat(removeStar.starsCount).isEqualTo(2)

            assertThat(removeStar.stars).doesNotContain(
                Star(marketplaceEntry!!.id, owner1.id)
            )
        }

        @Test
        fun `has 3 stars after removing one false positive`() {
            val removeStar = marketplaceEntry!!.removeStar(EntityMocks.person())
            assertThat(removeStar.stars).hasSize(3)
            assertThat(removeStar.starsCount).isEqualTo(3)
            assertThat(removeStar.stars).contains(
                Star(marketplaceEntry!!.id, owner1.id)
            )
        }

        @Test
        fun `has 3 stars after removing and add same fan`() {
            val entry = marketplaceEntry!!
                .removeStar(owner1)
                .addStar(owner1)
            assertThat(entry.stars).hasSize(3)
            assertThat(entry.starsCount).isEqualTo(3)
            assertThat(marketplaceEntry!!.stars.sortedBy { it.subjectId })
                .isEqualTo(entry.stars.sortedBy { it.subjectId })
            assertThat(entry.stars).contains(
                Star(marketplaceEntry!!.id, owner1.id)
            )
        }
    }

    @DisplayName("An Entry with Tags")
    @Nested
    inner class EntryWithTags {

        val tags = arrayListOf(
            SearchableTag(randomUUID(), "Tag1"),
            SearchableTag(randomUUID(), "Tag2"),
            SearchableTag(randomUUID(), "Tag3")
        )

        @BeforeEach
        fun beforeEach() {
            marketplaceEntry = createEntity()
        }

        @Test
        fun `has no tags after creation`() {
            assertThat(marketplaceEntry!!.tags).isNotNull()
            assertThat(marketplaceEntry!!.tags).isEmpty()
        }

        @Test
        fun `can add several tags `() {
            val expect = marketplaceEntry!!
                .addTags(tags)
            assertThat(expect.tags).hasSize(3)
        }

        @Test
        fun `can add just unique tags`() {
            val expect = marketplaceEntry!!
                .addTags(listOf(tags[0], tags[0], tags[0].copy()))
            assertThat(expect.tags).hasSize(1)
        }
    }

    @DisplayName("An Entry without DataTypes")
    @Nested
    inner class EntryWithoutDataTypes {

        @BeforeEach
        fun beforeEach() {
            marketplaceEntry = createEntity()
        }

        @Test
        fun `has no tags after creation`() {
            assertThat(marketplaceEntry!!.inputDataTypes).isNotNull()
            assertThat(marketplaceEntry!!.outputDataTypes).isNotNull()
            assertThat(marketplaceEntry!!.inputDataTypes).isEmpty()
            assertThat(marketplaceEntry!!.outputDataTypes).isEmpty()
        }

        @Test
        fun `can add several inputDataTypes`() {
            val expect = marketplaceEntry!!
                .addInputDataTypes(listOf(DataType.IMAGE, DataType.BINARY))
            assertThat(expect.inputDataTypes).hasSize(2)
        }

        @Test
        fun `can add just unique inputDataTypes`() {
            val expect = marketplaceEntry!!
                .addInputDataTypes(listOf(DataType.IMAGE, DataType.IMAGE, DataType.BINARY))
            assertThat(expect.inputDataTypes).hasSize(2)
        }

        @Test
        fun `can add several outputDataTypes`() {
            val expect = marketplaceEntry!!
                .addOutputDataTypes(listOf(DataType.IMAGE, DataType.BINARY))
            assertThat(expect.outputDataTypes).hasSize(2)
        }

        @Test
        fun `can add just unique outputDataTypes`() {
            val expect = marketplaceEntry!!
                .addOutputDataTypes(listOf(DataType.IMAGE, DataType.IMAGE, DataType.BINARY))
            assertThat(expect.outputDataTypes).hasSize(2)
        }
    }

    @DisplayName("An Entry with DataTypes")
    @Nested
    inner class EntryWithDataTypes {

        @BeforeEach
        fun beforeEach() {
            marketplaceEntry = createEntity()
                .addInputDataTypes(listOf(DataType.IMAGE, DataType.BINARY))
                .addOutputDataTypes(listOf(DataType.IMAGE, DataType.BINARY))
        }

        @Test
        fun `can remove existing inputDataTypes`() {
            val expect = marketplaceEntry!!
                .removeInputDataTypes(listOf(DataType.IMAGE))
            assertThat(expect.inputDataTypes).contains(DataType.BINARY)
            assertThat(expect.inputDataTypes).doesNotContain(DataType.IMAGE)
            assertThat(expect.inputDataTypes).hasSize(1)
        }

        @Test
        fun `can remove existing outputDataTypes`() {
            val expect = marketplaceEntry!!
                .removeOutputDataTypes(listOf(DataType.IMAGE))
            assertThat(expect.outputDataTypes).contains(DataType.BINARY)
            assertThat(expect.outputDataTypes).doesNotContain(DataType.IMAGE)
            assertThat(expect.outputDataTypes).hasSize(1)
        }

        @Test
        fun `cannot remove missing inputDataTypes`() {
            val expect = marketplaceEntry!!
                .removeInputDataTypes(listOf(DataType.VIDEO))
            assertThat(expect.inputDataTypes).contains(DataType.BINARY)
            assertThat(expect.inputDataTypes).contains(DataType.IMAGE)
            assertThat(expect.inputDataTypes).doesNotContain(DataType.VIDEO)
            assertThat(expect.inputDataTypes).hasSize(2)
        }

        @Test
        fun `cannot remove missing outputDataTypes`() {
            val expect = marketplaceEntry!!
                .removeOutputDataTypes(listOf(DataType.VIDEO))
            assertThat(expect.outputDataTypes).contains(DataType.BINARY)
            assertThat(expect.outputDataTypes).contains(DataType.IMAGE)
            assertThat(expect.outputDataTypes).doesNotContain(DataType.VIDEO)
            assertThat(expect.outputDataTypes).hasSize(2)
        }


    }

}
