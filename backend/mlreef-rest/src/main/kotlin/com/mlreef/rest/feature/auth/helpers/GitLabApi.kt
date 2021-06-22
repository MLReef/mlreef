package com.mlreef.rest.feature.auth.helpers

import com.github.scribejava.core.builder.api.DefaultApi20
import com.github.scribejava.core.extractors.OAuth2AccessTokenJsonExtractor
import com.github.scribejava.core.extractors.TokenExtractor
import com.github.scribejava.core.model.OAuth2AccessToken
import com.github.scribejava.core.model.Verb

class GitLabApi protected constructor() : DefaultApi20() {
    companion object InstanceHolder {
        private val INSTANCE: GitLabApi = GitLabApi()

        fun instance(): GitLabApi {
            return INSTANCE
        }
    }

    override fun getAccessTokenVerb(): Verb {
        return Verb.POST
    }

    override fun getAccessTokenEndpoint(): String {
        return "https://gitlab.com/oauth/token"
    }

    override fun getAuthorizationBaseUrl(): String {
        return "https://gitlab.com/oauth/authorize"
    }

    override fun getAccessTokenExtractor(): TokenExtractor<OAuth2AccessToken> {
        return OAuth2AccessTokenJsonExtractor.instance()
    }
}