
group = "com.mlreef"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

plugins {
    id("kotlin2js") version "1.3.21"
}

dependencies {
    implementation(kotlin("stdlib-js"))
}

