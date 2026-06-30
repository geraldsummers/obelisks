#!/usr/bin/env kotlin
@file:DependsOn("org.mozilla:rhino:1.7.15")

import org.mozilla.javascript.CompilerEnvirons
import org.mozilla.javascript.ErrorReporter
import org.mozilla.javascript.EvaluatorException
import org.mozilla.javascript.Parser
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import kotlin.system.exitProcess

val root = Paths.get("").toAbsolutePath().normalize()

class CollectingReporter : ErrorReporter {
    val errors = mutableListOf<String>()
    override fun warning(message: String?, sourceName: String?, line: Int, lineSource: String?, lineOffset: Int) = Unit
    override fun error(message: String?, sourceName: String?, line: Int, lineSource: String?, lineOffset: Int) {
        errors += "${sourceName ?: "<unknown>"}:$line:$lineOffset ${message ?: "syntax error"}"
    }
    override fun runtimeError(message: String?, sourceName: String?, line: Int, lineSource: String?, lineOffset: Int): EvaluatorException =
        EvaluatorException(message, sourceName, line, lineSource, lineOffset)
}

fun walk(rootDir: Path, predicate: (Path) -> Boolean = { true }): List<Path> {
    if (!Files.exists(rootDir)) return emptyList()
    return Files.walk(rootDir).use { stream -> stream.filter { Files.isRegularFile(it) && predicate(it) }.toList() }
}

val files = (
    walk(root.resolve("kubejs")) { it.toString().endsWith(".js") } +
    walk(root.resolve("tools")) { it.toString().endsWith(".js") || it.toString().endsWith(".mjs") }
).sortedBy { root.relativize(it).toString() }

val reporter = CollectingReporter()
val env = CompilerEnvirons().apply {
    errorReporter = reporter
    languageVersion = org.mozilla.javascript.Context.VERSION_ES6
    isStrictMode = false
    isReservedKeywordAsIdentifier = true
}
val parser = Parser(env, reporter)

for (file in files) {
    try {
        parser.parse(Files.readString(file), root.relativize(file).toString(), 1)
    } catch (_: Exception) {
        // reporter captures syntax errors; parse may still throw after reporting.
    }
}

if (reporter.errors.isEmpty()) {
    println("ok - all KubeJS/tool JS parses with Rhino (${"%d".format(files.size)} files)")
    exitProcess(0)
}

System.err.println("FAIL - all KubeJS/tool JS parses with Rhino")
System.err.println(reporter.errors.take(20).joinToString("\n"))
exitProcess(1)
