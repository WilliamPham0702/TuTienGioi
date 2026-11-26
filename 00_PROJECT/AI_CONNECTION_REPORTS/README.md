# AI Connection Reports

Shared status location for each AI's self-verification report. ChatGPT checks this directory directly when asked to check AI connectivity.

## Report files
- `chatgpt.md`
- `claude.md`
- `copilot.md`
- `deepseek.md`
- `gemini.md`

## Status rules
- `CONNECTED`: repository and required workflow docs read; workflow understood; report saved to this repo.
- `PARTIAL`: some required access/read checks failed or write access not verified.
- `NOT_CONNECTED`: repository cannot be accessed/read.
- Report existence is not proof of GitHub write access unless the AI successfully committed its report.
- Reports are self-reported; ChatGPT should corroborate accessible file/commit evidence where possible.

When user asks to check AI connections, inspect this directory and report files from GitHub directly. Do not ask the user to copy AI responses.
