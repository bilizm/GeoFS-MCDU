# GeoFS MCDU Add-on

## Table of Contents
1. [Introduction](#plugin-introduction)
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

## Introduction

The GeoFS MCDU add-on is a multifunctional Control Display Unit (MCDU) simulator designed for the GeoFS flight simulator. It provides flight plan management, performance calculations, checklists, and other features, compatible with all aircraft in GeoFS.



**This plugin is based on a simplified version of the A320 MCDU and cannot be connected to GeoFS itself.**

<img width="696" height="736" alt="image" src="https://github.com/user-attachments/assets/ac5ffec8-96e5-432b-8b2b-9bbc1f42428d" />



## How to enter information
Use the virtual keyboard to fill in the information in the input box in the lower left corner of the display, and then use the mouse to click the corresponding field to enter.(I didn't make the LSK buttons)



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

*Currently only INIT A.*


<img width="696" height="736" alt="image" src="https://github.com/user-attachments/assets/f0b41183-b18d-4e53-b1ca-8147c459b00d" />


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


<img width="696" height="736" alt="image" src="https://github.com/user-attachments/assets/2fcc6cee-07c7-465d-bf55-d42d3cd996f0" />



Used to manage flight plan waypoints:

1. Click departure/destination airport codes to access detailed pages
2. **Add Waypoints**:
   - Enter waypoint ID in the input box (2-8 alphanumeric characters)
   - Click on an empty waypoint line to add it
3. **Delete Waypoints**:
   - Press "DEL" to remove the last waypoint
4. **Airport Subpages**:
   - **Departure Page**: Click on the ICAO green code of your departure airport, Set runway (RWY) and SID procedures
   - **Arrival Page**: Click on the ICAO green code of the arrival airport, Set STAR procedures, transitions, and ILS runway

### PROG Page

<img width="696" height="736" alt="image" src="https://github.com/user-attachments/assets/09317272-0ba6-40fb-b665-006464a908b4" />


Displays real-time flight data (auto-updates every 0.5 seconds):

1. **ALT**: Current altitude (feet)
2. **SPD**: Current ground speed (knots)
3. **V/S**: Vertical speed (feet/minute)
4. **TRK**: Current track (degrees)

### PREF Page


Performance calculation pages (use "←" and "→" to switch):

#### TAKE OFF Page

<img width="696" height="736" alt="image" src="https://github.com/user-attachments/assets/f91ea011-53e7-4141-981e-8a14721fd43e" />


- **V1/VR/V2**: Takeoff speeds (3-digit numbers)
- **TRANS ALT**: Transition altitude (4-digit number)
- **FLAPS**: Flap setting (Airbus 1~4 or Boeing 1~40, if the aircraft is a Boeing, enter the flap degrees directly without the symbols!)
- **TO TEMP**: Takeoff temperature (number with optional "-")

#### CLB Page

<img width="696" height="736" alt="image" src="https://github.com/user-attachments/assets/cac39aa8-6564-49d6-8b78-15100773c015" />


- **COST INDEX**: Same as INIT page
- **CLB WIND/TRIP WIND**: Wind direction/speed (format: DDD/SS)
- **ECON CLB SPD**: Economy climb speed (3-digit number)
- **STEP ALTS**: Step altitudes (format: FFFFF/FFFFF)

#### CRZ Page

<img width="696" height="736" alt="image" src="https://github.com/user-attachments/assets/5e433087-dd3d-4334-a85a-2eb83096c945" />


- **CRZ FL/OPT FL**: Cruise/optimal flight level (format: FLxxx)
- **ECON CRZ SPD**: Economy cruise speed (decimal like .78)
- **WIND**: Wind information (format: DDD/SS)
- **T/D PRED**: Top of descent prediction (number)

#### DES Page

<img width="696" height="736" alt="image" src="https://github.com/user-attachments/assets/4172fd2d-0148-4343-a141-a96dbef4a48f" />


- **ECON DES SPD**: Economy descent speed (converts to Mach)
- **MAN DES SPD**: Manual descent speed (format: SSS/MMMM)
- **DECEL PT**: Deceleration point (format: DDD/SSNM)
- **APPR SPEED**: Approach speed (3-digit number)

### CHECKLIST Page

**You can find out what to do at each stage of the flight here!**

<img width="696" height="736" alt="image" src="https://github.com/user-attachments/assets/3007e52a-46bf-4554-85c8-73dbd3a88356" />


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

1. V1 callout will automatically play when aircraft reaches V1 knots
2. Some features are still under development (marked in interface)
3. For best experience, complete INIT page before F-PLN
4. Performance calculations are estimates only
5. Join our [Discord group](https://discord.gg/4snrKwHpAA) for support
6. To enter a negative number: First enter the number in the input box, then click the +/- key to make it negative. (For example, to enter -5, first click 5 and then click +/-. Click +/-again to make it 5)

---

- This plugin is based on the A320 MCDU and has no significant relevance to GeoFS itself. All operations are additional, but they ensure professional operation.
- For some reasons, it cannot be integrated with Flight Plan at this time.
- Other pages will be improved in the future.
