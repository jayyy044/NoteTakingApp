"use client"

import styles from "./editor-toolbar.module.css"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  PenTool,
  Edit3,
  Eraser,
  WifiOff,
  Wifi,
} from "lucide-react"

interface EditorToolbarProps {
  onFormat: (command: string, value?: string) => void
  onFileUpload: () => void
  fontFamily: string
  setFontFamily: (font: string) => void
  fontSize: string
  setFontSize: (size: string) => void
  isDrawingMode: boolean
  onToggleDrawing: () => void
  penColor: string
  setPenColor: (color: string) => void
  onClearCanvas: () => void
  isEraser: boolean
  onToggleEraser: () => void
  connectionStatus: "connecting" | "connected" | "disconnected"
  documentId: string
}

const fonts = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
  "Trebuchet MS",
  "Impact",
]

const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px"]

export default function EditorToolbar({
  onFormat,
  onFileUpload,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  isDrawingMode,
  onToggleDrawing,
  penColor,
  setPenColor,
  onClearCanvas,
  isEraser,
  onToggleEraser,
  connectionStatus,
  documentId,
}: EditorToolbarProps) {
  const copyDocumentLink = () => {
    const url = `${window.location.origin}/editor/${documentId}`
    navigator.clipboard.writeText(url)
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.section}>
        <div className={styles.statusIndicator}>
          {connectionStatus === "connected" && (
            <>
              <Wifi size={16} className={styles.statusIcon} />
              <span className={styles.statusText}>Connected</span>
            </>
          )}
          {connectionStatus === "connecting" && (
            <>
              <Wifi size={16} className={styles.statusIconConnecting} />
              <span className={styles.statusText}>Connecting...</span>
            </>
          )}
          {connectionStatus === "disconnected" && (
            <>
              <WifiOff size={16} className={styles.statusIconDisconnected} />
              <span className={styles.statusText}>Disconnected</span>
            </>
          )}
        </div>
        <button className={styles.copyButton} onClick={copyDocumentLink} title="Copy Document Link">
          Share
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <button
          className={`${styles.button} ${isDrawingMode ? styles.active : ""}`}
          onClick={onToggleDrawing}
          title={isDrawingMode ? "Switch to Edit Mode" : "Switch to Draw Mode"}
        >
          {isDrawingMode ? <Edit3 size={18} /> : <PenTool size={18} />}
        </button>
      </div>

      <div className={styles.divider} />

      {isDrawingMode ? (
        <>
          <div className={styles.section}>
            <input
              type="color"
              className={styles.colorPicker}
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              title="Pen Color"
            />
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <button
              className={`${styles.button} ${isEraser ? styles.active : ""}`}
              onClick={onToggleEraser}
              title="Toggle Eraser"
            >
              <Eraser size={18} />
            </button>
            <button className={styles.button} onClick={onClearCanvas} title="Clear Drawing">
              <Eraser size={18} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.section}>
            <select className={styles.select} value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              {fonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>

            <select className={styles.select} value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <button className={styles.button} onClick={() => onFormat("bold")} title="Bold">
              <Bold size={18} />
            </button>
            <button className={styles.button} onClick={() => onFormat("italic")} title="Italic">
              <Italic size={18} />
            </button>
            <button className={styles.button} onClick={() => onFormat("underline")} title="Underline">
              <Underline size={18} />
            </button>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <input
              type="color"
              className={styles.colorPicker}
              onChange={(e) => onFormat("foreColor", e.target.value)}
              title="Text Color"
            />
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <button className={styles.button} onClick={() => onFormat("justifyLeft")} title="Align Left">
              <AlignLeft size={18} />
            </button>
            <button className={styles.button} onClick={() => onFormat("justifyCenter")} title="Align Center">
              <AlignCenter size={18} />
            </button>
            <button className={styles.button} onClick={() => onFormat("justifyRight")} title="Align Right">
              <AlignRight size={18} />
            </button>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <button className={styles.uploadButton} onClick={onFileUpload} title="Upload File">
              <Upload size={18} />
              <span>Upload File</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
