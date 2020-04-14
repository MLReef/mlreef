package com.mlreef.rest.api.v1

import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.LoginRequest
import com.mlreef.rest.api.v1.dto.RegisterRequest
import com.mlreef.rest.api.v1.dto.UserDto
import com.mlreef.rest.api.v1.dto.toUserDto
import com.mlreef.rest.feature.auth.AuthService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth", produces = ["application/json"], consumes = ["application/json"])
class AuthController(
    val authService: AuthService,
    val currentUserService: CurrentUserService
) {

    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): UserDto {
        val (findUser, oauthToken) = authService.loginUser(loginRequest.password, loginRequest.username, loginRequest.email)
        return findUser.toUserDto(oauthToken?.accessToken, oauthToken?.refreshToken)
    }

    @PostMapping("/register")
    fun register(@RequestBody registerRequest: RegisterRequest): UserDto {
        val (newUser, oauthToken) = authService.registerUser(registerRequest.password, registerRequest.username, registerRequest.email)
        return newUser.toUserDto(oauthToken?.accessToken, oauthToken?.refreshToken)
    }

    @GetMapping("/whoami")
    fun whoami(): UserDto {
        val account = currentUserService.account()
        return account.toUserDto()
    }
}
