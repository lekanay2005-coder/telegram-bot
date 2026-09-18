# Drips Wave bot

Telegram bot that watches GitHub repos for new issues, creates branches on request, and logs every action back into your Telegram chat so the chat doubles as your activity dashboard.

## What it does

- Polls your watched repos on GitHub every N minutes for new open issues, and messages you when one appears
- `/newbranch owner/repo branch-name [issue#]` creates a branch off the repo's default branch via the GitHub API
- Every action (new issue seen, branch created, error, reminder) is written to SQLite and pushed to your Telegram chat — nothing happens silently
- A daily cron reminder nudges you to check pending applications / PRs / withdrawal test transactions (Drips Wave has no API, so applying and withdrawing stay manual — see commands below for what the bot can and can't do)

## Setup

1. **Create the bot**: message [@BotFather](https://t.me/BotFather) on Telegram, `/newbot`, copy the token.
2. **Get your Telegram user id**: message [@userinfobot](https://t.me/userinfobot).
3. **Create a GitHub token**: Settings → Developer settings → Personal access tokens. Classic token needs `repo` scope (or fine-grained: Contents read/write) on the repos you want to watch.
4. Copy `.env.example` to `.env` and fill in the values:
   ```
   cp .env.example .env
   ```
5. Install and run:
   ```
   npm install
   npm start
   ```

## Commands

| Command | What it does |
|---|---|
| `/start` | Shows the command list |
| `/repos` | Lists watched repos (from `WATCHED_REPOS`) |
| `/checknow` | Polls GitHub immediately instead of waiting for the interval |
| `/newbranch owner/repo branch-name [issue#]` | Creates a branch off the default branch |
| `/branches` | Recent branches the bot created |
| `/log` | Recent activity (issues seen, branches, errors, reminders) |

## What's intentionally manual

Drips Wave has no public API, so the bot can't do these — they need your logged-in, KYC'd session:
- Applying to an issue on drips.network/wave
- Requesting the test transaction / full withdrawal

The bot's job is to surface new issues fast and keep a running log so you never lose track — the apply/withdraw click is still yours.

## Notes

- The bot only responds to your `TELEGRAM_OWNER_ID` — everyone else is silently ignored.
- SQLite file (`bot.db`) is created automatically in the project root; it's what prevents duplicate "new issue" alerts.
- For always-on hosting, run this on a small VPS or a service like Railway/Fly.io with `npm start` as the start command, or wrap it in `pm2`/`systemd` for restarts.
