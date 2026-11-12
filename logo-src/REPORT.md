# Scholarship provider logos: report

Run date: 2026-11-12. All requests used `curl -L --max-time 40` with the Safari
User-Agent, `Accept` and `Accept-Language` headers given in the task.

## Summary

| # | Provider | Result | File |
|---|----------|--------|------|
| 1 | ACU | **Failed** (HTTP 403, Cloudflare challenge) | none |
| 2 | NDDC | **Failed** (HTTP 403, Cloudflare challenge) | none |
| 3 | Chevening | **Failed** (curl exit 92, no HTTP status) | none |
| 4 | Rhodes Trust | Saved; wrong `rhodes.png` deleted | `rhodes.svg` |
| 5 | Gates Cambridge | No dark-on-light version found; header colour `#013240` | none new (`gates-white.png` unchanged) |
| 6 | Commonwealth Scholarship Commission | Coloured emblem only (no wordmark) saved; header colour `#042e7d` | `csc-colour.png` |

Header background colours:

- Gates Cambridge: **`#013240`**
- Commonwealth Scholarship Commission: **`#042e7d`**

**Retries not performed.** The prescribed second attempts (`--http1.1`, plus
`Referer` for ACU and NDDC) were blocked by this session's permission layer
before they ran, classified as bot-check circumvention. So items 1 to 3 each
record a single attempt. No other workaround was attempted.

## 1. ACU: failed

- URL: https://www.acu.ac.uk/dist/images/logo.svg
- curl exit code 0, **HTTP 403**, `Content-Type: text/html; charset=UTF-8`, 5773 bytes
- The body is a Cloudflare "Just a moment..." challenge page, not an SVG. Nothing saved.
- First 150 characters of the body:

```
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-e
```

- Retry with `--http1.1` and `Referer`: not run (blocked, see above).

## 2. NDDC: failed

- URL: https://www.nddc.gov.ng/assets/image/nddclogo.png
- curl exit code 0, **HTTP 403**, `Content-Type: text/html; charset=UTF-8`, 5790 bytes
- Same Cloudflare "Just a moment..." challenge page, not a PNG. Nothing saved.
- First 150 characters of the body:

```
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-e
```

- Retry with `--http1.1` and `Referer`: not run (blocked, see above).

## 3. Chevening: failed

- URL: https://www.chevening.org/
- **curl exit code 92**, HTTP status `000` (no response received), 0 bytes
- curl error: `curl: (92) HTTP/2 stream 1 was not closed cleanly: INTERNAL_ERROR (err 2)`
- Response body: empty (no bytes received), so there are no first 150 characters.
- The page could not be fetched, so the header logo was not identified. Nothing saved.
- Retry with `--http1.1`: not run (blocked, see above).

## 4. Rhodes Trust: saved

- Deleted `logo-src/rhodes.png` (1900 x 700 PNG, 850598 bytes). It did not come
  from a logo at all on this fetch: the home page's 1900 x 700 PNG is
  `/media/cjnoqbhg/front-of-rhodes-house.png`, alt "Front facade of Rhodes
  House...". The "Oral History Project logo" banner is a separate image,
  `/media/zieoyifi/website-banner-blue-logo.png`. Either way it was not the
  Rhodes Trust logo.
- Saved **`logo-src/rhodes.svg`**: SVG, viewBox `0 0 160 44` (rendered 160 x 44 on the site), 7812 bytes
- Source: https://www.rhodeshouse.ox.ac.uk/modern/images/rhodes-logo-main-dark.3ba69162169c8985b226.svg (HTTP 200, `image/svg+xml`)
- Where in the page: the only image in `<header class="has-background-white header-nav">`,
  inside the home link `<a href="/">`:
  `<img src=/modern/images/rhodes-logo-main-dark....svg alt="Rhodes Trust Logo" class="is-block header-nav-logo" width=160 height=44>`
- Colours: dark navy `#002D74` (with some `#FFFFFF` detail), meant for the white header.
- This was an unambiguous match, so no `rhodes-cand-*` files were saved.
- Also present but not downloaded: the footer's white version,
  `/modern/images/rhodes-logo-main-white.9fb75c7afcdf83fde615.svg`, alt "Rhodes Trust White Logo", 160 x 45.

## 5. Gates Cambridge: no dark version found

- https://www.gatescambridge.org/wp-content/uploads/2023/08/GC-logo-positive_font_update.png
  gave curl exit 0, **HTTP 404**, `text/html`, 153 bytes. First 150 characters of the body:

```
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.26.3</center>
</body>
</htm
```

- Home page https://www.gatescambridge.org/ fetched (HTTP 200, 59495 bytes). The only
  files under `/wp-content/` with "logo" in the name are:
  - `/wp-content/uploads/2023/08/GC-logo-positive_font_update_WHITE_OUT.png`: the
    white header logo already saved as `gates-white.png`
    (`<section class="header"> ... <div class="header-logo"><a href="/"><img ... alt="Gates Cambridge">`)
  - `/wp-content/themes/gatescambridge/static/min/img/social/x-logo.svg`: the X/Twitter icon, not theirs
- No dark-on-light version is referenced, so no `gates.png` / `gates.svg` was saved.
  `gates-white.png` (1020 x 537 PNG, 39143 bytes) is unchanged.
- **Header background colour: `#013240`**, from
  https://www.gatescambridge.org/wp-content/themes/gatescambridge/static/min/css/styles.min.css?ver=1.0
  line 1868: `.header { background-color: #013240; }`. The footer uses the same colour.

## 6. Commonwealth Scholarship Commission: emblem saved, no full coloured logo

- Home page https://cscuk.fcdo.gov.uk/ fetched (HTTP 200, 202792 bytes).
- The header logo is
  `<img src="https://cscuk.fcdo.gov.uk/wp-content/uploads/2026/09/Cscuk-Logo.png" width="500" height="151" alt="Commonwealth Scholarship Commission in the UK" id="logo">`.
  It is byte-identical to the existing `csc.png` (500 x 151, 8157 bytes), the white one.
- The only other "logo"/"Cscuk" files under `/wp-content/uploads/` are the site icon
  (`cropped-Cscuk-Logo-01-1-32x32.png`, `-180x180`, `-192x192`, `-270x270`) and
  `2022/02/Yoast-social-logo.jpg` (a plugin's social-share image, not downloaded).
- Saved **`logo-src/csc-colour.png`**: PNG, 512 x 512, 8-bit colormap, 13270 bytes
- Source: https://cscuk.fcdo.gov.uk/wp-content/uploads/2020/02/cropped-Cscuk-Logo-01-1.png
  (HTTP 200, `image/png`). This is the full-size original of the site icon; the URL is
  the page's `-270x270` icon URL with the size suffix removed.
- **Caveat:** it is the globe emblem only, a dark blue disc with white grid lines, with
  no "Commonwealth Scholarships" wordmark. No coloured version of the full
  horizontal logo is referenced on the home page.
- **Header background colour: `#042e7d`**, from
  https://cscuk.fcdo.gov.uk/wp-content/et-cache/13835/et-core-unified-tb-14592-13835.min.css?ver=1794310367:
  `#main-header,#main-header .nav li ul,.et-search-form,#main-header .et_mobile_menu{background-color:#042e7d}`
  (the logo sits in `<header id="main-header">`).

## File check

`file` output for everything in `logo-src/` after this run. All are images; no
HTML error pages were kept.

```
csc-colour.png:  PNG image data, 512 x 512, 8-bit colormap, non-interlaced
csc.png:         PNG image data, 500 x 151, 8-bit colormap, non-interlaced
gates-white.png: PNG image data, 1020 x 537, 8-bit/color RGBA, non-interlaced
lse.svg:         SVG Scalable Vector Graphics image
ox.svg:          SVG Scalable Vector Graphics image
rhodes.svg:      SVG Scalable Vector Graphics image
um.jpg:          JPEG image data, 4290x4084
uu.svg:          SVG Scalable Vector Graphics image
wht.webp:        RIFF (little-endian) data, Web/P image
```

## Still missing

ACU, NDDC and Chevening. The first two sit behind a Cloudflare browser challenge
that plain curl does not pass; Chevening's server reset the HTTP/2 stream.
