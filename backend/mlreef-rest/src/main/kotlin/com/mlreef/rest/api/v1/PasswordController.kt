package com.mlreef.rest.api.v1

import com.mlreef.rest.feature.auth.PasswordService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/password", produces = ["application/json"], consumes = ["application/json"])
class PasswordController(
    private val passwordService: PasswordService
) {
    @PostMapping("/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun passwordReset(
        @RequestParam(value = "email", required = false) email: String?,
        @RequestParam(value = "user_name", required = false) userName: String?,
        @RequestParam(value = "user_id", required = false) userId: UUID?
    ) {
        passwordService.resetPasswordStart(email, userName, userId)
    }

    @PostMapping("/reset/confirm")
    fun passwordResetConfirmation(@RequestBody request: PasswordResetRequest) = passwordService.passwordResetConfirm(
        request.token,
        request.password
    )

}

class PasswordResetRequest(
    val token: String,
    val password: String
)


