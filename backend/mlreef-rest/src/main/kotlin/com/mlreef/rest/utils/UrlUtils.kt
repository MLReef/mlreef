package com.mlreef.rest.utils

object UrlUtils {
    fun normalizeUrl(host: String, protocolIfMissing: String?, portIfMissing: Int?): String {
        val protocolHostAndPort = host.trim().split(":")

        val protocol = if (protocolHostAndPort.size > 1 &&
            (protocolHostAndPort[0].trim().equals("http", true) || protocolHostAndPort[0].trim().equals("https", true))
        ) {
            protocolHostAndPort[0]
        } else null

        val finalHost = (if (protocol == null && protocolHostAndPort.size > 0) {
            protocolHostAndPort[0]
        } else if (protocol != null && protocolHostAndPort.size > 1) {
            protocolHostAndPort[1]
        } else throw RuntimeException("Incorrect host $host")).removePrefix("//")

        val port = if (protocol == null && protocolHostAndPort.size > 1) {
            protocolHostAndPort[1].toIntOrNull()
        } else if (protocol != null && protocolHostAndPort.size > 2) {
            protocolHostAndPort[2].toIntOrNull()
        } else null

        val finalProtocol = (protocol ?: protocolIfMissing)?.takeIf { it.isNotBlank() }?.let { "$it://" } ?: ""
        val finalPort = (port ?: portIfMissing)?.takeIf { it > 0 && it != 80 && it != 443 }?.let { ":$it" } ?: ""

        return "$finalProtocol$finalHost$finalPort"
    }
}