# GeoFS MCDU Plugin User Guide

## Table of Contents
1. [Plugin Introduction](#plugin-introduction)
2. [Installation](#installation)
3. [Basic Operations](#basic-operations)
4. [Page Functions Explained](#page-functions-explained)
   - [INIT Page](#init-page)
   - [F-PLN Page](#f-pln-page)
   - [PROG Page](#prog-page)
   - [PREF Page](#pref-page)
   - [CHECKLIST Page](#checklist-page)
   - [Other Pages](#other-pages)
5. [Important Notes](#important-notes)

## Plugin Introduction

The GeoFS MCDU plugin is a multifunctional Control Display Unit (MCDU) simulator designed for the GeoFS flight simulator. It provides flight plan management, performance calculations, checklists, and other features, compatible with all aircraft in GeoFS.

![MCDU Main Interface](provide main interface screenshot)

## Installation

1. Ensure you have Tampermonkey or a similar userscript manager installed
2. Visit the [GitHub repository](https://github.com/your-repo-address) to get the latest script
3. Click the "Raw" button - Tampermonkey will prompt for installation
4. After confirming installation, refresh the GeoFS page to use it

## Basic Operations

- **Open/Close MCDU**: Click the "MCDU" button in the bottom-right corner of the GeoFS interface, or press the "M" key
- **Enter Data**: Use the keyboard buttons below the screen
- **Clear Input**: Use the "CLR" button
- **Delete Characters**: Use the "DEL" button
- **Switch Pages**: Use the top function buttons (INIT, F-PLN, PROG, etc.)

## Page Functions Explained

### INIT Page

![INIT Page](provide INIT page screenshot)

Used to set initial flight information:

1. **CO RTE**: Company route (not yet implemented)
2. **ALTN/CO RTE**: Alternate airport (4-letter ICAO code)
   - Example: Enter "KLAX" to set Los Angeles as alternate
3. **FROM/TO**: Departure/destination airport (format: AAAA/BBBB)
   - Example: Enter "KJFK/EGLL" for New York to London route
4. **FLT NMB**: Flight number (free format)
5. **COST INDEX**: Cost index (number 0-999)
6. **CRZ FL/TEMP**: Cruise flight level and temperature (format: FLxxx)
   - Example: Enter "FL350" will automatically calculate and display "FL350/-55°"

### F-PLN Page

![F-PLN Page](provide F-PLN page screenshot)

Used to manage flight plan waypoints:

1. Click departure/destination airport codes to access detailed pages
2. **Add Waypoints**:
   - Enter waypoint ID in the input box (2-8 alphanumeric characters)
   - Click on an empty waypoint line to add it
3. **Delete Waypoints**:
   - Press "DEL" to remove the last waypoint
4. **Airport Subpages**:
   - **Departure Page**: Set runway (RWY) and SID procedures
   - **Arrival Page**: Set STAR procedures, transitions, and ILS runway

### PROG Page

![PROG Page](provide PROG page screenshot)

Displays real-time flight data (auto-updates every 0.5 seconds):

1. **ALT**: Current altitude (feet)
2. **SPD**: Current ground speed (knots)
3. **V/S**: Vertical speed (feet/minute)
4. **TRK**: Current track (degrees)

### PREF Page

![PREF Page](provide PREF page screenshot)

Performance calculation pages (use "←" and "→" to switch):

#### TAKE OFF Page
- **V1/VR/V2**: Takeoff speeds (3-digit numbers)
- **TRANS ALT**: Transition altitude (4-digit number)
- **FLAPS**: Flap setting (number 0-4 or angle 1°-40°)
- **TO TEMP**: Takeoff temperature (number with optional "-")

#### CLB Page
- **COST INDEX**: Same as INIT page
- **CLB WIND/TRIP WIND**: Wind direction/speed (format: DDD/SS)
- **ECON CLB SPD**: Economy climb speed (3-digit number)
- **STEP ALTS**: Step altitudes (format: FFFFF/FFFFF)

#### CRZ Page
- **CRZ FL/OPT FL**: Cruise/optimal flight level (format: FLxxx)
- **ECON CRZ SPD**: Economy cruise speed (decimal like .78)
- **WIND**: Wind information (format: DDD/SS)
- **T/D PRED**: Top of descent prediction (number)

#### DES Page
- **ECON DES SPD**: Economy descent speed (converts to Mach)
- **MAN DES SPD**: Manual descent speed (format: SSS/MMMM)
- **DECEL PT**: Deceleration point (format: DDD/SSNM)
- **APPR SPEED**: Approach speed (3-digit number)

### CHECKLIST Page

![CHECKLIST Page](provide CHECKLIST page screenshot)

Interactive checklist system (10 phases):

1. Use "←" and "→" to switch between checklist pages
2. Click any item to mark it as complete (green checkmark appears)
3. Checklist phases:
   - PREF
   - BEFORE LAUNCH
   - AFTER LAUNCH
   - BEFORE TAXI/TAKE OFF
   - AFTER TAKE OFF
   - CRUISE
   - BEFORE DESCEND
   - APPROACH
   - AFTER LANDING
   - AIRCRAFT SHUTDOWN

### Other Pages

- **AIR PORT**: Airport information (under development)
- **DIR**: Direct-to function (under development)
- **RAD NAV**: Radio navigation (not implemented)
- **SEC F-PLN**: Secondary flight plan (not implemented)
- **FUEL PRED**: Fuel prediction (not implemented)
- **DIM BRT**: Screen brightness (not implemented)
- **DATA**: Data management (not implemented)

## Important Notes

1. V1 callout will automatically play when aircraft reaches V1-4 knots
2. Some features are still under development (marked in interface)
3. For best experience, complete INIT page before F-PLN
4. Performance calculations are estimates only
5. Join our [Discord group](https://discord.gg/4snrKwHpAA) for support

---

Would you like me to provide specific screenshot requirements for each section? I can list exactly what visual elements would be most helpful to include with each part of the documentation.
