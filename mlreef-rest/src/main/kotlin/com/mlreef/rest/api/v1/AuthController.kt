package com.mlreef.rest.api.v1

import com.mlreef.rest.Account
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.api.v1.dto.UserDto
import com.mlreef.rest.api.v1.dto.toSecretUserDto
import com.mlreef.rest.api.v1.dto.toUserDto
import com.mlreef.rest.exceptions.GitlabNoValidTokenException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.external_api.gitlab.dto.toUserDto
import com.mlreef.rest.feature.auth.AuthService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import javax.validation.constraints.Email
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/auth", produces = ["application/json"], consumes = ["application/json"])
class AuthController(
    val authService: AuthService,
    val currentUserService: CurrentUserService
) {

    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): SecretUserDto {
        val (findUser, oauthToken) = authService.loginUser(loginRequest.password, loginRequest.username, loginRequest.email)
        return findUser.toSecretUserDto(oauthToken?.accessToken, oauthToken?.refreshToken)
    }

    @PostMapping("/register")
    fun register(@RequestBody registerRequest: RegisterRequest): SecretUserDto {
        val (newUser, oauthToken) = authService.registerUser(registerRequest.password, registerRequest.username, registerRequest.email)
        return newUser.toSecretUserDto(oauthToken?.accessToken, oauthToken?.refreshToken)
    }

    @GetMapping("/whoami")
    fun whoami(): UserDto {
        val account = currentUserService.account()
        return account.toUserDto()
    }

    @GetMapping("/check/token")
    fun checkToken(account: Account, token: TokenDetails): UserDto {
        val userInGitlab = authService.checkUserInGitlab(token.accessToken ?: throw GitlabNoValidTokenException("No valid token for user"))
        return userInGitlab.toUserDto(account.id)
    }


}

data class LoginRequest(
    val username: String?,
    @get:Email val email: String?,
    @get:NotEmpty val password: String
)

data class RegisterRequest(
    @get:NotEmpty val username: String,
    @get:Email @get:NotEmpty val email: String,
    @get:NotEmpty val password: String,
    @get:NotEmpty val name: String
)