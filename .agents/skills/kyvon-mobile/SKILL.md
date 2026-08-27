---
name: kyvon-mobile
description: Guides development and auditing of mobile-first 320px-425px UI with Lit-HTML, Tailwind, KaTeX, and WebMCP browser tools.
---

# KYVON Mobile-Core UI Skill

Use this skill when building or refactoring frontend interfaces for iOS Safari, WebKit, and Blink PWAs.

## Core Rules & Patterns

1. **Safe-Area Dynamic Viewports**:
   - Never use fixed `100vh` on mobile. Use `h-[100dvh]` to account for dynamic address bars.
   - Always apply `pb-[max(0.75rem,env(safe-area-inset-bottom))]` on bottom action bars.

2. **Touch Targets & Overflow**:
   - Ensure all interactive elements have minimum dimensions of $44 \times 44\text{px}$ (`min-h-[44px] min-w-[44px]`).
   - Prevent horizontal document scroll by using `overflow-x-hidden` on parent containers and `overflow-x-auto` on code/KaTeX blocks.

3. **WebMCP Browser Agent Tools**:
   ```typescript
   if ((document as any).modelContext?.registerTool) {
     (document as any).modelContext.registerTool({
       name: 'get_system_telemetry',
       description: 'Retrieve live 1,200 vector verification telemetry.',
       execute: () => ({ status: 'active', vectors: 1200 })
     });
   }
   ```
