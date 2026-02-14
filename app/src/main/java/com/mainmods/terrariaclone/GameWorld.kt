package com.mainmods.terrariaclone

import kotlin.math.max
import kotlin.math.min

class GameWorld(
    val width: Int = 220,
    val height: Int = 120,
    private val surfaceLevel: Int = 68
) {
    private val blocks = Array(height) { IntArray(width) }

    init {
        generateTerrain()
    }

    private fun generateTerrain() {
        for (x in 0 until width) {
            val wave = (kotlin.math.sin(x * 0.12) * 3).toInt()
            val top = (surfaceLevel + wave).coerceIn(10, height - 10)
            for (y in 0 until height) {
                blocks[y][x] = when {
                    y > top -> TileType.AIR.id
                    y == top -> TileType.GRASS.id
                    y > top - 4 -> TileType.DIRT.id
                    else -> TileType.STONE.id
                }
            }
        }
    }


    private fun isInside(x: Int, y: Int): Boolean = x in 0 until width && y in 0 until height

    fun getTile(x: Int, y: Int): TileType {
        if (!isInside(x, y)) return TileType.STONE
        return TileType.fromId(blocks[y][x])
    }

    fun setTile(x: Int, y: Int, tileType: TileType) {
        if (!isInside(x, y)) return
        blocks[y][x] = tileType.id
    }

    fun breakBlock(x: Int, y: Int): Boolean {
        val tile = getTile(x, y)
        if (tile == TileType.AIR || tile == TileType.BEDROCK) return false
        setTile(x, y, TileType.AIR)
        return true
    }

    fun placeBlock(x: Int, y: Int): Boolean {
        if (!isInside(x, y)) return false
        if (getTile(x, y) != TileType.AIR) return false
        setTile(x, y, TileType.DIRT)
        return true
    }

    fun isSolidAt(x: Float, y: Float): Boolean {
        return getTile(x.toInt(), y.toInt()).solid
    }

    fun clampX(x: Float): Float = min(max(1f, x), width - 2f)
}

enum class TileType(val id: Int, val solid: Boolean) {
    AIR(0, false),
    DIRT(1, true),
    GRASS(2, true),
    STONE(3, true),
    BEDROCK(4, true);

    companion object {
        fun fromId(id: Int): TileType = entries.find { it.id == id } ?: AIR
    }
}
