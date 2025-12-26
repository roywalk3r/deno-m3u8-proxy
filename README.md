# Deno M3U8 Proxy

Small Oak-based proxy that fetches HLS playlists, rewrites relative segment and manifest references, and relays media with cache-friendly headers. Runs locally via `deno run` and on Deno Deploy via `Deno.serve`.

## Features
- Proxies `.m3u8` playlists and HLS segments with an opt-in Referer header for the upstream.
- Rewrites relative lines in playlists so subsequent segment/manifest requests stay inside the proxy.
- CORS enabled for all responses to simplify browser playback.
- Cache-Control helper sets `public, max-age=3600, must-revalidate` when upstream does not provide one.
- Static assets (e.g., `.ts`, images, JS/CSS) pass through untouched while keeping original headers when possible.

## Prerequisites
- [Deno](https://deno.land/) installed.
- Network access to the upstream media host you intend to proxy.

## Run locally
```sh
deno run --allow-net server.js
```
The server listens on `http://localhost:4040`.

## Usage
Only one route is exposed:

- `GET /m3u8-proxy?url=<absolute_url>` — fetches the upstream resource and streams the response back.

Examples:
```sh
# Proxy a playlist
curl "http://localhost:4040/m3u8-proxy?url=https://example.com/path/video.m3u8"

# Proxy a segment or other static asset
curl -O "http://localhost:4040/m3u8-proxy?url=https://example.com/path/segment0.ts"
```

Behavior details:
- For playlists (`.m3u8`) the proxy rewrites any relative `.m3u8` or `.ts` line to point back through `/m3u8-proxy`, preserving the original base URL.
- Lines ending with common static extensions listed in `utils/line-transform.js` are also rewritten to ensure they route back through the proxy.
- When the upstream response lacks `Content-Length` (typical for chunked playlists), it is removed to avoid mismatches while streaming.
- A permissive `access-control-allow-origin: *` header is added on every proxied response.

## Configuration notes
- Port is set in `server.js` (`4040` by default).
- Default cache duration is one hour; adjust the argument to `cacheRoutes` in `server.js` if you need a different max-age.
- The allowed static extensions list lives in `utils/line-transform.js` (`allowedExtensions`) if you need to support additional asset types.
- The upstream Referer header (`https://megacloud.club/`) is hardcoded in `utils/m3u8-proxy.js`; change it if your source requires a different value.

## Project structure
- `server.js` — Bootstraps Oak, wires middleware, starts `Deno.serve`.
- `routes/routes.js` — Exposes the `/m3u8-proxy` route.
- `utils/m3u8-proxy.js` — Core proxy handler, fetches upstream, manages headers, streams responses.
- `utils/line-transform.js` — Transform stream that rewrites playlist lines to stay within the proxy.
- `utils/cache-routes.js` — Middleware that applies cache headers when none are set upstream.
- `import_map.json` — Maps `oak/` to the pinned Oak version.

## Deployment tips
- Works as-is on Deno Deploy because it uses `Deno.serve` (port is ignored by Deploy).
- If exposing publicly, consider restricting allowed hostnames and tightening CORS to avoid becoming an open proxy.

