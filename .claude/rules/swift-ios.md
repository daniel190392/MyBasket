---
paths:
  - "**/*.swift"
  - "apps/host-ios/**"
---

# Swift + iOS conventions

Follow the Swift API Design Guidelines.

## Naming

- Types and protocols: `UpperCamelCase`. Functions, properties, variables, enum cases: `lowerCamelCase`.
- Clarity at the point of use: argument labels read as phrases (`remove(at:)`, `add(_:to:)`). Omit needless words.
- Booleans read as assertions: `isEmpty`, `hasExpired`. Protocols describing a capability end in `-able`/`-ing`; protocols describing what something is read as nouns.
- Files are named after the main type they declare.

## Code

- `let` over `var`; value types (`struct`, `enum`) by default, classes only when identity or reference semantics are needed.
- Avoid force unwrapping (`!`) and `try!`/`as!`; use `guard let`, `if let`, `??` and proper error handling.
- Prefer `async/await` over completion handlers; keep UI work on `@MainActor`.
- Use access control deliberately (`private`, `fileprivate`, `internal`); default to the narrowest.
- Avoid retain cycles: `[weak self]` in escaping closures where appropriate.
- No hardcoded user-facing strings; use localization (`String(localized:)` / string catalogs).
- Do not commit secrets, `GoogleService-Info.plist` or signing material.
