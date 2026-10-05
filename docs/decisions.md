# Architecture decisions

Last inspected: 2026-09-13. These entries record visible implementation choices, not reconstructed historical approval.

## Decision: mediasoup SFU with WebGL stage

Status: Accepted (implemented; historical rationale unavailable).

Context: Meet supports group media and a composited stage.
Decision: route media through mediasoup; render video through the WebGL compositor; keep React controls separate.
Why: documented project constraint; historical evaluation unavailable.
Alternatives: P2P mesh or DOM video grid are not selected; no comparative benchmark record exists.
Consequences: worker lifecycle, direct media ports, observer restrictions and resume sequencing must be preserved.
References: [rooms](../meet/src/rooms.ts), [compositor](../meet/web/src/lib/compositor.ts), [session](../meet/web/src/lib/session.ts).

## Decision: Chat as Meet credential authority

Status: Accepted (implemented; historical rationale unavailable).

Context: Meet needs corporate identity.
Decision: verify through Chat login, attempt token invalidation, issue independent Meet cookie session.
Why: existing shared identity integration; historical evaluation unavailable.
Alternatives: independent account store or external identity provider; neither is implemented here.
Consequences: Meet login depends on Chat availability; Meet session revocation/durability differs from Chat.
References: [auth](../meet/src/auth.ts), [security](security.md).

## Decision: independent app deployment boundaries

Status: Accepted (implemented; historical rationale unavailable).

Context: root coordinates apps and host configuration.
Decision: separate Chat/Meet manifests, gitlinks and Compose deployments.
Why: observed repository organization.
Alternatives: unified workspace/pipeline; not implemented.
Consequences: release each child separately; missing .gitmodules is unresolved bootstrap debt.
References: [architecture](architecture.md), [release](release.md).
