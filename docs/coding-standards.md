# Coding standards

Audience: implementers. Last inspected: 2026-09-13; [verification](verification.md).

Both server tsconfigs enforce strict, noUncheckedIndexedAccess, noImplicitOverride and noEmit. Use unknown at untrusted boundaries, narrow object fields, and use discriminated unions for wire messages. Preserve exact roles and enum values. Do not add any casts to bypass validation.

Observed conventions: camelCase variables/functions, PascalCase types/classes, uppercase constants; explicit interfaces for serialized records; ESM imports with .js paths in Node TypeScript. Chat uses single quotes; Meet mostly double quotes. Match the affected file rather than bulk formatting. No repository-wide formatter or linter is configured.

Use small async functions and await operations whose failures affect responses. Handle detached promises deliberately. In uWebSockets, copy request fields synchronously, register onAborted, and never write after abort. Validate before persistence/broadcast; enforce membership and role at the server, not UI visibility. Keep conditional branches and switches exhaustive where protocol unions allow it. Avoid mutating shared state from render functions.

Prisma access belongs in ChatStore; catch P2002 only for intentional uniqueness handling. Wire conversion must omit password hashes and conceal deleted-message content. React state belongs to control state, not per-frame rendering; WebGL owns video frames. Existing Meet UI uses Tailwind and CSS, including inline style properties; the older “Tailwind exclusively/no inline styles” prose was aspirational, not a description of all source.

Use text nodes/React escaping for user text. MIME or filename validation alone is not output encoding. Log operation identifiers and sanitized context; use Meet's structured redactor where applicable. Never log secrets. Comments explain lifetime, constraints, and tradeoffs, not unverified guarantees.

Related: [patterns](../.agent/patterns/README.md), [security](security.md), [testing](testing.md).
