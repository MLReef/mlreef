package com.mlreef.rest.feature.pipeline

import java.time.ZonedDateTime

class NameGenerator {

    companion object {
        private val adjectives = listOf("clever", "active", "alive", "alert", "amused", "awake", "balanced", "beloved",
            "better", "big", "bold", "casual", "busy", "certain", "calm", "charming", "childish",
            "civil", "clean", "clear", "clumsy", "comic", "cute", "dear", "deep", "desired",
            "devoted", "elegant", "epic", "eternal", "evolved", "exact", "excited", "exotic",
            "expert", "firm", "fair", "flexible", "fit", "flashy", "frank", "full",
            "flying", "fresh", "funny", "famous", "gentle", "generous", "glowing", "handy", "happy", "harmless",
            "healthy", "heroic", "hip", "holy", "honest", "hot", "huge", "humble", "immortal",
            "improved", "infinite", "inspired", "intense", "just", "keen",
            "kind", "knowing", "large", "lasting", "legal", "liberal", "light", "literate",
            "magical", "major", "mint", "modern", "modest", "moved", "musical",
            "native", "natural", "neat", "new", "nice", "noble", "normal", "optimum", "outgoing",
            "patient", "peaceful", "perfect", "pleasent", "pleased", "poetic", "polite", "positive",
            "popular", "powerful", "precise", "premium", "pretty", "pro", "profound", "proper",
            "proud", "pure", "quick", "quiet", "rapid", "rare", "ready", "real",
            "regular", "related", "relaxed", "renweing", "resolved", "rich", "romantic", "sacred",
            "sensible", "shaky", "sharp", "simple", "skilled", "smart",
            "smiling", "smooth", "social", "solid", "sound", "special", "splendid", "stable", "steady", "still",
            "sunny", "super", "sweet", "tender", "thankful", "tidy", "tight", "top", "touched",
            "well", "vast", "wanted", "warm", "willing", "wired",
            "corona-virus-infected")

        private val nouns = listOf("dolphin", "barracuda", "starfish", "scubadiver", "plancton", "ariel", "nemo", "anchovy",
            "whale", "shark", "clownfish", "cod", "coral", "eel", "seal", "shrimp", "flounder", "squid",
            "herring", "jellyfish", "dory", "krill", "lobster", "ray", "megalodon", "manatee", "warwhal",
            "nautilus", "octopus", "oyster", "plankton", "prawn", "pufferfish", "sponge", "swordfish", "walrus",
            "tuna", "crab", "algae", "kraken", "nessie", "siren", "moby-dick")

        private fun getRandomNoun(): String = nouns.random()
        private fun getRandomAdjective(): String = adjectives.random()

        private fun getDateString(dateTime: ZonedDateTime = ZonedDateTime.now()): String {
            val day = dateTime.dayOfMonth
            val month = dateTime.monthValue.toString().padStart(2, '0')
            val year = dateTime.year
            return "${day}${month}${year}"
        }

        fun getRandomNameWithDate(dateTime: ZonedDateTime = ZonedDateTime.now()): String {
            val noun = getRandomNoun()
            val adjective = getRandomAdjective()
            val dateString = getDateString(dateTime)
            return "$adjective-$noun-$dateString"
        }

    }
}