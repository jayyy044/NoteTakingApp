// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');
// const Y = require('yjs');
// const cors = require('cors');
// require('dotenv').config();

// const { saveDocument, loadDocument } = require('./utils/supabase');

// const app = express();
// app.use(cors());
// app.use(express.json());

// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// // Store active documents in memory
// const docs = new Map();
// const docConnections = new Map(); // Track connections per document

// // Persistence configuration
// const PERSISTENCE_INTERVAL = 30000; // Save every 30 seconds
// const persistenceTimers = new Map();

// // WebSocket connection handler
// wss.on('connection', (conn, req) => {
//   console.log('New WebSocket connection');
  
//   // Get document name from URL
//   const docName = req.url.slice(1) || 'default';
//   console.log(`Client connected to document: ${docName}`);
  
//   // Load or create document
//   let ydoc;
//   if (!docs.has(docName)) {
//     ydoc = new Y.Doc();
//     docs.set(docName, ydoc);
//     docConnections.set(docName, new Set());
    
//     // Load from database
//     loadDocument(docName).then(data => {
//       if (data) {
//         console.log(`Loaded document from database: ${docName}`);
//         Y.applyUpdate(ydoc, data);
        
//         // Send the loaded state to the client
//         const update = Y.encodeStateAsUpdate(ydoc);
//         if (conn.readyState === WebSocket.OPEN) {
//           conn.send(JSON.stringify({ type: 'sync', update: Array.from(update) }));
//         }
//       }
//     }).catch(err => {
//       console.error(`Error loading document ${docName}:`, err);
//     });

//     // Set up auto-save
//     setupPersistence(docName, ydoc);
//   } else {
//     ydoc = docs.get(docName);
    
//     // Send current state to new client
//     const update = Y.encodeStateAsUpdate(ydoc);
//     if (conn.readyState === WebSocket.OPEN) {
//       conn.send(JSON.stringify({ type: 'sync', update: Array.from(update) }));
//     }
//   }

//   // Add connection to document's connection set
//   const connections = docConnections.get(docName);
//   connections.add(conn);

//   // Handle incoming messages
//   conn.on('message', (message) => {
//     try {
//       const data = JSON.parse(message);
      
//       if (data.type === 'update') {
//         // Apply the update to the document
//         const update = new Uint8Array(data.update);
//         Y.applyUpdate(ydoc, update);
        
//         // Broadcast to all other clients connected to this document
//         connections.forEach(client => {
//           if (client !== conn && client.readyState === WebSocket.OPEN) {
//             client.send(message);
//           }
//         });
//       }
//     } catch (err) {
//       console.error('Error handling message:', err);
//     }
//   });

//   // Listen to document updates and broadcast
//   const updateHandler = (update, origin) => {
//     // Don't broadcast if the update came from a client
//     if (origin !== conn) {
//       const updateArray = Array.from(update);
//       const message = JSON.stringify({ type: 'update', update: updateArray });
      
//       connections.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//           client.send(message);
//         }
//       });
//     }
//   };
  
//   ydoc.on('update', updateHandler);

//   conn.on('close', () => {
//     console.log('WebSocket connection closed');
//     connections.delete(conn);
//     ydoc.off('update', updateHandler);
    
//     // Clean up if no more connections
//     if (connections.size === 0) {
//       console.log(`No more connections for ${docName}, keeping in memory for now`);
//     }
//   });

//   conn.on('error', (err) => {
//     console.error('WebSocket error:', err);
//   });
// });

// // Set up automatic persistence for a document
// function setupPersistence(docName, ydoc) {
//   const timer = setInterval(async () => {
//     try {
//       const update = Y.encodeStateAsUpdate(ydoc);
//       await saveDocument(docName, update);
//       console.log(`Auto-saved document: ${docName}`);
//     } catch (err) {
//       console.error(`Error auto-saving document ${docName}:`, err);
//     }
//   }, PERSISTENCE_INTERVAL);

//   persistenceTimers.set(docName, timer);

//   // Save on document update (debounced)
//   let saveTimeout;
//   ydoc.on('update', () => {
//     clearTimeout(saveTimeout);
//     saveTimeout = setTimeout(async () => {
//       try {
//         const update = Y.encodeStateAsUpdate(ydoc);
//         await saveDocument(docName, update);
//         console.log(`Saved document update: ${docName}`);
//       } catch (err) {
//         console.error(`Error saving document ${docName}:`, err);
//       }
//     }, 2000); // Save 2 seconds after last edit
//   });
// }

// // REST API endpoints
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'ok', 
//     activeDocuments: docs.size,
//     connections: wss.clients.size 
//   });
// });

// // Get list of documents
// app.get('/api/documents', async (req, res) => {
//   try {
//     const { listDocuments } = require('./utils/supabase');
//     const documents = await listDocuments();
//     res.json({ documents });
//   } catch (err) {
//     console.error('Error listing documents:', err);
//     res.status(500).json({ error: 'Failed to list documents' });
//   }
// });

// // Manual save endpoint
// app.post('/api/documents/:name/save', async (req, res) => {
//   const docName = req.params.name;
//   const ydoc = docs.get(docName);
  
//   if (!ydoc) {
//     return res.status(404).json({ error: 'Document not found' });
//   }

//   try {
//     const update = Y.encodeStateAsUpdate(ydoc);
//     await saveDocument(docName, update);
//     res.json({ success: true, message: 'Document saved' });
//   } catch (err) {
//     console.error('Error saving document:', err);
//     res.status(500).json({ error: 'Failed to save document' });
//   }
// });

// // Cleanup on shutdown
// process.on('SIGINT', async () => {
//   console.log('Shutting down gracefully...');
  
//   // Clear all persistence timers
//   for (const timer of persistenceTimers.values()) {
//     clearInterval(timer);
//   }

//   // Save all documents
//   const savePromises = [];
//   for (const [docName, ydoc] of docs.entries()) {
//     const update = Y.encodeStateAsUpdate(ydoc);
//     savePromises.push(saveDocument(docName, update));
//   }
  
//   await Promise.all(savePromises);
//   console.log('All documents saved');
  
//   process.exit(0);
// });

// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`WebSocket server ready at ws://localhost:${PORT}`);
// });
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Y = require('yjs');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const cors = require('cors');
require('dotenv').config();

const { saveDocument, loadDocument } = require('./utils/supabase');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store active documents in memory
const docs = new Map();
const docConnections = new Map();
const awarenessStates = new Map();

// Persistence configuration
const PERSISTENCE_INTERVAL = 30000;
const persistenceTimers = new Map();

// Message types
const messageSync = 0;
const messageAwareness = 1;

wss.on('connection', (conn, req) => {
  console.log('New WebSocket connection');
  
  const docName = req.url.slice(1) || 'default';
  console.log(`Client connected to document: ${docName}`);
  
  // Get or create document
  let ydoc;
  let awareness;
  
  if (!docs.has(docName)) {
    ydoc = new Y.Doc();
    docs.set(docName, ydoc);
    docConnections.set(docName, new Set());
    
    // Create awareness
    awareness = new awarenessProtocol.Awareness(ydoc);
    awarenessStates.set(docName, awareness);
    
    // Load from database
    loadDocument(docName).then(data => {
      if (data) {
        console.log(`Loaded document from database: ${docName}`);
        Y.applyUpdate(ydoc, data);
      }
    }).catch(err => {
      console.error(`Error loading document ${docName}:`, err);
    });

    setupPersistence(docName, ydoc);
  } else {
    ydoc = docs.get(docName);
    awareness = awarenessStates.get(docName);
  }

  const connections = docConnections.get(docName);
  connections.add(conn);

  // Send sync step 1
  const encoderSync = encoding.createEncoder();
  encoding.writeVarUint(encoderSync, messageSync);
  syncProtocol.writeSyncStep1(encoderSync, ydoc);
  conn.send(encoding.toUint8Array(encoderSync));

  // Send awareness states
  const encoderAwareness = encoding.createEncoder();
  encoding.writeVarUint(encoderAwareness, messageAwareness);
  encoding.writeVarUint8Array(
    encoderAwareness,
    awarenessProtocol.encodeAwarenessUpdate(
      awareness,
      Array.from(awareness.getStates().keys())
    )
  );
  conn.send(encoding.toUint8Array(encoderAwareness));

  // Handle messages
  conn.on('message', (message) => {
    try {
      const encoder = encoding.createEncoder();
      const decoder = decoding.createDecoder(new Uint8Array(message));
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync:
          encoding.writeVarUint(encoder, messageSync);
          const syncMessageType = syncProtocol.readSyncMessage(
            decoder,
            encoder,
            ydoc,
            conn
          );
          if (encoding.length(encoder) > 1) {
            conn.send(encoding.toUint8Array(encoder));
          }
          break;
          
        case messageAwareness:
          awarenessProtocol.applyAwarenessUpdate(
            awareness,
            decoding.readVarUint8Array(decoder),
            conn
          );
          break;
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  // Broadcast updates to other clients
  const updateHandler = (update, origin) => {
    if (origin !== conn) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);
      
      connections.forEach(client => {
        if (client !== conn && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  };

  ydoc.on('update', updateHandler);

  // Broadcast awareness changes
  const awarenessChangeHandler = ({ added, updated, removed }, origin) => {
    const changedClients = added.concat(updated).concat(removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
    );
    const message = encoding.toUint8Array(encoder);
    
    connections.forEach(client => {
      if (client !== origin && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  awareness.on('update', awarenessChangeHandler);

  conn.on('close', () => {
    console.log('WebSocket connection closed');
    connections.delete(conn);
    ydoc.off('update', updateHandler);
    awareness.off('update', awarenessChangeHandler);
    
    // Remove awareness state
    awarenessProtocol.removeAwarenessStates(
      awareness,
      Array.from(awareness.getStates().keys()).filter(
        clientId => awareness.meta.get(clientId).conn === conn
      ),
      null
    );
  });

  conn.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

function setupPersistence(docName, ydoc) {
  const timer = setInterval(async () => {
    try {
      const update = Y.encodeStateAsUpdate(ydoc);
      await saveDocument(docName, update);
      console.log(`Auto-saved document: ${docName}`);
    } catch (err) {
      console.error(`Error auto-saving document ${docName}:`, err);
    }
  }, PERSISTENCE_INTERVAL);

  persistenceTimers.set(docName, timer);

  let saveTimeout;
  ydoc.on('update', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      try {
        const update = Y.encodeStateAsUpdate(ydoc);
        await saveDocument(docName, update);
        console.log(`Saved document update: ${docName}`);
      } catch (err) {
        console.error(`Error saving document ${docName}:`, err);
      }
    }, 2000);
  });
}

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeDocuments: docs.size,
    connections: wss.clients.size 
  });
});

app.get('/api/documents', async (req, res) => {
  try {
    const { listDocuments } = require('./utils/supabase');
    const documents = await listDocuments();
    res.json({ documents });
  } catch (err) {
    console.error('Error listing documents:', err);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

app.post('/api/documents/:name/save', async (req, res) => {
  const docName = req.params.name;
  const ydoc = docs.get(docName);
  
  if (!ydoc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  try {
    const update = Y.encodeStateAsUpdate(ydoc);
    await saveDocument(docName, update);
    res.json({ success: true, message: 'Document saved' });
  } catch (err) {
    console.error('Error saving document:', err);
    res.status(500).json({ error: 'Failed to save document' });
  }
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  
  for (const timer of persistenceTimers.values()) {
    clearInterval(timer);
  }

  const savePromises = [];
  for (const [docName, ydoc] of docs.entries()) {
    const update = Y.encodeStateAsUpdate(ydoc);
    savePromises.push(saveDocument(docName, update));
  }
  
  await Promise.all(savePromises);
  console.log('All documents saved');
  
  process.exit(0);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready at ws://localhost:${PORT}`);
});