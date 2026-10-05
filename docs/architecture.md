# Architecture

Audience: engineers changing service boundaries. Source snapshot: [verification](verification.md).

## Implemented topology

| Subsystem | Entry points | State / boundary |
|---|---|---|
| Chat | [server](../chat/src/server.ts), [static client](../chat/public/index.html) | PostgreSQL messages/accounts; Redis sessions, stream fan-out and presence; upload volume |
| Meet | [server](../meet/src/server.ts), [React app](../meet/web/src/App.tsx) | In-process rooms, sessions, support registry; mediasoup workers; generated public assets |
| GitLab | [nginx vhost](../server/nginx-gitlab.conf) | External Omnibus service, upstream 127.0.0.1:6969 |
| Website | Separate sibling repository | Link/identity integration; not part of root build |
| Desktop/mobile | [Meet desktop](../meet/desktop/package.json), [Chat TWA](../chat/mobile/android-twa/package.json) | Separately packaged clients |

Chat uses uWebSockets HTTP/WS handlers, ChatStore ORM operations, and Broker Redis Streams envelopes. Redis fan-out supports multiple processes conceptually; upload sharing, rate limits, failure recovery and presence cleanup still need multi-instance verification.

Chat V2 candidate: XLSX previews run in bounded worker threads; voice is one-to-one encrypted audio over TURN with Chat signaling and a single-process call registry, disabled by default pending [release gates](../chat/deploy/TURN.md). It does not modify Meet's SFU or implement a group P2P mesh. Server compilation is described in [candidate notes](../chat/V2_RELEASE.md).

Meet sends HTTP and signaling through nginx, but RTP reaches UDP/TCP 40000–40099 directly. [rooms.ts](../meet/src/rooms.ts) owns media resources. [shared/protocol.ts](../meet/shared/protocol.ts) is the wire contract. [compositor.ts](../meet/web/src/lib/compositor.ts) draws video into WebGL2; React owns controls and overlays. Consumers start paused and resume after client attachment. Observers cannot produce.

Meet verifies credentials against Chat and attempts to revoke the temporary Chat bearer token. Its own cookie sessions are in memory. Restarting Meet loses sessions and active rooms. A health response does not prove media connectivity.

## Boundaries and uncertainty

FACT: root Git tracks Chat/Meet as mode-160000 gitlinks, but .gitmodules is absent. Independent clone/bootstrap automation is incomplete.
FACT: no root application manifest, active root Compose, or active CI workflow exists in this working tree.
UNKNOWN: durable Meet session requirements, TURN deployment, backup objectives, and production release ownership.

Related: [API](api.md), [database](database.md), [deployment](deployment.md), [decisions](decisions.md).
