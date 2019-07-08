plugins {
    id("kotlin2js") version "1.3.41"
}


repositories {
    jcenter()
    mavenCentral()
}


dependencies {
    val ktorVersion = "1.2.2"
    val kotlinxCoroutinesVersion = "1.3.0-M2"
    val serializationVersion = "0.11.1"

    implementation(kotlin("stdlib-js"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core-js:$kotlinxCoroutinesVersion")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-runtime-js:$serializationVersion")
    implementation("io.ktor:ktor-client-js:$ktorVersion")

    implementation(project(":gitlabapi"))
}

tasks {
    compileKotlin2Js {
        kotlinOptions {
            outputFile = "web/src/main/web/kotlin/output.js"
            //    kotlinOptions.moduleKind = "plain" // plain (default), amd, commonjs, umd
            sourceMap = true
        }
    }
}
