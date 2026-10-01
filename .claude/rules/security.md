# Security

## No secrets in code

Never write any key, secret or credential that could become a security breach in code, in versioned configuration files, or in commit messages. This includes:

- API keys, tokens, passwords, OAuth client secrets
- Keystores and their passwords (`.jks`, `.keystore`), certificates and private keys (`.p12`, `.pem`, `.key`)
- Third-party service files containing keys (`google-services.json`, `GoogleService-Info.plist`) and `local.properties`
- Connection strings with a username/password

Sensitive values must live outside the repo (environment variables, local files ignored by git, a secrets manager) and the code only reads them. When the configuration needs to be documented, use an example file with fake values (for example `.env.example`).

## Check before every commit

Before creating any commit, Claude must:

1. Review the content being committed (`git diff --cached`, or `git diff` plus new files if nothing is staged yet) looking for secrets: long token-like strings, `apiKey`, `secret`, `password`, `token`, `Authorization`, `BEGIN PRIVATE KEY`, URLs with credentials.
2. Confirm that no sensitive files from the list above are being added, and that any that exist locally are in `.gitignore`.
3. If anything looks suspicious, **do not commit**: tell the user the file and line, and propose moving it out of the code.
4. State in the response that the check was done and its result.

If a secret was already pushed to the history, tell the user: it must be revoked/rotated, removing it from the code is not enough.
