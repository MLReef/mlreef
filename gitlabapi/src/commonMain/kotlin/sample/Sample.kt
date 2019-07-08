package sample

import com.mlreef.gitlabapi.Group
import com.mlreef.gitlabapi.getGroup
import kotlinx.serialization.ImplicitReflectionSerializer

expect class Sample() {
    fun checkMe(): Int
}

expect object Platform {
    val name: String
}

fun hello(): String = "Hello from ${Platform.name}"

fun commonHello(): String = "Hello Commoners"
