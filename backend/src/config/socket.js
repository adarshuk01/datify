// ── socket.js ──────────────────────────────────────────────────────────────
// Legacy compatibility shim.
//
// This file previously contained standalone Ably publish functions.
// All logic has been consolidated into chatController.js so every publish
// goes through one place (REST endpoint → save to DB → publish to Ably).
//
// The only function still needed here is emitNewMatch, which is called from
// userController when two users match — there is no HTTP route for that event.

import ably from './ably.js'

const ablyPublish = async (channelName, eventName, payload) => {
  try {
    await ably.channels.get(channelName).publish(eventName, payload)
  } catch (err) {
    console.error(`[Ably] publish failed → ${channelName}:${eventName}`, err.message)
  }
}

// ── Notify both users when they become a mutual match ──────────────────────
// Called directly from userController (likeUser / superLikeUser) after a
// match is created. No HTTP endpoint needed — it's a pure side-effect.
export const emitNewMatch = async (userAId, userBId) => {
  await Promise.allSettled([
    ablyPublish(`user:${String(userAId)}`, 'new:match', { matchedWith: String(userBId) }),
    ablyPublish(`user:${String(userBId)}`, 'new:match', { matchedWith: String(userAId) }),
  ])
}
