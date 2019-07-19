plugins {
    base
    //documentation: https://github.com/srs/gradle-node-plugin/blob/master/docs/node.md
    id("com.moowork.node") version "1.3.1"
}

node {
    // Version of node to use.
    version = "12.3.1"
    npmVersion = "6.9.0"
    yarnVersion = "1.16.0"
    // If true, it will download node using above parameters.
    // If false, it will try to use globally installed node.
    download = true
}

tasks {
    npmInstall {
        enabled = false
    }
}
