# KYVON Mobile-Core Rule (320px–425px Breakpoint Priority)
- Viewport: `h-[100dvh]` root, `pb-[max(0.5rem,env(safe-area-inset-bottom))]`.
- Zero horizontal drift: `overflow-x-hidden` on roots, `break-words` on typography.
- Scrollers: Code and tables must use dedicated `overflow-x-auto`.
- Touch target minimum: 44x44px.
