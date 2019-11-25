package com.mlreef.rest.api.v1

import com.mlreef.rest.Account
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.api.v1.dto.LoginRequest
import com.mlreef.rest.api.v1.dto.RegisterRequest
import com.mlreef.rest.api.v1.dto.UserDto
import com.mlreef.rest.exceptions.UserNotExistsException
import com.mlreef.rest.feature.auth.AuthService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth", produces = ["application/json"], consumes = ["application/json"])
class AuthController {

    @Autowired
    lateinit var authService: AuthService

    @Autowired
    lateinit var accountTokenRepository: AccountTokenRepository

    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): UserDto {
        val findUser = authService.loginUser(loginRequest.password, loginRequest.username, loginRequest.email)
        if (findUser == null) {
            throw UserNotExistsException(loginRequest.username.orEmpty(), loginRequest.email.orEmpty())
        }
        return buildUserDtoWithToken(findUser)
    }

    @PostMapping("/register")
    fun register(@RequestBody registerRequest: RegisterRequest): UserDto {
        val newUser = authService.registerUser(registerRequest.password, registerRequest.username, registerRequest.email)
        return buildUserDtoWithToken(newUser)
    }

    private fun buildUserDtoWithToken(newAccount: Account?): UserDto {
        val userToken = authService.getBestToken(newAccount)
        return UserDto(newAccount!!.id, newAccount.username, newAccount.email, userToken!!.token)
    }
}