package com.mainmods.terrariaclone

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class GameWorldTest {
    @Test
    fun breakAndPlaceBlockWorks() {
        val world = GameWorld(width = 30, height = 30, surfaceLevel = 10)
        val x = 5
        val y = 5

        world.setTile(x, y, TileType.STONE)
        assertTrue(world.breakBlock(x, y))
        assertEquals(TileType.AIR, world.getTile(x, y))

        assertTrue(world.placeBlock(x, y))
        assertEquals(TileType.DIRT, world.getTile(x, y))
    }
}
