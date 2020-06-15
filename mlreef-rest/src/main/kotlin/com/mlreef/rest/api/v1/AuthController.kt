package com.mlreef.rest.api.v1

import com.mlreef.rest.Account
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.api.v1.dto.UserDto
import com.mlreef.rest.api.v1.dto.toSecretUserDto
import com.mlreef.rest.api.v1.dto.toUserDto
import com.mlreef.rest.exceptions.GitlabNoValidTokenException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.external_api.gitlab.dto.OAuthToken
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
    fun login(@RequestBody loginRequest: LoginRequest): SecretUserDto = authService
        .loginUser(
            plainPassword = loginRequest.password,
            username = loginRequest.username,
            email = loginRequest.email
        )
        .let { (findUser: Account, oauthToken) ->
            findUser.toSecretUserDto(
                accessToken = oauthToken?.accessToken,
                refreshToken = oauthToken?.refreshToken
            )
        }

    @PostMapping("/register")
    fun register(@RequestBody registerRequest: RegisterRequest): SecretUserDto = authService
        .registerUser(
            plainPassword = registerRequest.password,
            username = registerRequest.username,
            email = registerRequest.email
        )
        .let { (newUser: Account, oauthToken: OAuthToken?) ->
            newUser.toSecretUserDto(
                accessToken = oauthToken?.accessToken,
                refreshToken = oauthToken?.refreshToken
            )
        }

    @GetMapping("/whoami")
    fun whoami(): UserDto = currentUserService.account().toUserDto()

    @GetMapping("/check/token")
    fun checkToken(account: Account, token: TokenDetails): UserDto =
        token.accessToken
            ?.let { authService.checkUserInGitlab(token = it).toUserDto(account.id) }
            ?: throw GitlabNoValidTokenException("No valid token for user")
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
