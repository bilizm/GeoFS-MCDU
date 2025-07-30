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
   - [RAD NAV Page](#rad-nav-page)
   - [CHECKLIST Page](#checklist-page)
   - [Other Pages](#other-pages)
5. [Important Notes](#important-notes)

## Introduction

The GeoFS MCDU add-on is a multifunctional Control Display Unit (MCDU) simulator designed for the GeoFS flight simulator. It provides flight plan management, performance calculations, checklists, and other features, compatible with all aircraft in GeoFS.



**This add-on is based on a simplified version of the A320 MCDU and all aircraft in GeoFS can use this add-on, there may be some unprofessional places.**

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
- **To enter a negative number**: First enter the number in the input box, then click the +/- key to make it negative. (For example, to enter -5, first click 5 and then click +/-. Click +/-again to make it 5)
- **Flight Planning Websites**: I recommend using [SimBrief](https://dispatch.simbrief.com/home) or [Flight Planner](https://flightplandatabase.com/planner)

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

1. **Flight waypoint display**:After you import routes into GeoFS FlightPlan, this page will display all the routes you imported.And there are a maximum of 5 waypoints on a page, and you can switch between them by clicking the ↑ and ↓ keys.You do not need to perform any action on this page.

**You must enter the FROM/TO part in the INIT page and import the route in GeoFS FlightPlan to see all the waypoints!**

<img width="696" height="234" alt="image" src="https://github.com/user-attachments/assets/d709b512-62f0-45aa-91a4-24363621ae5d" />


2. **Airport Subpages**:
   - **Departure Page**: Click on the ICAO green code of your departure airport, Set runway (RWY) and SID procedures

  <img width="694" height="231" alt="image" src="https://github.com/user-attachments/assets/c6cb49fe-36db-48ee-8e81-593978a3d2fd" />


   - **Arrival Page**: Click on the ICAO green code of the arrival airport, Set STAR procedures, transitions, and ILS runway

<img width="689" height="233" alt="image" src="https://github.com/user-attachments/assets/bf4befe7-f80b-476b-aa63-8154a71d5ffc" />




### PROG Page

<img width="640" height="234" alt="image" src="https://github.com/user-attachments/assets/c69f4efe-1c64-4383-806f-95a23e41a298" />



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


### RAD NAV Page

The first time you click it to enter the page, three N/V will be displayed.

<img width="640" height="234" alt="3FSZJ0~5 S (P}S9MU_69}H" src="https://github.com/user-attachments/assets/e40378b2-2510-4bea-b260-acc74811595c" />

When you click on the corresponding frequency of the runway.

<img width="696" height="375" alt="@ SN(~SR Q02%I6@G`M@A 9" src="https://github.com/user-attachments/assets/a627086b-c31e-4c1e-b23d-85f2a372a0ac" />

Then it will display the corresponding runway frequency you just clicked. (The heading part of VOR1 and ILS cannot obtain specific data)

<img width="640" height="233" alt="NF4`5MVW8 R_2 TW@9F~UI4" src="https://github.com/user-attachments/assets/a7ba2204-4f73-4c0b-8478-ce8a03b66352" />



### CHECKLIST Page

**Don't worry about what you should fill out and when! You can find out what to do at each stage of the flight here!**

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

#### Available Pages:
- **PERF**: Data entry at four stages of a flight
- **INIT**: Fill in basic flight information
- **F-PLN**: Display all waypoints after importing the route
- **RAD NAV**: Displays information about aircraft approaching
- **CHECK LIST**: What to do at ten moments on a flight
- **MCDU MENU**: Basic information about this add-on

#### Unavailable pages:
- **AIR PORT**: Airport information
- **SEC F-PLN**: Secondary flight plan 
- **FUEL PRED**: Fuel prediction 
- **DIM BRT**: Screen brightness 
- **DATA**: Data management
- **DIR**：Fly directly to a waypoint

## Important Notes

1. V1 callout will automatically play when aircraft reaches V1 knots
2. Some features are still under development (marked in interface)
3. For best experience, complete INIT page and import routes before F-PLN
4. Performance calculations are estimates only
5. Join our [Discord group](https://discord.gg/4snrKwHpAA) for support


---

- This add-on is based on the A320 MCDU and has no significant relevance to GeoFS itself. All operations are additional, but they ensure professional operation.
- For some reasons, it cannot be integrated with Flight Plan at this time.
- Other pages will be improved in the future.
