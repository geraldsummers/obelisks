#!/usr/bin/env kotlin

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import kotlin.system.exitProcess

val root: Path = Paths.get("").toAbsolutePath().normalize()
val assignmentsPath = root.resolve("kubejs/startup_scripts/99_realistic_hands_assignments.js")
val auditPath = root.resolve("generated/runtime-dumps/realistic_hands_audit.json")
val exemptionsPath = root.resolve("tools/realistic_hands_exemptions.json")

fun die(message: String): Nothing {
    System.err.println("FAIL - $message")
    exitProcess(1)
}

fun read(path: Path): String = Files.readString(path)

class JsonParser(private val text: String) {
    private var index = 0
    fun parse(): Any? {
        skip()
        val value = parseValue()
        skip()
        if (index != text.length) error("unexpected trailing content at $index")
        return value
    }
    private fun parseValue(): Any? {
        skip()
        return when (peek()) {
            '{' -> parseObject()
            '[' -> parseArray()
            '"' -> parseString()
            't' -> parseLiteral("true", true)
            'f' -> parseLiteral("false", false)
            'n' -> parseLiteral("null", null)
            else -> parseNumber()
        }
    }
    private fun parseObject(): Map<String, Any?> {
        expect('{')
        skip()
        val map = linkedMapOf<String, Any?>()
        if (peek() == '}') {
            index++
            return map
        }
        while (true) {
            skip()
            val key = parseString()
            skip()
            expect(':')
            map[key] = parseValue()
            skip()
            when (peek()) {
                ',' -> index++
                '}' -> { index++; return map }
                else -> error("expected ',' or '}' at $index")
            }
        }
    }
    private fun parseArray(): List<Any?> {
        expect('[')
        skip()
        val list = mutableListOf<Any?>()
        if (peek() == ']') {
            index++
            return list
        }
        while (true) {
            list += parseValue()
            skip()
            when (peek()) {
                ',' -> index++
                ']' -> { index++; return list }
                else -> error("expected ',' or ']' at $index")
            }
        }
    }
    private fun parseString(): String {
        expect('"')
        val out = StringBuilder()
        while (index < text.length) {
            val ch = text[index++]
            when (ch) {
                '"' -> return out.toString()
                '\\' -> {
                    val esc = text[index++]
                    out.append(
                        when (esc) {
                            '"', '\\', '/' -> esc
                            'b' -> '\b'
                            'f' -> '\u000c'
                            'n' -> '\n'
                            'r' -> '\r'
                            't' -> '\t'
                            'u' -> text.substring(index, index + 4).also { index += 4 }.toInt(16).toChar()
                            else -> error("bad escape: \\$esc")
                        }
                    )
                }
                else -> out.append(ch)
            }
        }
        error("unterminated string")
    }
    private fun parseNumber(): Number {
        val start = index
        if (peek() == '-') index++
        while (peek()?.isDigit() == true) index++
        if (peek() == '.') {
            index++
            while (peek()?.isDigit() == true) index++
        }
        if (peek() == 'e' || peek() == 'E') {
            index++
            if (peek() == '+' || peek() == '-') index++
            while (peek()?.isDigit() == true) index++
        }
        val raw = text.substring(start, index)
        return raw.toDoubleOrNull() ?: error("bad number: $raw")
    }
    private fun parseLiteral(token: String, value: Any?): Any? {
        require(text.startsWith(token, index)) { "expected $token at $index" }
        index += token.length
        return value
    }
    private fun skip() { while (index < text.length && text[index].isWhitespace()) index++ }
    private fun peek(): Char? = text.getOrNull(index)
    private fun expect(ch: Char) {
        if (peek() != ch) error("expected '$ch' at $index")
        index++
    }
}

fun parseJson(text: String): Any? = JsonParser(text).parse()
fun jsonObject(value: Any?): Map<String, Any?> = value as? Map<String, Any?> ?: emptyMap()
fun jsonArray(value: Any?): List<Any?> = value as? List<Any?> ?: emptyList()
fun jsonString(value: Any?): String? = value as? String

fun localName(id: String): String = if (":" in id) id.substringAfter(':') else id
fun namespace(id: String): String = if (":" in id) id.substringBefore(':') else "minecraft"

val canonicalTools = listOf("knife", "axe", "pickaxe", "shovel", "hoe", "sword")
val handExactIds = setOf(
    "minecraft:sand",
    "minecraft:red_sand",
    "minecraft:gravel",
    "minecraft:dirt",
    "minecraft:coarse_dirt",
    "minecraft:grass_block",
    "minecraft:mycelium",
    "minecraft:podzol",
    "minecraft:rooted_dirt",
    "minecraft:mud",
    "minecraft:soul_sand",
    "minecraft:suspicious_gravel",
    "minecraft:suspicious_sand"
)
val soilKeywords = listOf("sand", "gravel", "dirt", "mud", "regolith", "loam", "silt", "soil", "sediment", "grassy_", "grass_block", "mycelium", "podzol")

fun isLooseSurface(name: String): Boolean =
    handExactIds.contains("minecraft:$name") || soilKeywords.any(name::contains)

fun isAllowedHandFamily(id: String): Boolean =
    handExactIds.contains(id) || isLooseSurface(localName(id))

fun isPlayerFacingExempt(id: String, exemptions: Map<String, Any?>): Boolean {
    val name = localName(id)
    return id in jsonArray(exemptions["exactIds"]).mapNotNull(::jsonString) ||
        namespace(id) in jsonArray(exemptions["namespaces"]).mapNotNull(::jsonString) ||
        jsonArray(exemptions["pathPrefixes"]).mapNotNull(::jsonString).any(name::startsWith) ||
        jsonArray(exemptions["pathSuffixes"]).mapNotNull(::jsonString).any(name::endsWith) ||
        jsonArray(exemptions["pathContains"]).mapNotNull(::jsonString).any(name::contains)
}

fun summarizeRepresentativeSeparation(assignments: Map<String, Any?>): Map<String, Boolean> {
    val blocks = jsonObject(assignments["blocks"])
    val knife = jsonArray(blocks["knife"]).mapNotNull(::jsonString).toSet()
    val sword = jsonArray(blocks["sword"]).mapNotNull(::jsonString).toSet()
    return mapOf(
        "knifeGrass" to knife.contains("projectvibrantjourneys:short_grass"),
        "knifeLeaves" to knife.contains("minecraft:oak_leaves"),
        "swordCobweb" to sword.contains("minecraft:cobweb"),
        "swordTripwire" to sword.contains("minecraft:tripwire")
    )
}

fun parseAssignments(): Map<String, Any?> {
    val text = read(assignmentsPath)
    val match = Regex("""global\.BTM_REALISTIC_HANDS_ASSIGNMENTS\s*=\s*(\{[\s\S]*\})\s*$""").find(text)
        ?: die("could not parse assignments from ${root.relativize(assignmentsPath)}")
    return jsonObject(parseJson(match.groupValues[1]))
}

if (!Files.exists(assignmentsPath)) die("missing ${root.relativize(assignmentsPath)}")
if (!Files.exists(auditPath)) die("missing ${root.relativize(auditPath)}; regenerate the Realistic Hands audit")
if (!Files.exists(exemptionsPath)) die("missing ${root.relativize(exemptionsPath)}")

val assignments = parseAssignments()
val audit = jsonObject(parseJson(read(auditPath)))
val exemptions = jsonObject(parseJson(read(exemptionsPath)))

val handBlocks = jsonArray(jsonObject(assignments["blocks"])["hand"]).mapNotNull(::jsonString)
val handViolations = handBlocks.filter { !isPlayerFacingExempt(it, exemptions) && !isAllowedHandFamily(it) }
val unresolved = jsonArray(audit["unassignedBreakableBlocks"]).mapNotNull(::jsonString).filter { !isPlayerFacingExempt(it, exemptions) }
val blockAssignments = jsonObject(assignments["blockAssignments"])
val itemAssignments = jsonObject(assignments["itemAssignments"])

val missingCanonicalAssignments = blockAssignments.entries.filter { (_, assignmentAny) ->
    val tools = jsonArray(jsonObject(assignmentAny)["tools"]).mapNotNull(::jsonString)
    !tools.contains("hand") && tools.none(canonicalTools::contains)
}.map { it.key }

val missingOrigins = blockAssignments.entries.filter { (_, assignmentAny) ->
    val assignment = jsonObject(assignmentAny)
    jsonString(assignment["origin"]).isNullOrBlank() || jsonString(assignment["detail"]).isNullOrBlank()
}.map { it.key }

val itemCoverageFailures = mutableListOf<String>()
val itemsByTool = jsonObject(assignments["items"])
val blocksByTool = jsonObject(assignments["blocks"])
for (tool in canonicalTools) {
    val blockCount = jsonArray(blocksByTool[tool]).size
    val itemCount = jsonArray(itemsByTool[tool]).size
    if (blockCount > 0 && itemCount == 0) itemCoverageFailures += "$tool: no delegated tool items"
}

val reps = summarizeRepresentativeSeparation(assignments)
val representativeFailures = mutableListOf<String>()
if (reps["knifeGrass"] != true) representativeFailures += "projectvibrantjourneys:short_grass must remain knife-classified"
if (reps["swordCobweb"] != true) representativeFailures += "minecraft:cobweb must remain sword-classified"
if ("minecraft:cobweb" in jsonArray(blocksByTool["knife"]).mapNotNull(::jsonString)) representativeFailures += "minecraft:cobweb must not collapse into knife"
if ("projectvibrantjourneys:short_grass" in jsonArray(blocksByTool["sword"]).mapNotNull(::jsonString)) representativeFailures += "projectvibrantjourneys:short_grass must not collapse into sword"

val missingOutcomes = mutableListOf<String>()
val outcomeFamilies = jsonObject(assignments["outcomeFamilies"])
if (jsonArray(outcomeFamilies["knife_transform_fiber"]).isEmpty()) missingOutcomes += "knife_transform_fiber"
if (jsonArray(outcomeFamilies["sword_preserve_web"]).isEmpty()) missingOutcomes += "sword_preserve_web"

val knifeItemSet = jsonArray(itemsByTool["knife"]).mapNotNull(::jsonString).toSet()
for (id in listOf("additionalweaponry:butcher_knife")) {
    if (itemAssignments.containsKey(id) && id !in knifeItemSet) itemCoverageFailures += "$id: expected knife delegation"
}

val allViolations = buildList {
    addAll(handViolations.map { "hand:$it" })
    addAll(unresolved.map { "unassigned:$it" })
    addAll(missingCanonicalAssignments.map { "tool:$it" })
    addAll(missingOrigins.map { "origin:$it" })
    addAll(itemCoverageFailures)
    addAll(representativeFailures)
    addAll(missingOutcomes)
}

if (allViolations.isNotEmpty()) {
    System.err.println("FAIL - Realistic Hands validation has ${allViolations.size} violation(s)")
    System.err.println("hand violations: ${handViolations.size}")
    System.err.println("unassigned blocks: ${unresolved.size}")
    System.err.println("assignment metadata failures: ${missingCanonicalAssignments.size + missingOrigins.size}")
    System.err.println(allViolations.take(400).joinToString("\n"))
    exitProcess(1)
}

println("ok - Realistic Hands validates (${handBlocks.size} hand entries, ${jsonArray(audit["unassignedBreakableBlocks"]).size} unassigned entries, knife and sword remain distinct)")
