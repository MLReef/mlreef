package com.mlreef.rest.feature.auth.helpers

import com.github.scribejava.core.builder.api.DefaultApi20
import com.github.scribejava.core.extractors.OAuth2AccessTokenJsonExtractor
import com.github.scribejava.core.extractors.TokenExtractor
import com.github.scribejava.core.model.OAuth2AccessToken
import com.github.scribejava.core.model.Verb

open class FreelancerApi20 protected constructor() : DefaultApi20() {
    companion object {
        private val INSTANCE: FreelancerApi20 = FreelancerApi20()

        fun instance(): FreelancerApi20 {
            return INSTANCE
        }
    }

    override fun getAccessTokenVerb(): Verb {
        return Verb.POST
    }

    override fun getAccessTokenEndpoint(): String {
        return "https://accounts.freelancer.com/oauth/token"
    }

    override fun getAuthorizationBaseUrl(): String {
        return "https://accounts.freelancer.com/oauth/authorize"
    }

    override fun getAccessTokenExtractor(): TokenExtractor<OAuth2AccessToken> {
        return OAuth2AccessTokenJsonExtractor.instance()
    }

    class Sandbox: FreelancerApi20() {
        private fun Sandbox() {}

        companion object {
            private val INSTANCE = FreelancerApi20.Sandbox()

            fun instance(): FreelancerApi20.Sandbox {
                return INSTANCE
            }
        }

        override fun getAccessTokenVerb(): Verb {
            return Verb.POST
        }

        override fun getAccessTokenEndpoint(): String {
            return "https://accounts.freelancer-sandbox.com/oauth/token"
        }

        override fun getAuthorizationBaseUrl(): String {
            return "https://accounts.freelancer-sandbox.com/oauth/authorize"
        }

        override fun getAccessTokenExtractor(): TokenExtractor<OAuth2AccessToken> {
            return OAuth2AccessTokenJsonExtractor.instance()
        }
    }
}