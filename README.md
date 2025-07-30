# GeoFS MCDU Plugin

**GeoFS MCDU** is a browser userscript that brings a fully interactive MCDU (Multipurpose Control and Display Unit) to the GeoFS flight simulator. Designed for realism and convenience, this plugin supports flight planning, performance input (V1/VR/V2), auto V1 callout, checklists, and more — applicable to **all aircraft types** in GeoFS.

Author: [@bilizm](https://github.com/bilizm)  
Version: 0.1  
Discord Group: [Join here](https://discord.gg/4snrKwHpAA)

---

## 📸 Screenshot Guide

Please prepare the following screenshots to include in your README:

1. **Main MCDU panel** open on GeoFS, showing INIT A page.
2. MCDU toolbar button in GeoFS **bottom UI**.
3. Example input on pages like `F-PLN`, `PERF`, `CHECKLIST`.
4. Highlight of **V1 audio trigger** near V1 speed.
5. Checklist ticking interaction.

---

## 🔧 How to Install

### 1. Install Tampermonkey

This script runs via [Tampermonkey](https://www.tampermonkey.net/), a browser extension that manages user scripts.

- **Chrome / Edge**: [Install Tampermonkey](https://www.tampermonkey.net/)
- **Firefox**: [Install from Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

> After installing, a black-and-white Tampermonkey icon should appear in the browser toolbar.

📸 Screenshot tip: show the browser with Tampermonkey icon installed.

---

### 2. Install the GeoFS MCDU Script

1. Visit the script file:  
   [GeoFS-MCDU.user.js](https://github.com/bilizm/GeoFS-MCDU/raw/main/GeoFS-MCDU.user.js)
2. Tampermonkey will prompt an install page. Click **Install**.
3. Open [https://www.geo-fs.com](https://www.geo-fs.com)
4. Wait for GeoFS to fully load, and the **MCDU** button will appear in the bottom toolbar.

---

## 🚀 How to Use

### Opening the MCDU Panel

- Click the **`MCDU`** button in GeoFS bottom UI.
- Or press **`M` key** on your keyboard to toggle the panel.

📸 Screenshot tip: show the MCDU button in the GeoFS bottom toolbar.

---

## 🧭 Page-by-Page Usage Guide

### 🟩 `MCDU MENU`

The home screen. Displays:

- Plugin version
- Author info
- Link to Discord group

This is the default page on launch.

---

### 🟡 `INIT A` Page

Set up the basic flight information:

| Field        | Format Example | Description                                |
|--------------|----------------|--------------------------------------------|
| `FROM/TO`    | `ZBAA/ZSSS`     | Departure and arrival airport ICAO codes   |
| `FLT NMB`    | `CSN123`        | Flight number                              |
| `ALTN`       | `ZSPD`          | Alternate airport                          |
| `COST INDEX` | `30`            | Used for cruise speed economy              |
| `CRZ FL`     | `FL350`         | Cruise altitude, auto-calc temperature     |

📸 Screenshot tip: filled INIT A page example.

---

### 🟦 `F-PLN` Page

Displays the route with editable waypoints.

- Click the **departure or arrival ICAO code** to enter `DEPARTURE` or `ARRIVAL` subpages.
- Add waypoints by typing the waypoint name (e.g. `NDB12`) and clicking an empty line.
- Use arrows ← ↑ ↓ → to scroll pages.

📸 Screenshot tip: example with several added waypoints.

---

### ✈️ `DEPARTURE` / `ARRIVAL` Subpages

Set runway, SIDs, STARs, transitions:

#### `DEPARTURE`
| Field | Description                    |
|-------|--------------------------------|
| RWY   | Runway identifier (e.g. 36L)   |
| SIDS  | SID procedure name             |

#### `ARRIVAL`
| Field   | Description                  |
|---------|------------------------------|
| STAR    | STAR arrival route           |
| TRANS   | Transition waypoint          |
| ILS RWY | Runway with ILS (e.g. 34L)   |

Click `<RETURN` to go back to `F-PLN`.

---

### 📊 `PERF` Pages (TAKE OFF, CLB, CRZ, DES)

Use arrows ← → to switch between 4 PERF subpages.

#### `TAKE OFF`
| Field   | Description                             |
|---------|-----------------------------------------|
| V1/VR/V2| Takeoff speeds in knots                 |
| FLAPS   | e.g. `1`, `10°`                         |
| TRANS ALT | Transition altitude (e.g. `10000`)   |
| TO TEMP | Takeoff temp in °C                      |

🔊 When aircraft speed reaches `V1`, a **V1 callout** will play.

#### `CLB` (Climb)
| Field         | Example  | Description               |
|---------------|----------|---------------------------|
| COST INDEX    | `30`     | Cost performance          |
| CLB WIND      | `270/10` | Wind during climb         |
| ECON CLB SPD  | `280`    | Target climb speed        |

#### `CRZ` (Cruise)
| Field       | Description               |
|-------------|---------------------------|
| CRZ FL      | Cruise FL (`FL350`)       |
| OPT FL      | Optimal FL                |
| WIND        | Cruise wind (`290/50`)    |
| T/D PRED    | Top of descent prediction |

#### `DES` (Descent)
| Field        | Description                       |
|--------------|-----------------------------------|
| DES WIND     | Descent wind (`310/15`)           |
| ECON DES SPD | Descent speed (`300/0.78`)        |
| APPR SPD     | Approach speed                    |

📸 Screenshot tip: show V1/VR/V2 entered + audio playing at takeoff

---

### 📘 `PROG` Page

Real-time flight data:

| Field | Description                     |
|-------|---------------------------------|
| ALT   | Current altitude in feet        |
| SPD   | Ground speed in Mach            |
| V/S   | Vertical speed in feet/min      |
| TRK   | Aircraft heading (track)        |

Auto-refreshes every 0.5s while viewing.

---

### ✅ `CHECKLIST` Page

Interactive flight checklist covering 10 phases:

1. PREF
2. BEFORE LAUNCH
3. AFTER LAUNCH
4. BEFORE TAXI/TAKE OFF
5. AFTER TAKE OFF
6. CRUISE
7. BEFORE DESCEND
8. APPROACH
9. AFTER LANDING
10. AIRCRAFT SHUTDOWN

- Click on each item to check/uncheck.
- Use ← → to switch pages.

📸 Screenshot tip: checklist in progress with checkboxes marked.

---

### ❌ `DATA`, `DIM BRT`, `RAD NAV`, `SEC F-PLN`, `AIR PORT`, `DIR`, `FUFL PRED`

Currently not implemented. Future development planned.

---

## ⌨️ Keyboard Shortcuts

| Key | Action                  |
|-----|-------------------------|
| `M` | Toggle MCDU panel       |

---

## ⚠️ Notes

- Works only in **desktop browsers** (Chrome, Edge, Firefox)
- Wait until GeoFS is fully loaded before clicking MCDU
- Code logic and structure are protected under the license

---

## 📄 License

This project is under the [MIT License](./LICENSE) with additional clauses:

- ❗ Unauthorized **replication of code logic**, structure, or modifications **without author consent** is prohibited.
- Attribution and license must remain with all redistributions.

