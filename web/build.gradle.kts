plugins {
    val kotlinVersion = "1.3.41"
    id("kotlin2js") version kotlinVersion
    id("kotlinx-serialization") version kotlinVersion
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
    //implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core-js:$kotlinxCoroutinesVersion")
    //implementation("org.jetbrains.kotlinx:kotlinx-serialization-runtime-js:$serializationVersion")
    //implementation("io.ktor:ktor-client-js:$ktorVersion")

//    implementation(project(":gitlabapi"))
}

tasks {
    compileKotlin2Js {
        kotlinOptions {
            outputFile = "web/src/kotlinjs/output.js"
            kotlinOptions.moduleKind = "commonjs" // plain (default), amd, commonjs, umd
            sourceMap = true
        }
    }
}
