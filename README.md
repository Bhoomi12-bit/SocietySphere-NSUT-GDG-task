# SocietySphere — NSUT

A static, mobile-first society discovery and recruitment platform for NSUT. Built with HTML5, CSS3, vanilla JavaScript and JSON.

## Run

```bash
npm start
```

The server listens on port `3000` and serves dynamic society routes through SPA fallback.

## Public-source approach

`data/societies.json` stores source-backed summaries, activities, roles and official/public profile links for six real NSUT societies. Stable reusable profile image files were not established during research, so the UI uses an explicit initials/icon treatment instead of hotlinking questionable assets. Every detail page carries the source and fallback note.

The recruitment countdown is intentionally marked as a demo. Applications are client-side only; successful submissions are logged to the browser console and shown as an inline confirmation.
