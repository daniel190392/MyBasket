---
paths:
  - "**/*.kt"
  - "**/*.kts"
  - "apps/host-android/**/res/**"
  - "**/AndroidManifest.xml"
---

# Kotlin + Android conventions

Follow the official Kotlin coding conventions and Android Kotlin style guide.

## Naming

- Classes, objects, interfaces, enums: `PascalCase`. Functions and properties: `camelCase`. Constants (`const val`, top-level immutable): `UPPER_SNAKE_CASE`.
- Packages: all lowercase, no underscores (`com.mybasket.host`).
- Files containing a single class are named after it (`MainActivity.kt`). Files with several top-level declarations use a descriptive `PascalCase` name.
- Android components end with their role: `MainActivity`, `ProductAdapter`, `ProductRepository`.
- Resources: `snake_case` with a type prefix where applicable: layouts `activity_main.xml`, `fragment_product_list.xml`, drawables `ic_`/`bg_`, strings `product_list_title`, ids `snake_case`.
- Backing properties: `_state` (private mutable) exposed as `state` (read-only).

## Code

- Idiomatic Kotlin: `val` over `var`, data classes for models, sealed classes/interfaces for closed state sets, extension functions where they clarify, scope functions (`let`, `apply`) only when they reduce noise.
- Null safety: avoid `!!`; use safe calls, `?:` and early returns.
- Never hardcode user-facing strings; use `strings.xml`. Never hardcode dimensions or colors; use resources.
- Do not block the main thread. Use coroutines with structured concurrency; no `GlobalScope`.
- Declare visibility explicitly where it matters: default to the narrowest (`private`, `internal`).
- Respect Android lifecycles; avoid leaking `Context`/`Activity` references.
- Gradle: use the Kotlin DSL and centralize versions; no secrets in `gradle.properties` or `build.gradle.kts` committed to git.
