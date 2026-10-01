# Git

## Pushing to the repository

Claude **must never run `git push` on its own**, under any circumstance. Before any push (including `--force`, `--tags`, pushing new branches, and `gh pr create` when it uploads the branch) it must ask the user for explicit authorization and wait for the answer.

- Authorization applies to that specific push only; it does not extend to later pushes.
- Creating local commits does not imply permission to push them.
- Before asking for authorization, state the target branch and which commits would be pushed.
