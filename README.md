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



**This add-on is based on a simplified version of the A320 MCDU and cannot be connected to GeoFS itself.**

<img width="696" height="736" alt="image" src="https://github.com/user-attachments/assets/ac5ffec8-96e5-432b-8b2b-9bbc1f42428d" />



## How to enter information
Use the virtual keyboard to fill in the information in the input box in the lower left corner of the display, and then use the mouse to click the corresponding field to enter.(I didn't make the LSK buttons)



## Installation

1. Ensure you have Tampermonkey or a similar userscript manager installed
2. Visit the [GitHub repository](https://github.com/your-repo-address) to get the latest script
3. Click the "Raw" button - Tampermonkey will prompt for installation
4. After confirming installation, refresh the GeoFS page to use it

## Basic Operations

- **Open/Close MCDU**: Click the "MCDU" button in the bottom-right corner of the GeoFS interface.
- **Enter Data**: Use the keyboard buttons below the screen
- **Clear Input**: Use the "CLR" button
- **Delete Characters**: Use the "DEL" button
- **Switch Pages**: Use the top function buttons (INIT, F-PLN, PROG, etc.)

## Page Functions Explained

### INIT Page

*Currently only INIT A.*


<img width="937" height="313" alt="6IBD4~CTDNXOF7C4C08NZ~J" src="https://github.com/user-attachments/assets/b946daaf-7e1b-47b6-af51-eb93d4a85d55" />



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


<img width="932" height="314" alt="WBCT4FMF`G88Y7MD01PJJ`0" src="https://github.com/user-attachments/assets/59cf3cb2-0633-42c1-a155-046b836d4609" />




Used to manage flight plan waypoints:

1. Click departure/destination airport codes to access detailed pages
2. **Add Waypoints**:
   - Enter waypoint ID in the input box (2-8 alphanumeric characters)
   - Click on an empty waypoint line to add it
3. **Delete Waypoints**:
   - Press "DEL" to remove the last waypoint
4. **Airport Subpages**:
   - **Departure Page**: Click on the ICAO green code of your departure airport, Set runway (RWY) and SID procedures

  <img width="694" height="231" alt="image" src="https://github.com/user-attachments/assets/c6cb49fe-36db-48ee-8e81-593978a3d2fd" />


   - **Arrival Page**: Click on the ICAO green code of the arrival airport, Set STAR procedures, transitions, and ILS runway

<img width="689" height="233" alt="image" src="https://github.com/user-attachments/assets/bf4befe7-f80b-476b-aa63-8154a71d5ffc" />




### PROG Page

<img width="934" height="314" alt="49 S$X7MOA{)KA46KR}I${U" src="https://github.com/user-attachments/assets/a5e5f890-f445-457f-abfa-99cf6aa937fc" />



Displays real-time flight data (auto-updates every 0.5 seconds):

1. **ALT**: Current altitude (feet)
2. **SPD**: Current ground speed (knots)
3. **V/S**: Vertical speed (feet/minute)
4. **TRK**: Current track (degrees)

### PREF Page


Performance calculation pages (use "←" and "→" to switch):

#### TAKE OFF Page

<img width="923" height="309" alt="N@_{$70{ }~`( (%A7KAUJJ" src="https://github.com/user-attachments/assets/092bd103-b0cd-41bb-a17e-a88832dab4ff" />



- **V1/VR/V2**: Takeoff speeds (3-digit numbers)
- **TRANS ALT**: Transition altitude (4-digit number)
- **FLAPS**: Flap setting (Airbus 1-4 or Boeing 1-40, if the aircraft is a Boeing, enter the flap degrees directly without the symbols!)
- **TO TEMP**: Takeoff temperature (number with optional "-")

#### CLB Page

<img width="1035" height="354" alt="RCM1Q@K4WTHE398SSY8~D(U" src="https://github.com/user-attachments/assets/47589b09-d0f9-4551-a6f7-a06878641c31" />



- **COST INDEX**: Same as INIT page
- **CLB WIND/TRIP WIND**: Wind direction/speed (format: DDD/SS)
- **ECON CLB SPD**: Economy climb speed (3-digit number)
- **STEP ALTS**: Step altitudes (format: FFFFF/FFFFF)

#### CRZ Page

<img width="1033" height="349" alt="D2LSI$ZA8U~LCU5@7TTZBYV" src="https://github.com/user-attachments/assets/18f61c9b-437f-4dd3-8e2f-03d3d0fe3b1a" />



- **CRZ FL/OPT FL**: Cruise/optimal flight level (format: FLxxx)
- **ECON CRZ SPD**: Economy cruise speed (decimal like .78)
- **WIND**: Wind information (format: DDD/SS)
- **T/D PRED**: Top of descent prediction (number)

#### DES Page

<img width="1036" height="349" alt="FB5R5JZ(LM(K``A6{YND9KI" src="https://github.com/user-attachments/assets/cdd75440-6faf-49fc-9e2d-2dcbe0a0f161" />



- **ECON DES SPD**: Economy descent speed (converts to Mach)
- **MAN DES SPD**: Manual descent speed (format: SSS/MMMM)
- **DECEL PT**: Deceleration point (format: DDD/SSNM)
- **APPR SPEED**: Approach speed (3-digit number)

### CHECKLIST Page

**You can find out what to do at each stage of the flight here!**

<img width="1038" height="350" alt="UNJ %M$74{XGF@RIGIV4$I0" src="https://github.com/user-attachments/assets/ea32f088-e7c8-48f0-96f5-cd8b67ec56f8" />



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
5.To enter a negative number: First enter the number in the input box, then click the +/- key to make it negative. (For example, to enter -5, first click 5 and then click +/-. Click +/-again to make it 5)
6. Join our [Discord group](https://discord.gg/4snrKwHpAA) for support


---

- This add-on is based on the A320 MCDU and has no significant relevance to GeoFS itself. All operations are additional, but they ensure professional operation.
- For some reasons, it cannot be integrated with Flight Plan at this time.
- Other pages will be improved in the future.
