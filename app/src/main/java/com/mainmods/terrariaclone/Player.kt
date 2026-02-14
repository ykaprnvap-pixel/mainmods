package com.mainmods.terrariaclone

class Player(
    var x: Float,
    var y: Float,
    var velocityX: Float = 0f,
    var velocityY: Float = 0f
) {
    val width: Float = 0.8f
    val height: Float = 1.8f
    var onGround: Boolean = false

    fun update(world: GameWorld, moveAxis: Float, jumpPressed: Boolean, delta: Float) {
        val speed = 6f
        velocityX = moveAxis * speed

        if (jumpPressed && onGround) {
            velocityY = 9f
            onGround = false
        }

        velocityY -= 20f * delta

        var newX = x + velocityX * delta
        var newY = y + velocityY * delta

        if (isColliding(world, newX, y)) {
            newX = x
            velocityX = 0f
        }

        if (isColliding(world, newX, newY)) {
            if (velocityY < 0f) onGround = true
            velocityY = 0f
            newY = y
        } else {
            onGround = false
        }

        x = world.clampX(newX)
        y = newY.coerceIn(3f, world.height - 2f)
    }

    private fun isColliding(world: GameWorld, px: Float, py: Float): Boolean {
        val left = px - width / 2f
        val right = px + width / 2f
        val bottom = py - height
        val top = py

        return world.isSolidAt(left, bottom) ||
            world.isSolidAt(right, bottom) ||
            world.isSolidAt(left, top - 0.1f) ||
            world.isSolidAt(right, top - 0.1f)
    }
}
