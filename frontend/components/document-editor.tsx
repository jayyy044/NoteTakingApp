"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import EditorToolbar from "./editor-toolbar"
import DrawingCanvas from "./drawing-canvas"
import styles from "./document-editor.module.css"

interface DocumentEditorProps {
  documentId: string
}

export default function DocumentEditor({ documentId }: DocumentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontSize, setFontSize] = useState("16px")
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [penColor, setPenColor] = useState("#000000")
  const [clearCanvas, setClearCanvas] = useState(0)
  const [isEraser, setIsEraser] = useState(false)

  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const yTextRef = useRef<Y.Text | null>(null)
  const isRemoteUpdateRef = useRef(false)

  useEffect(() => {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider("ws://localhost:3001", documentId, ydoc)
    const yText = ydoc.getText("content")

    ydocRef.current = ydoc
    providerRef.current = provider
    yTextRef.current = yText

    // Listen to connection status
    provider.on("status", (event: { status: string }) => {
      console.log("[v0] Yjs connection status:", event.status)
      setConnectionStatus(event.status as "connecting" | "connected" | "disconnected")
    })

    // Sync initial content from Yjs to editor
    if (editorRef.current && yText.length > 0) {
      isRemoteUpdateRef.current = true
      editorRef.current.innerHTML = yText.toString()
      isRemoteUpdateRef.current = false
    }

    // Listen to Yjs text changes and update editor
    const observer = () => {
      if (editorRef.current && !isRemoteUpdateRef.current) {
        isRemoteUpdateRef.current = true
        const currentContent = editorRef.current.innerHTML
        const yjsContent = yText.toString()

        if (currentContent !== yjsContent) {
          const selection = window.getSelection()
          const range = selection?.rangeCount ? selection.getRangeAt(0) : null
          const startOffset = range?.startOffset || 0

          editorRef.current.innerHTML = yjsContent

          // Restore cursor position
          if (range && selection) {
            try {
              const newRange = document.createRange()
              const textNode = editorRef.current.firstChild
              if (textNode) {
                newRange.setStart(textNode, Math.min(startOffset, textNode.textContent?.length || 0))
                newRange.collapse(true)
                selection.removeAllRanges()
                selection.addRange(newRange)
              }
            } catch (e) {
              // Ignore cursor position errors
            }
          }
        }
        isRemoteUpdateRef.current = false
      }
    }

    yText.observe(observer)

    return () => {
      yText.unobserve(observer)
      provider.destroy()
      ydoc.destroy()
    }
  }, [documentId])

  const handleInput = () => {
    if (!editorRef.current || !yTextRef.current || isRemoteUpdateRef.current) return

    const content = editorRef.current.innerHTML
    const yText = yTextRef.current

    if (content !== yText.toString()) {
      yText.delete(0, yText.length)
      yText.insert(0, content)
    }
  }

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault()
        const blob = items[i].getAsFile()
        if (blob) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const img = document.createElement("img")
            img.src = event.target?.result as string
            img.className = styles.pastedImage

            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0)
              range.insertNode(img)
              range.collapse(false)
            }
            handleInput()
          }
          reader.readAsDataURL(blob)
        }
      }
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    if (file.type.startsWith("image/")) {
      reader.onload = (event) => {
        const img = document.createElement("img")
        img.src = event.target?.result as string
        img.className = styles.uploadedImage
        editorRef.current?.appendChild(img)
        handleInput()
      }
      reader.readAsDataURL(file)
    } else if (file.type === "text/plain") {
      reader.onload = (event) => {
        const text = event.target?.result as string
        const pre = document.createElement("pre")
        pre.textContent = text
        pre.className = styles.uploadedText
        editorRef.current?.appendChild(pre)
        handleInput()
      }
      reader.readAsText(file)
    }
  }

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.fontFamily = fontFamily
      editorRef.current.style.fontSize = fontSize
    }
  }, [fontFamily, fontSize])

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode)
    if (isDrawingMode && editorRef.current) {
      editorRef.current.focus()
    }
  }

  const handleDrawingStart = () => {
    setIsDrawingMode(true)
  }

  const handleClearCanvas = () => {
    setClearCanvas((prev) => prev + 1)
  }

  const toggleEraser = () => {
    setIsEraser(!isEraser)
  }

  return (
    <div className={styles.container}>
      <EditorToolbar
        onFormat={applyFormat}
        onFileUpload={handleFileUpload}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
        isDrawingMode={isDrawingMode}
        onToggleDrawing={toggleDrawingMode}
        penColor={penColor}
        setPenColor={setPenColor}
        onClearCanvas={handleClearCanvas}
        isEraser={isEraser}
        onToggleEraser={toggleEraser}
        connectionStatus={connectionStatus}
        documentId={documentId}
      />

      <div className={styles.editorWrapper}>
        <DrawingCanvas
          isDrawingMode={isDrawingMode}
          penColor={penColor}
          onDrawingStart={handleDrawingStart}
          onClear={clearCanvas}
          isEraser={isEraser}
          onEraserToggle={toggleEraser}
          documentId={documentId}
        />

        <div
          ref={editorRef}
          contentEditable={!isDrawingMode}
          className={styles.editor}
          onPaste={handlePaste}
          onInput={handleInput}
          suppressContentEditableWarning
          style={{ pointerEvents: isDrawingMode ? "none" : "auto" }}
        >
          <p>Start typing your document here...</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.txt"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  )
}
