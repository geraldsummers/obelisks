#!/usr/bin/env kotlin

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import kotlin.io.path.exists
import kotlin.system.exitProcess

val root = Paths.get("").toAbsolutePath().normalize()
val assetsDir = root.resolve("kubejs/assets/kubejs")
val itemModelDir = assetsDir.resolve("models/item")
val blockModelDir = assetsDir.resolve("models/block")
val blockstateDir = assetsDir.resolve("blockstates")
val itemTextureDir = assetsDir.resolve("textures/item")
val blockTextureDir = assetsDir.resolve("textures/block")
val progressionRegistryPath = root.resolve("kubejs/startup_scripts/10_items_blocks/30_progression_items.js")
val cataloguePath = root.resolve("kubejs/startup_scripts/00_globals/20_progression_catalogues.js")
val failures = mutableListOf<String>()

fun fail(message: String) { failures += message }
fun read(file: Path): String = Files.readString(file)
fun exists(file: Path): Boolean = file.exists() && runCatching { Files.size(file) > 0 }.getOrElse { false }
fun rel(file: Path): String = root.relativize(file).toString().replace('\\', '/')
fun walk(dir: Path, predicate: ((Path) -> Boolean)? = null, out: MutableList<Path> = mutableListOf()): List<Path> {
    if (!dir.exists()) return out
    Files.walk(dir).use { stream ->
        stream.filter { Files.isRegularFile(it) }.forEach { if (predicate == null || predicate(it)) out.add(it) }
    }
    return out
}
fun unique(values: List<String>): List<String> = values.distinct()

class JsonParser(private val text: String) {
    private var index = 0
    fun parse(): Any? { skipWhitespace(); val value = parseValue(); skipWhitespace(); return value }
    private fun parseValue(): Any? {
        skipWhitespace()
        return when (val ch = text[index]) {
            '{' -> parseObject()
            '[' -> parseArray()
            '"' -> parseString()
            't' -> parseLiteral("true", true)
            'f' -> parseLiteral("false", false)
            'n' -> parseLiteral("null", null)
            '-', in '0'..'9' -> parseNumber()
            else -> error("unexpected JSON character: $ch")
        }
    }
    private fun parseObject(): Map<String, Any?> {
        val result = linkedMapOf<String, Any?>(); expect('{'); skipWhitespace()
        if (peek('}')) { index += 1; return result }
        while (true) {
            skipWhitespace()
            val key = parseString(); skipWhitespace(); expect(':'); result[key] = parseValue(); skipWhitespace()
            when { peek('}') -> { index += 1; return result }; peek(',') -> index += 1; else -> error("expected , or }") }
        }
    }
    private fun parseArray(): List<Any?> {
        val result = mutableListOf<Any?>(); expect('['); skipWhitespace()
        if (peek(']')) { index += 1; return result }
        while (true) {
            skipWhitespace()
            result += parseValue(); skipWhitespace()
            when { peek(']') -> { index += 1; return result }; peek(',') -> index += 1; else -> error("expected , or ]") }
        }
    }
    private fun parseString(): String {
        expect('"'); val out = StringBuilder()
        while (index < text.length) {
            val ch = text[index++]
            when (ch) {
                '"' -> return out.toString()
                '\\' -> out.append(when (val esc = text[index++]) {
                    '"', '\\', '/' -> esc
                    'b' -> '\b'
                    'f' -> '\u000C'
                    'n' -> '\n'
                    'r' -> '\r'
                    't' -> '\t'
                    'u' -> { val hex = text.substring(index, index + 4); index += 4; hex.toInt(16).toChar() }
                    else -> error("bad escape: $esc")
                })
                else -> out.append(ch)
            }
        }
        error("unterminated string")
    }
    private fun parseNumber(): Number {
        val start = index
        if (text[index] == '-') index += 1
        while (index < text.length && text[index].isDigit()) index += 1
        if (index < text.length && text[index] == '.') { index += 1; while (index < text.length && text[index].isDigit()) index += 1 }
        val raw = text.substring(start, index)
        return if (raw.contains('.')) raw.toDouble() else raw.toLong()
    }
    private fun parseLiteral(token: String, value: Any?): Any? { require(text.startsWith(token, index)); index += token.length; return value }
    private fun skipWhitespace() { while (index < text.length && text[index].isWhitespace()) index += 1 }
    private fun expect(ch: Char) { require(index < text.length && text[index] == ch); index += 1 }
    private fun peek(ch: Char): Boolean = index < text.length && text[index] == ch
}
fun parseJson(text: String): Any? = JsonParser(text).parse()
fun readJson(file: Path): Map<String, Any?> = parseJson(read(file)) as? Map<String, Any?> ?: emptyMap()

fun parseProgressionItemIds(): List<String> {
    if (!exists(progressionRegistryPath)) return emptyList()
    val text = read(progressionRegistryPath)
    val ids = mutableListOf<String>()
    Regex("""\[\s*'([a-z0-9_]+)'\s*,\s*'[^']+'(?:\s*,\s*\d+)?\s*]""").findAll(text).forEach { ids += it.groupValues[1] }
    Regex("""event\.create\('([a-z0-9_]+)'\)\.displayName""").findAll(text).forEach { ids += it.groupValues[1] }
    return unique(ids).filter { it != "phosphoric_acid_fluid" }
}

fun parseCasingIds(): List<String> {
    if (!exists(cataloguePath)) return emptyList()
    return unique(Regex("""item:\s*'kubejs:([^']+)'""").findAll(read(cataloguePath)).map { it.groupValues[1] }.toList())
}

fun texturePath(textureRef: String): Path? {
    val parts = if (':' in textureRef) textureRef.split(':', limit = 2) else listOf("minecraft", textureRef)
    val namespace = parts[0]
    val rest = parts[1]
    if (namespace != "kubejs") return null
    return when {
        rest.startsWith("item/") -> itemTextureDir.resolve("${rest.removePrefix("item/")}.png")
        rest.startsWith("block/") -> blockTextureDir.resolve("${rest.removePrefix("block/")}.png")
        else -> null
    }
}

fun modelParentPath(parentRef: String): Path? {
    val parts = if (':' in parentRef) parentRef.split(':', limit = 2) else listOf("minecraft", parentRef)
    val namespace = parts[0]
    val rest = parts[1]
    if (namespace != "kubejs") return null
    return when {
        rest.startsWith("block/") -> blockModelDir.resolve("${rest.removePrefix("block/")}.json")
        rest.startsWith("item/") -> itemModelDir.resolve("${rest.removePrefix("item/")}.json")
        else -> null
    }
}

val progressionItems = parseProgressionItemIds()
val casingIds = parseCasingIds()
val boxTierIds = (1..16).map { "box_t${it.toString().padStart(2, '0')}" }

for (itemId in progressionItems + casingIds) {
    val model = itemModelDir.resolve("$itemId.json")
    if (!exists(model)) fail("registered item missing item model: kubejs:$itemId")
}

for (casingId in casingIds) {
    val blockstate = blockstateDir.resolve("$casingId.json")
    val blockModel = blockModelDir.resolve("$casingId.json")
    val itemModel = itemModelDir.resolve("$casingId.json")
    if (!exists(blockstate)) fail("casing missing blockstate: kubejs:$casingId")
    if (!exists(blockModel)) fail("casing missing block model: kubejs:$casingId")
    if (!exists(itemModel)) fail("casing missing item model: kubejs:$casingId")
    for (face in listOf("front", "back", "side", "top", "bottom")) if (!exists(blockTextureDir.resolve("${casingId}_$face.png"))) fail("casing missing $face texture: kubejs:$casingId")
}

for (boxId in boxTierIds) {
    val blockModel = blockModelDir.resolve("$boxId.json")
    val itemModel = itemModelDir.resolve("$boxId.json")
    if (!exists(blockModel)) fail("crate tier missing block model: kubejs:$boxId")
    if (!exists(itemModel)) fail("crate tier missing item model: kubejs:$boxId")
    for (face in listOf("front", "back", "side", "top", "bottom")) if (!exists(blockTextureDir.resolve("${boxId}_$face.png"))) fail("crate tier missing $face texture: kubejs:$boxId")
}

val modelFiles = (
    walk(itemModelDir, predicate = { it.fileName.toString().endsWith(".json") }) +
        walk(blockModelDir, predicate = { it.fileName.toString().endsWith(".json") })
    ).toList()
for (modelFile in modelFiles) {
    val model = try { readJson(modelFile) } catch (error: Exception) {
        fail("model JSON does not parse: ${rel(modelFile)}: ${error.message ?: error.javaClass.simpleName}")
        continue
    }
    val parent = model["parent"] as? String
    if (parent != null) {
        val parentPath = modelParentPath(parent)
        if (parentPath != null && !exists(parentPath)) fail("model parent missing: ${rel(modelFile)} -> $parent")
    }
    val textures = model["textures"] as? Map<*, *> ?: emptyMap<Any?, Any?>()
    for (textureRef in textures.values.filterIsInstance<String>()) {
        val expectedTexture = texturePath(textureRef)
        if (expectedTexture != null && !exists(expectedTexture)) fail("model texture missing: ${rel(modelFile)} -> $textureRef")
    }
}

for (stale in listOf("ae2_machine_casing", "oc2r_machine_casing", "power_grid_machine_casing")) {
    for (assetRoot in listOf(blockstateDir, blockModelDir, itemModelDir, blockTextureDir)) {
        for (hit in walk(assetRoot, predicate = { it.fileName.toString().startsWith(stale) })) fail("stale renamed casing asset remains: ${rel(hit)}")
    }
}

if (failures.isNotEmpty()) {
    System.err.println(failures.joinToString("\n") { "FAIL - $it" })
    exitProcess(1)
}

println("ok - kubejs assets validate (${progressionItems.size} custom items, ${casingIds.size} casings, ${boxTierIds.size} crate tiers, ${modelFiles.size} models)")
