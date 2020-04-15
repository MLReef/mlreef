package com.mlreef.rest.config.security

import javax.servlet.Filter
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


class SimpleCorsFilter: Filter {
    override fun doFilter(req: ServletRequest, res: ServletResponse, chain: FilterChain) {
        val request: HttpServletRequest = req as HttpServletRequest
        val response: HttpServletResponse = res as HttpServletResponse
        response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"))
        response.setHeader("Access-Control-Allow-Credentials", "true")
        response.setHeader("Access-Control-Allow-Methods", "*")
        response.setHeader("Access-Control-Max-Age", "3600")
        response.setHeader("Access-Control-Allow-Headers", "*")
        chain.doFilter(req, res)
    }
}