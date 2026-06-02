// ── socketService.js ────────────────────────────────────────────────────────
// This file is now a re-export shim for ablyService.js.
// All imports of socketService throughout the app continue to work unchanged.
export {
  connectSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  sendSocketMessage,
  emitTypingStart,
  emitTypingStop,
  getSocket,
} from './ablyService'
