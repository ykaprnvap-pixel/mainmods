package com.mainmods.terrariaclone

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.view.MotionEvent
import android.view.SurfaceHolder
import android.view.SurfaceView

class SandboxGameView(context: Context) : SurfaceView(context), SurfaceHolder.Callback, Runnable {
    private val world = GameWorld()
    private val player = Player(30f, 90f)

    @Volatile
    private var running = false
    private var gameThread: Thread? = null

    private val skyPaint = Paint().apply { color = Color.rgb(113, 190, 252) }
    private val grassPaint = Paint().apply { color = Color.rgb(80, 180, 70) }
    private val dirtPaint = Paint().apply { color = Color.rgb(133, 92, 57) }
    private val stonePaint = Paint().apply { color = Color.rgb(100, 100, 100) }
    private val playerPaint = Paint().apply { color = Color.rgb(250, 220, 120) }
    private val uiPaint = Paint().apply {
        color = Color.WHITE
        textSize = 42f
        isAntiAlias = true
    }

    private var moveAxis = 0f
    private var jumpPressed = false
    private var cameraX = 0f

    private val tileSize = 48f

    init {
        holder.addCallback(this)
        isFocusable = true
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        resume()
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) = Unit

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        pause()
    }

    override fun run() {
        var last = System.nanoTime()
        while (running) {
            val now = System.nanoTime()
            val delta = ((now - last) / 1_000_000_000f).coerceAtMost(0.033f)
            last = now

            update(delta)
            drawFrame()
        }
    }

    private fun update(delta: Float) {
        player.update(world, moveAxis, jumpPressed, delta)
        jumpPressed = false

        cameraX = (player.x * tileSize - width / 2f).coerceIn(0f, world.width * tileSize - width)
    }

    private fun drawFrame() {
        val canvas = holder.lockCanvas() ?: return
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), skyPaint)

        val tilesInX = width / tileSize.toInt() + 3
        val startTileX = (cameraX / tileSize).toInt()

        for (x in startTileX until startTileX + tilesInX) {
            for (y in 0 until world.height) {
                val tile = world.getTile(x, y)
                if (tile == TileType.AIR) continue

                val drawX = x * tileSize - cameraX
                val drawY = height - ((y + 1) * tileSize)
                val paint = when (tile) {
                    TileType.GRASS -> grassPaint
                    TileType.DIRT -> dirtPaint
                    else -> stonePaint
                }
                canvas.drawRect(drawX, drawY, drawX + tileSize, drawY + tileSize, paint)
            }
        }

        val px = player.x * tileSize - cameraX
        val pyTop = height - (player.y * tileSize)
        val pyBottom = pyTop + player.height * tileSize
        canvas.drawRect(px - 16f, pyTop, px + 16f, pyBottom, playerPaint)

        canvas.drawText("←/→ двигаться | центр: прыжок", 30f, 50f, uiPaint)
        canvas.drawText("ЛКМ: ломать | ПКМ: ставить", 30f, 96f, uiPaint)

        holder.unlockCanvasAndPost(canvas)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.pointerCount > 1) return true

        if (event.action == MotionEvent.ACTION_UP) {
            moveAxis = 0f
            return true
        }

        val x = event.x
        val y = event.y
        val w = width.toFloat()
        val h = height.toFloat()

        when {
            y > h * 0.65f && x < w * 0.33f -> moveAxis = -1f
            y > h * 0.65f && x > w * 0.66f -> moveAxis = 1f
            y > h * 0.65f -> jumpPressed = true
            else -> {
                val worldX = ((x + cameraX) / tileSize).toInt()
                val worldY = ((h - y) / tileSize).toInt()
                if (event.action == MotionEvent.ACTION_DOWN) {
                    world.breakBlock(worldX, worldY)
                } else {
                    world.placeBlock(worldX, worldY)
                }
            }
        }

        return true
    }

    fun resume() {
        if (running) return
        running = true
        gameThread = Thread(this)
        gameThread?.start()
    }

    fun pause() {
        running = false
        gameThread?.join(400)
        gameThread = null
    }
}
