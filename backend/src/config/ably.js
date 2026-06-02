import Ably from 'ably'

// ── Ably REST client (server-side publishing) ───────────────────────────────
// Used to publish events to channels from API routes / controllers.
// The Realtime client is only needed on the frontend; the server always
// uses Ably.Rest so we never hold a persistent WebSocket connection here.
const ably = new Ably.Rest({
  key: process.env.ABLY_API_KEY,
})

export default ably
