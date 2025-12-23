"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import styles from "./drawing-canvas.module.css"

interface DrawingCanvasProps {
  isDrawingMode: boolean
  penColor: string
  onDrawingStart: () => void
  onClear: () => void
  isEraser: boolean
  onEraserToggle: () => void
  documentId: string // Add documentId for Yjs sync
}

interface Point {
  x: number
  y: number
  pressure: number
}

interface Stroke {
  points: Point[]
  color: string
  isEraser: boolean
  timestamp: number
}

export default function DrawingCanvas({
  isDrawingMode,
  penColor,
  onDrawingStart,
  onClear,
  isEraser,
  onEraserToggle,
  documentId,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPoint, setLastPoint] = useState<Point | null>(null)
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const lastTapTimeRef = useRef<number>(0)
  const tapCountRef = useRef<number>(0)

  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const yStrokesRef = useRef<Y.Array<Stroke> | null>(null)
  const isRemoteDrawRef = useRef(false)

  useEffect(() => {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider("ws://localhost:3001", `${documentId}-drawing`, ydoc)
    const yStrokes = ydoc.getArray<Stroke>("strokes")

    ydocRef.current = ydoc
    providerRef.current = provider
    yStrokesRef.current = yStrokes

    // Render existing strokes from Yjs
    const renderAllStrokes = () => {
      const canvas = canvasRef.current
      const ctx = contextRef.current
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      yStrokes.forEach((stroke) => {
        renderStroke(stroke, ctx)
      })
    }

    // Listen to new strokes from other users
    const observer = (event: Y.YArrayEvent<Stroke>) => {
      if (isRemoteDrawRef.current) return

      const ctx = contextRef.current
      if (!ctx) return

      event.changes.added.forEach((item) => {
        const stroke = item.content.getContent()[0] as Stroke
        renderStroke(stroke, ctx)
      })
    }

    yStrokes.observe(observer)
    renderAllStrokes()

    return () => {
      yStrokes.unobserve(observer)
      provider.destroy()
      ydoc.destroy()
    }
  }, [documentId])

  const renderStroke = (stroke: Stroke, ctx: CanvasRenderingContext2D) => {
    if (stroke.points.length < 2) return

    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i]
      const prevPoint = stroke.points[i - 1]

      const lineWidth = stroke.isEraser ? 10 + point.pressure * 20 : 1 + point.pressure * 5

      ctx.lineWidth = lineWidth

      if (stroke.isEraser) {
        ctx.globalCompositeOperation = "destination-out"
        ctx.strokeStyle = "rgba(0,0,0,1)"
      } else {
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = stroke.color
      }

      ctx.lineTo(point.x, point.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = canvas.parentElement
    if (!container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        contextRef.current = ctx
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  useEffect(() => {
    if (onClear && contextRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height)

      if (yStrokesRef.current) {
        yStrokesRef.current.delete(0, yStrokesRef.current.length)
      }
    }
  }, [onClear])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleDoubleTap = (e: PointerEvent) => {
      if (e.pointerType === "pen") {
        const currentTime = Date.now()
        const timeSinceLastTap = currentTime - lastTapTimeRef.current

        if (timeSinceLastTap < 300) {
          tapCountRef.current += 1
          if (tapCountRef.current === 2) {
            onEraserToggle()
            tapCountRef.current = 0
          }
        } else {
          tapCountRef.current = 1
        }

        lastTapTimeRef.current = currentTime
      }
    }

    canvas.addEventListener("pointerdown", handleDoubleTap)
    return () => canvas.removeEventListener("pointerdown", handleDoubleTap)
  }, [onEraserToggle])

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const isSurfacePenEraser = e.pointerType === "pen" && (e.button === 5 || e.buttons & 32)

    if (isSurfacePenEraser && !isEraser) {
      onEraserToggle()
    }

    if (e.pointerType === "pen" && !isDrawingMode) {
      onDrawingStart()
    }

    if (e.pointerType !== "pen" && !isDrawingMode) return

    if (e.pointerType === "touch") {
      e.preventDefault()
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const pressure = e.pressure || 0.5

    setIsDrawing(true)
    setLastPoint({ x, y, pressure })
    setCurrentStroke([{ x, y, pressure }]) // Start tracking stroke
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint || !contextRef.current) return

    const isSurfacePenEraser = e.pointerType === "pen" && e.buttons & 32

    if (e.pointerType === "touch") {
      e.preventDefault()
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const pressure = e.pressure || 0.5

    const ctx = contextRef.current

    const lineWidth = isEraser || isSurfacePenEraser ? 10 + pressure * 20 : 1 + pressure * 5

    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(x, y)

    if (isEraser || isSurfacePenEraser) {
      ctx.globalCompositeOperation = "destination-out"
      ctx.strokeStyle = "rgba(0,0,0,1)"
    } else {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = penColor
    }

    ctx.lineWidth = lineWidth
    ctx.stroke()

    setLastPoint({ x, y, pressure })
    setCurrentStroke((prev) => [...prev, { x, y, pressure }]) // Add point to stroke
  }

  const stopDrawing = () => {
    if (currentStroke.length > 1 && yStrokesRef.current) {
      isRemoteDrawRef.current = true
      const stroke: Stroke = {
        points: currentStroke,
        color: penColor,
        isEraser: isEraser,
        timestamp: Date.now(),
      }
      yStrokesRef.current.push([stroke])
      isRemoteDrawRef.current = false
    }

    setIsDrawing(false)
    setLastPoint(null)
    setCurrentStroke([])
  }

  return (
    <canvas
      ref={canvasRef}
      className={`${styles.canvas} ${isDrawingMode ? styles.active : ""}`}
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerLeave={stopDrawing}
      style={{ pointerEvents: isDrawingMode ? "auto" : "auto" }}
    />
  )
}
