import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"

export function createYjsProvider(documentId: string) {
  const ydoc = new Y.Doc()

  const provider = new WebsocketProvider("ws://localhost:3001", documentId, ydoc)

  return { ydoc, provider }
}
