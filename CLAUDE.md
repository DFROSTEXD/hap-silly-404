# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static site deployed on Netlify with a custom 404 page that fetches a passive-aggressive roast from a Netlify serverless function. The function calls the Groq API (free tier, `llama-3.3-70b-versatile`) and falls back to hardcoded insults if the API is unavailable.

## Architecture

- `index.html` — landing page explaining the site
- `404.html` — the main attraction; fetches `/.netlify/functions/insult` on load, picks a random HAP pose from Cloudinary
- `css/style.css` — shared styles for both pages; all colors use `hsl()` via CSS custom properties prefixed `--hap-*`
- `netlify/functions/insult.mjs` — ES module serverless function (Netlify Functions v2); returns `{ insult, source }` JSON
- `netlify.toml` — sets publish root to `.`, functions directory, and the wildcard 404 redirect

## Environment variables

`GROQ_API_KEY` — required for live roasts; set in Netlify dashboard under site environment variables. `GROQ_MODEL` is optional (defaults to `llama-3.3-70b-versatile`).

## Local development

```bash
netlify dev
```

This starts a local server with functions support. Visit `http://localhost:8888/this-page-does-not-exist` to trigger the 404 page.

## HAP poses

Poses are served from Cloudinary (`res.cloudinary.com/cynthia-teeters`) under `canvas/hap/`. The 404 page picks randomly from four pose IDs defined in the `HAP_POSES` array in `404.html`. To add a pose, upload the image to Cloudinary at the correct path and add an entry to that array.
