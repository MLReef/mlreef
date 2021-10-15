package com.mlreef.rest.config.http

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.security.AccountResolver
import com.mlreef.rest.security.TokenDetailsResolver
import org.springframework.context.annotation.Configuration
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfigurer(
    val accountRepository: AccountRepository,
) : WebMvcConfigurer {
    override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
        resolvers.add(TokenDetailsResolver())
        resolvers.add(AccountResolver(accountRepository))
    }
}
