// ==UserScript==
// @name         GeoFS MCDU
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  Please read the instructions on GitHub before use.
// @author       zm
// @LICENSE      MIT
// @match        https://www.geo-fs.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ------------------------------- MCDU状态变量 -------------------------------
    let mcduPanelOpen = false;
    let mcduPanel = null;

    // ------------------------------- MCDU页面与功能原始代码 -------------------------------
    // V1音频播报相关
    let v1Value = null, v1Played = false;
    let v1Audio = null;
    const V1_AUDIO_URL = "https://raw.githubusercontent.com/Bilibilizm/GeoFS-zms-fans-addon/main/material/V1.WAV";
    function playV1Audio() {
        if (!v1Audio) v1Audio = new Audio(V1_AUDIO_URL);
        v1Audio.play();
    }

    // 检查单内容
    const checklistPages = [
        { title: "PREF", items: ["FLIGHT PLAN...IMPORT", "ALTITUDE/SPEED...INPUT", "PERF-TAKE OFF...IMPORT", "PERF-CLB...IMPORT"] },
        { title: "BEFORE LAUNCH", items: ["BRAKE...UP", "DOORS...CLOSE"] },
        { title: "AFTER LAUNCH", items: ["BRAKE...UP"] },
        { title: "BEFORE TAXI/TAKE OFF", items: ["ENGINES...ON", "FLAPS...DOWN", "STABILIZER TRIM...ON DEMAND", "BRAKE...UP"] },
        { title: "AFTER TAKE OFF", items: ["GEAR...UP", "FLAPS...RETRACT", "AUTOPILOT...ON"] },
        { title: "CRUISE", items: ["AUTOPILOT DATA...CHECK", "FMC DATA PANEL...CHECK"] },
        { title: "BEFORE DESCEND", items: ["FMC DATA PANEL...CHECK", "PERF-DES...IMPORT"] },
        { title: "APPROACH", items: ["FLAPS...DOWN", "GEAR...DOWN", "SPOILER...READY", "PERF-APPR...IMPORT"] },
        { title: "AFTER LANDING", items: ["REVERSE THRUST...OFF", "FLAPS...RETRACT", "SPOILER...OFF"] },
        { title: "AIRCRAFT SHUTDOWN", items: ["BRAKE...OPEN", "ENGINES...CLOSE", "DOORS...OPEN", "DO YOU HAVE A NICE FLIGHT...YES!"] }
    ];
    let checklistState = Array(checklistPages.length).fill().map((_, pageIdx) => checklistPages[pageIdx].items.map(() => false));
    let currentChecklistPage = 0;

    // 状态
    const sectionNames = ["INIT", "F-PLN", "PROG", "PREF", "DATA", "DIM BRT", "AIR PORT", "DIR", "RAD\nNAV", "SEC\nF-PLN", "FUFL\nPRED", "CHECK\nLIST", "MCDU\nMENU"];
    let currentSection = 'menu';
    let inputBuffer = "";
    let showError = false;
    let currentPerfPage = 0;

    // INIT
    const initFields = {
        coRte: "[   ][   ][   ][   ][   ][   ][   ][   ][   ][   ]",
        altn: "NONE",
        fromTo: "[ ][ ][ ][ ]/[ ][ ][ ][ ]",
        fltNbr: "[ ][ ][ ][ ][ ][ ]",
        costIndex: "[ ][ ][ ]",
        crzFl: "-----/---°"
    };

    // PERF
    const perfPages = ['TAKE OFF', 'CLB', 'CRZ', 'DES'];
    const perfData = {
        'TAKE OFF': { V1: '[][][]', VR: '[][][]', V2: '[][][]', TRANSALT: '[    ]', FLAPS: '[     ]', TOTEMP: '---°' },
        'CLB': {
            COSTINDEX: '---',
            CLBWIND: '---/--',
            TRIPWIND: '---/--',
            ECONCLBSPD: '---',
            STEPALTS: '-----/-----'
        },
        'CRZ': {
            CRZFL: 'FL---',
            OPTFL: 'FL---',
            ECONCRZSPD: '--',
            WIND: '---/--',
            TDPRED: '----'
        },
        'DES': {
            DESWIND: '---/--',
            ECONDESSPD: '---/--',
            MANDESSPD: '---/----',
            DECELPT: '---/--NM',
            APPRSPD: '---'
        }
    };

    // F-PLN
    let fplnWaypoints = [];
    let fplnPageIdx = 0;
    const fplnPerPage = 5;

    function updateFplnWaypointsFromDOM() {
    const routeNodes = [...document.querySelectorAll(".geofs-waypointIdent")];
    fplnWaypoints = routeNodes.map(el => {
        let lat = parseFloat(el.parentElement?.dataset?.lat);
        let lon = parseFloat(el.parentElement?.dataset?.lon);
        let name = el.textContent.trim().toUpperCase().replace(/[0-9\.\,\s-]+$/, '');

        if ((isNaN(lat) || isNaN(lon)) && window.geofs?.nav?.flightPlan) {
            const match = geofs.nav.flightPlan.find(p => p.ident === name);
            if (match) {
                lat = match.lat;
                lon = match.lon;
            }
        }

        return {
            name: name, 
            lat: isNaN(lat) ? null : lat,
            lon: isNaN(lon) ? null : lon
        };

    }).filter(el => el.name && el.name !== "---");
}


    // DEPARTURE/ARRIVAL
    let subPageAirport = '';
    let departuresInfo = { RWY: '', SIDS: '' };
    let arrivalsInfo = { STAR: '', TRANS: '', ILSRWY: '' };

    function getGeoFSFlightData() {
        if (!(window.geofs && geofs.animation && geofs.animation.values)) return {
            altitude: '-----',
            speed: '--',
            vs: '--',
            track: '--'
        };
        const vals = geofs.animation.values;
        return {
            altitude: Math.round(vals.altitude),
            speed: Math.round(vals.groundSpeedKnt),
            vs: Math.round(vals.verticalSpeed),
            track: Math.round(vals.heading)
        };
    }

    function renderPerfFooter() {
        // 动态显示左/右页面名和页码
        let nextIdx = (currentPerfPage + 1) % perfPages.length;
        let lastIdx = (currentPerfPage + perfPages.length - 1) % perfPages.length;
        return `<span style="color:#00FF00;">←${perfPages[lastIdx]}</span>
        <span style="margin:0 10px;color:#00FF00;">${currentPerfPage+1}/4</span>
        <span style="color:#00FF00;">${perfPages[nextIdx]}→</span>`;
    }

    function mcduRenderPage(screenMain, screenInput) {
        if (currentSection === 'menu') {
            screenMain.innerHTML = `<div style='text-align:center;color:white;font-weight:bold;margin-bottom:10px'>GEOFS MCDU</div>
            <div style='text-align:center;color:cyan'>Applicable to all aircrafts!</div>
            <div style='text-align:center;color:cyan'>thank you for using it!</div>
            <div style='text-align:center;color:white'>AUTHOR: <span style='color:lime'>zm</span></div>
            <div style='text-align:center;color:white'>VERSION: <span style='color:lime'>0.1.2</span></div>
            <div style='text-align:center'><a href='https://discord.gg/4snrKwHpAA' target='_blank' style='color:deepskyblue;text-decoration:underline;cursor:pointer'>JOIN OUR DISCORD GROUP</a></div>`;
        }
        else if (currentSection === 'INIT') {
            screenMain.innerHTML = `<div style='text-align:center;color:white'>INIT A</div>
            <div data-field='coRte'><span style='color:white'>CO RTE</span> <span style='color:orange'>${initFields.coRte}</span></div>
            <div data-field='altn'><span style='color:white'>ALTN/CO RTE</span> <span style='color:cyan'>${initFields.altn}</span></div>
            <div data-field='fromTo'><span style='color:white'>FROM/TO</span> <span style='color:${initFields.fromTo.includes('[') ? 'orange' : 'cyan'}'>${initFields.fromTo}</span></div>
            <div data-field='fltNbr'><span style='color:white'>FLT NMB</span> <span style='color:cyan'>${initFields.fltNbr}</span></div>
            <div data-field='costIndex'><span style='color:white'>COST INDEX</span> <span style='color:${initFields.costIndex.includes('[') ? 'orange' : 'cyan'}'>${initFields.costIndex}</span></div>
            <div data-field='crzFl'><span style='color:white'>CRZ FL/TEMP</span> <span style='color:${initFields.crzFl.includes('-') ? 'orange' : 'cyan'}'>${initFields.crzFl}</span></div>
            <div style='text-align:right;color:white'>INIT PAGE</div>`;
        }
        else if (currentSection === 'AIR PORT') {
            screenMain.innerHTML = `<div style="text-align:center;color:yellow;font-weight:bold;font-size:22px;margin-top:55px;">AIR PORT PAGE<br>TO BE DEVELOPED</div>`;
        }
        else if (currentSection === 'PREF') {
            const title = perfPages[currentPerfPage];
            screenMain.innerHTML = `<div style='text-align:center;color:white;font-weight:bold;'>${title}</div>`;
            const lightblue = "lightblue";
            if (title === 'TAKE OFF') {
                const data = perfData['TAKE OFF'];
                screenMain.innerHTML += `
                    <div data-field='V1'><span style='color:white'>V1</span> <span style='color:${data.V1.includes('[') ? 'orange' : 'cyan'}'>${data.V1}</span></div>
                    <div data-field='VR'><span style='color:white'>VR</span> <span style='color:${data.VR.includes('[') ? 'orange' : 'cyan'}'>${data.VR}</span></div>
                    <div data-field='V2'><span style='color:white'>V2</span> <span style='color:${data.V2.includes('[') ? 'orange' : 'cyan'}'>${data.V2}</span></div>
                    <div data-field='TRANSALT'><span style='color:white'>TRANS ALT</span> <span style='color:${data.TRANSALT.includes('[') ? lightblue : 'cyan'}'>${data.TRANSALT}</span></div>
                    <div data-field='FLAPS'><span style='color:white'>FLAPS</span> <span style='color:${data.FLAPS === 'ERROR' ? 'red' : (data.FLAPS.includes('[') ? lightblue : 'cyan')}'>${data.FLAPS}</span></div>
                    <div data-field='TOTEMP'><span style='color:white'>TO TEMP</span> <span style='color:${data.TOTEMP === '---°' ? lightblue : (data.TOTEMP === 'ERROR' ? 'red' : 'cyan')}'>${data.TOTEMP}</span></div>
                `;
            } else if (title === 'CLB') {
                const data = perfData['CLB'];
                screenMain.innerHTML += `
                    <div data-field='COSTINDEX'><span style='color:white'>COST INDEX</span> <span style='color:${data.COSTINDEX==='---'?lightblue:lightblue}'>${data.COSTINDEX}</span></div>
                    <div data-field='CLBWIND'><span style='color:white'>CLB WIND</span> <span style='color:${data.CLBWIND==='---/--'?lightblue:lightblue}'>${data.CLBWIND}</span></div>
                    <div data-field='TRIPWIND'><span style='color:white'>TRIP WIND</span> <span style='color:${data.TRIPWIND==='---/--'?lightblue:lightblue}'>${data.TRIPWIND}</span></div>
                    <div data-field='ECONCLBSPD'><span style='color:white'>ECON CLB SPD</span> <span style='color:${data.ECONCLBSPD==='---'?lightblue:lightblue}'>${data.ECONCLBSPD}</span></div>
                    <div data-field='STEPALTS'><span style='color:white'>STEP ALTS</span> <span style='color:${data.STEPALTS==='-----/-----'?lightblue:lightblue}'>${data.STEPALTS}</span></div>
                `;
            } else if (title === 'CRZ') {
                const data = perfData['CRZ'];
                screenMain.innerHTML += `
                    <div data-field='CRZFL'><span style='color:white'>CRZ FL</span> <span style='color:${data.CRZFL==='FL---'?lightblue:lightblue}'>${data.CRZFL}</span></div>
                    <div data-field='OPTFL'><span style='color:white'>OPT FL</span> <span style='color:${data.OPTFL==='FL---'?lightblue:lightblue}'>${data.OPTFL}</span></div>
                    <div data-field='ECONCRZSPD'><span style='color:white'>ECON CRZ SPD</span> <span style='color:${data.ECONCRZSPD==='--'?lightblue:lightblue}'>${data.ECONCRZSPD}</span></div>
                    <div data-field='WIND'><span style='color:white'>WIND</span> <span style='color:${data.WIND==='---/--'?lightblue:lightblue}'>${data.WIND}</span></div>
                    <div data-field='TDPRED'><span style='color:white'>T/D PRED</span> <span style='color:${data.TDPRED==='----'?lightblue:lightblue}'>${data.TDPRED}</span></div>
                `;
            } else if (title === 'DES') {
                const data = perfData['DES'];
                screenMain.innerHTML += `
                    <div data-field='DESWIND'><span style='color:white'>DES WIND</span> <span style='color:${data.DESWIND==='---/--'?lightblue:lightblue}'>${data.DESWIND}</span></div>
                    <div data-field='ECONDESSPD'><span style='color:white'>ECON DES SPD</span> <span style='color:${data.ECONDESSPD==='---/--'?lightblue:lightblue}'>${data.ECONDESSPD}</span></div>
                    <div data-field='MANDESSPD'><span style='color:white'>MAN DES SPD</span> <span style='color:${data.MANDESSPD==='---/----'?lightblue:lightblue}'>${data.MANDESSPD}</span></div>
                    <div data-field='DECELPT'><span style='color:white'>DECEL PT</span> <span style='color:${data.DECELPT==='---/--NM'?lightblue:lightblue}'>${data.DECELPT}</span></div>
                    <div data-field='APPRSPD'><span style='color:white'>APPR SPEED</span> <span style='color:${data.APPRSPD==='---'?lightblue:lightblue}'>${data.APPRSPD}</span></div>
                `;
            }
            screenMain.innerHTML += `<div class="mcdu-pref-footer">${renderPerfFooter()}</div>`;
        }
        else if (currentSection === 'PROG') {
            const d = getGeoFSFlightData();
            screenMain.innerHTML = `
                <div style='text-align:center;color:white;font-weight:bold;margin-bottom:10px'>PROG</div>
                <div style="color:white;">
                    <span style="display:inline-block;width:68px">ALT</span>
                    <span style="display:inline-block;width:80px">${d.altitude}FT</span>
                    <span style="display:inline-block;width:50px">SPD</span>
                    <span style="display:inline-block;width:60px">${d.speed}M</span>
                </div>
                <div style="color:white;">
                    <span style="display:inline-block;width:68px">V/S</span>
                    <span style="display:inline-block;width:80px">${d.vs}FT/M</span>
                    <span style="display:inline-block;width:50px">TRK</span>
                    <span style="display:inline-block;width:60px">${d.track}°</span>
                </div>
                <div style="text-align:right;color:white">PROG PAGE</div>
            `;
        }
        else if (currentSection === 'F-PLN') {
            const ftFilled = /^[A-Z]{4}\/[A-Z]{4}$/.test(initFields.fromTo);
            if (!ftFilled || fplnWaypoints.length === 0) {
                screenMain.innerHTML = `<div style='text-align:center;color:yellow;font-weight:bold;font-size:16px;'>PLEASE IMPORT THE ROUTE AND INIT!</div>`;
            }
             else {
                const [dep, arr] = initFields.fromTo.split('/');
                screenMain.innerHTML = `
                  <div>
                    <span class='mcdu-code' id='mcdu-dep' style='margin-right:7px;cursor:pointer;'>${dep}</span>
                    <span style='color:#00FF00'>→</span>
                    <span class='mcdu-code' id='mcdu-arr' style='margin-left:7px;cursor:pointer;'>${arr}</span>
                  </div>`;
                let wptStart = fplnPageIdx * fplnPerPage;
                let wptEnd = Math.min(fplnWaypoints.length, wptStart + fplnPerPage);
                for (let i = wptStart; i < wptEnd; ++i) {
                    const wp = fplnWaypoints[i];
                    screenMain.innerHTML +=
                        `<div class='mcdu-wpt' data-wpt='${i}'>
                   <span style='color:lightblue'>${i + 1}. ${wp.name}</span>
                       </div>`;

                }

                screenMain.innerHTML += `<div style='text-align:center;color:#888'> </div>`;
                const totalPages = Math.max(1, Math.ceil(fplnWaypoints.length / fplnPerPage));
                screenMain.innerHTML += `<div style='text-align:right;color:#00FF00'>↑↓ &nbsp; Page ${fplnPageIdx + 1}/${totalPages}</div>`;

            }
        }
        else if (currentSection === 'departure') {
            const title = subPageAirport ? subPageAirport : '----';
            screenMain.innerHTML = `
                <div style='text-align:center;color:white;font-weight:bold;'>DEPARTURES FROM <span style='color:#00FF00'>${title}</span></div>
                <div data-field='RWY' style='color:white'>
                    RWY <span style='color:${departuresInfo.RWY === '' ? 'blue' : 'blue'}'>${departuresInfo.RWY === '' ? '---' : departuresInfo.RWY}</span>
                </div>
                <div data-field='SIDS' style='color:white'>
                    SIDS <span style='color:${departuresInfo.SIDS === '' ? 'orange' : 'blue'}'>${departuresInfo.SIDS === '' ? '[][][][][]' : departuresInfo.SIDS}</span>
                </div>
                <button class='mcdu-return' id='mcdu-return-dep'>&lt;RETURN</button>
            `;
        }
        else if (currentSection === 'arrival') {
            const title = subPageAirport ? subPageAirport : '----';
            screenMain.innerHTML = `
                <div style='text-align:center;color:white;font-weight:bold;'>STAR & APPROACH TO <span style='color:#00FF00'>${title}</span></div>
                <div data-field='STAR' style='color:white'>
                    STAR <span style='color:${arrivalsInfo.STAR === '' ? 'orange' : 'blue'}'>${arrivalsInfo.STAR === '' ? '[][][][][]' : arrivalsInfo.STAR}</span>
                </div>
                <div data-field='TRANS' style='color:white'>
                    TRANS <span style='color:${arrivalsInfo.TRANS === '' ? 'orange' : 'blue'}'>${arrivalsInfo.TRANS === '' ? '[][][][][]' : arrivalsInfo.TRANS}</span>
                </div>
                <div data-field='ILSRWY' style='color:white'>
                    ILSRWY <span style='color:${arrivalsInfo.ILSRWY === '' ? 'blue' : 'blue'}'>${arrivalsInfo.ILSRWY === '' ? '---' : arrivalsInfo.ILSRWY}</span>
                </div>
                <button class='mcdu-return' id='mcdu-return-arr'>&lt;RETURN</button>
            `;
        }
        else if (currentSection === 'DIR') {
            screenMain.innerHTML = `<div style="text-align:center;color:yellow;font-weight:bold;font-size:22px;margin-top:55px;">PLEASE USE FLIGHT PLAN FOR DIRECT FLIGHT</div>`;
        }
        else if (currentSection === 'DIM BRT' || currentSection === 'DATA') {
            screenMain.innerHTML = `<div style='text-align:center;color:yellow;font-weight:bold;font-size:24px;margin-top:50px;'>PAGE NOT IMPLEMENTED</div>`;
        }
        else if (
            currentSection === 'RAD\nNAV' ||
            currentSection === 'SEC\nF-PLN' ||
            currentSection === 'FUFL\nPRED'
        ) {
            screenMain.innerHTML = `<div style='text-align:center;color:yellow;font-weight:bold;font-size:24px;margin-top:50px;'>PAGE NOT IMPLEMENTED</div>`;
        }
        // CHECKLIST
        else if (currentSection === 'CHECK\nLIST') {
            const page = checklistPages[currentChecklistPage];
            screenMain.innerHTML = `<div class="mcdu-checklist-title">${page.title}</div>`;
            page.items.forEach((item, idx) => {
                screenMain.innerHTML += `
                    <div class="mcdu-checklist-item" data-idx="${idx}" style="user-select:none;">
                        <span>${item.toUpperCase()}</span>
                        <span class="mcdu-checklist-box${checklistState[currentChecklistPage][idx] ? " checked":""}" style="margin-left:8px;">
                            ${checklistState[currentChecklistPage][idx] ? '<span class="mcdu-checkmark">&#10003;</span>' : ''}
                        </span>
                    </div>
                `;
            });
            const nextPage = (currentChecklistPage + 1) % checklistPages.length;
            const nextTitle = checklistPages[nextPage].title.toUpperCase();
            screenMain.innerHTML += `<div style="text-align:right;color:#00FF00;font-size:14px;">
                ${currentChecklistPage+1}/10 → ${nextTitle}
            </div>`;
        }

        screenInput.textContent = showError ? "ERROR" : inputBuffer;
        screenInput.style.color = showError ? 'red' : 'cyan';

        // F-PLN机场代码点击进入子界面
        if (currentSection === 'F-PLN') {
            if (document.getElementById('mcdu-dep')) {
                document.getElementById('mcdu-dep').onclick = () => {
                    subPageAirport = initFields.fromTo.split('/')[0];
                    currentSection = 'departure';
                    mcduRenderPage(screenMain, screenInput);
                };
            }
            if (document.getElementById('mcdu-arr')) {
                document.getElementById('mcdu-arr').onclick = () => {
                    subPageAirport = initFields.fromTo.split('/')[1];
                    currentSection = 'arrival';
                    mcduRenderPage(screenMain, screenInput);
                };
            }
            Array.from(screenMain.querySelectorAll('.mcdu-wpt-empty')).forEach(el => {
                const idx = parseInt(el.getAttribute('data-wpt'));
                el.onclick = () => {
                    if (inputBuffer.trim() && /^[A-Z0-9]{2,8}$/.test(inputBuffer.trim().toUpperCase())) {
                        fplnWaypoints[idx] = { name: inputBuffer.trim().toUpperCase() };
                        inputBuffer = "";
                        mcduRenderPage(screenMain, screenInput);
                    }
                };
            });
        }
        // <RETURN for subpages
        if (currentSection === 'departure') {
            if (document.getElementById('mcdu-return-dep')) {
                document.getElementById('mcdu-return-dep').onclick = () => {
                    currentSection = 'F-PLN';
                    mcduRenderPage(screenMain, screenInput);
                };
            }
        }
        if (currentSection === 'arrival') {
            if (document.getElementById('mcdu-return-arr')) {
                document.getElementById('mcdu-return-arr').onclick = () => {
                    currentSection = 'F-PLN';
                    mcduRenderPage(screenMain, screenInput);
                };
            }
        }
    }

    function openMCDUPanel() {
        if (mcduPanelOpen) return;
        mcduPanelOpen = true;

        mcduPanel = document.createElement('div');
        mcduPanel.id = 'mcdu-panel';
        mcduPanel.style.zIndex = 100000;
        document.body.appendChild(mcduPanel);

        const style = document.createElement('style');
        style.id = 'mcdu-panel-style';
        style.textContent = `
            #mcdu-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #333;
                color: white;
                font-family: monospace;
                border: 2px solid #444;
                z-index: 99999;
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 0 10px #000;
                user-select: none;
                transform: scale(0.75);
                transform-origin: bottom right;
            }
            .mcdu-screen {
                background: black;
                height: 170px;
                margin-bottom: 10px;
                padding: 10px 20px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                font-size: 14px;
                color: white;
                position: relative;
            }
            .mcdu-grid {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                grid-gap: 5px;
            }
            .mcdu-btn {
                height: 42px;
                background: #555;
                border: 1px solid #888;
                border-radius: 5px;
                color: white;
                font-size: 15px;
                font-family: system-ui, Arial, sans-serif !important;
                white-space: pre-line;
                text-align: center;
                cursor: pointer;
                transition: background 0.1s;
            }
            .mcdu-btn:active {
                background: #777;
            }
            .mcdu-btn.blank {
                background: transparent;
                border: none;
                cursor: default;
            }
            .mcdu-code {
                text-decoration: underline;
                color: #00FF00;
                cursor: pointer;
                transition: color 0.2s;
            }
            .mcdu-code:hover, .mcdu-return:hover {
                color: #FFD700;
                cursor: pointer;
            }
            .mcdu-return {
                color: white;
                text-align: left;
                font-weight: bold;
                cursor: pointer;
                position: absolute;
                left: 0;
                bottom: 0;
                background: none;
                border: none;
                font-size: 15px;
                padding-left: 10px;
                padding-bottom: 5px;
                z-index: 2;
            }
            .mcdu-wpt {
                cursor: pointer;
            }
            .mcdu-wpt-empty {
                color: #888;
            }
            .mcdu-checklist-title {
                color: white;
                text-align: center;
                font-weight: bold;
                font-size: 17px;
                letter-spacing: 2px;
                margin-bottom: 5px;
            }
            .mcdu-checklist-item {
                display: flex;
                align-items: center;
                color: white;
                font-size: 16px;
                margin: 3px 0;
                cursor: pointer;
                letter-spacing: 2px;
                font-family: monospace;
            }
            .mcdu-checklist-item:hover {
                cursor: pointer;
                background: #444;
            }
            .mcdu-checklist-box {
                width: 23px;
                height: 23px;
                border: 2px solid #aaa;
                background: #222;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-left: 10px;
                border-radius: 5px;
                font-size: 20px;
                color: #00FF00;
                transition: background 0.15s;
            }
            .mcdu-checklist-box.checked {
                background: #333;
                border-color: #00FF00;
            }
            .mcdu-checklist-box > .mcdu-checkmark {
                font-size: 19px;
                color: #00FF00;
                font-weight: bold;
            }
            .mcdu-pref-footer {
                position: absolute;
                right: 10px;
                bottom: 2px;
                font-size: 13px;
                color: #00FF00;
                background: none;
                text-align: right;
                width: 92%;
                z-index: 1;
            }
        `;
        document.head.appendChild(style);

        const screen = document.createElement('div');
        screen.className = 'mcdu-screen';
        const screenMain = document.createElement('div');
        screenMain.id = 'mcdu-display-main';
        const screenInput = document.createElement('div');
        screenInput.id = 'mcdu-display-input';
        screenInput.style.color = 'cyan';
        screenInput.style.height = '18px';
        screen.appendChild(screenMain);
        screen.appendChild(screenInput);
        mcduPanel.appendChild(screen);

        const grid = document.createElement('div');
        grid.className = 'mcdu-grid';
        const layout = [
            ["DIR", "PROG", "PREF", "INIT", "DATA", "DIM BRT", "", ""],
            ["F-PLN", "RAD\nNAV", "FUFL\nPRED", "SEC\nF-PLN", "CHECK\nLIST", "MCDU\nMENU", "", ""],
            ["AIR\nPORT", "", "", "", "", "", "", ""],
            ["←", "↑", "A", "B", "C", "D", "E", ""],
            ["→", "↓", "F", "G", "H", "I", "J", ""],
            ["1", "2", "3", "K", "L", "M", "N", "O"],
            ["4", "5", "6", "P", "Q", "R", "S", "T"],
            ["7", "8", "9", "U", "V", "W", "X", "Y"],
            [".", "0", "+/-", "Z", "SP", "DEL", "/", "CLR"]
        ];
        layout.forEach(row => {
            row.forEach(label => {
                const btn = document.createElement('div');
                btn.className = 'mcdu-btn';
                if (!label || label === "") btn.classList.add('blank');
                else {
                    btn.textContent = label;
                    btn.onclick = () => {
                        showError = false;
                        if (label === "CLR") inputBuffer = "";
                        else if (label === "DEL") {
                           inputBuffer = inputBuffer.slice(0, -1);
                        }

                        else if (label === "SP") inputBuffer += " ";
                        else if (label === "+/-") {
                            if (/^\d+$/.test(inputBuffer)) inputBuffer = '-' + inputBuffer;
                            else if (/^-\d+$/.test(inputBuffer)) inputBuffer = inputBuffer.slice(1);
                        }
                        else if (label === "←") {
                            if (currentSection === 'PREF') {
                                currentPerfPage = (currentPerfPage + perfPages.length - 1) % perfPages.length;
                                mcduRenderPage(screenMain, screenInput);
                                return;
                            }
                            if (currentSection === 'CHECK\nLIST') {
                                currentChecklistPage = (currentChecklistPage + checklistPages.length - 1) % checklistPages.length;
                                mcduRenderPage(screenMain, screenInput);
                                return;
                            }
                        } else if (label === "→") {
                            if (currentSection === 'PREF') {
                                currentPerfPage = (currentPerfPage + 1) % perfPages.length;
                                mcduRenderPage(screenMain, screenInput);
                                return;
                            }
                            if (currentSection === 'CHECK\nLIST') {
                                currentChecklistPage = (currentChecklistPage + 1) % checklistPages.length;
                                mcduRenderPage(screenMain, screenInput);
                                return;
                            }
                        }
                        else if (label === "↑") {
                            if (currentSection === 'F-PLN') {
                                fplnPageIdx = fplnPageIdx > 0 ? fplnPageIdx - 1 : 0;
                            }
                        } else if (label === "↓") {
                            if (currentSection === 'F-PLN') {
                                const maxIdx = Math.max(0, Math.ceil((fplnWaypoints.length + 1) / fplnPerPage) - 1);
                                fplnPageIdx = fplnPageIdx < maxIdx ? fplnPageIdx + 1 : maxIdx;
                            }
                        }
                        else if (label === "MCDU\nMENU") currentSection = 'menu';
                        else if (sectionNames.includes(label)) {
                            currentSection = label;
                            if (label === 'F-PLN') {
                                fplnPageIdx = 0;
                                updateFplnWaypointsFromDOM();
                            }
                            if (label === 'CHECK\nLIST') currentChecklistPage = 0;
                        }

                        else inputBuffer += label.replace("\n", "");
                        mcduRenderPage(screenMain, screenInput);
                    };
                }
                grid.appendChild(btn);
            });
        });
        mcduPanel.appendChild(grid);

        screenMain.addEventListener("click", e => {
            const field = e.target.closest("div")?.dataset?.field;
            if (!field || !inputBuffer) return;
            let value = inputBuffer.trim().toUpperCase();
            showError = false;
            // PERF TAKE OFF
            if (currentSection === 'PREF' && perfPages[currentPerfPage] === 'TAKE OFF') {
                const data = perfData['TAKE OFF'];
                if (["V1", "VR", "V2"].includes(field)) {
                    if (/^\d{3}$/.test(value)) {
                        data[field] = value;
                        if (field === "V1") {
                            v1Value = parseInt(value);
                            v1Played = false;
                        }
                    }
                    else showError = true;
                } else if (field === "TRANSALT") {
                    if (/^\d{4}$/.test(value)) data.TRANSALT = value;
                    else showError = true;
                } else if (field === "FLAPS") {
                    const num = parseInt(value);
                    if (!isNaN(num)) {
                        if (num >= 0 && num <= 4) data.FLAPS = `${num}`;
                        else if (num > 4 && num <= 40) data.FLAPS = `${num}°`;
                        else showError = true;
                    } else showError = true;
                } else if (field === "TOTEMP") {
                    if (/^-?\d+$/.test(value)) data.TOTEMP = `${value}°`;
                    else data.TOTEMP = 'ERROR', showError = true;
                }
            }
            // PERF CLB
            else if (currentSection === 'PREF' && perfPages[currentPerfPage] === 'CLB') {
                const data = perfData['CLB'];
                if (field === "COSTINDEX") {
                    if (/^\d{1,3}$/.test(value) && parseInt(value) <= 999) data.COSTINDEX = value;
                    else showError = true;
                } else if (field === "CLBWIND") {
                    if (/^\d{3}\/\d{2}$/.test(value)) data.CLBWIND = value;
                    else showError = true;
                } else if (field === "TRIPWIND") {
                    if (/^\d{3}\/\d{2}$/.test(value)) data.TRIPWIND = value;
                    else showError = true;
                } else if (field === "ECONCLBSPD") {
                    if (/^\d{3}$/.test(value)) data.ECONCLBSPD = value;
                    else showError = true;
                } else if (field === "STEPALTS") {
                    if (/^\d{5}\/\d{5}$/.test(value)) data.STEPALTS = value;
                    else showError = true;
                }
            }
            // PERF CRZ
            else if (currentSection === 'PREF' && perfPages[currentPerfPage] === 'CRZ') {
                const data = perfData['CRZ'];
                if (field === "CRZFL") {
                    if (/^\d{3}$/.test(value)) data.CRZFL = `FL${value}`;
                    else showError = true;
                } else if (field === "OPTFL") {
                    if (/^\d{3}$/.test(value)) data.OPTFL = `FL${value}`;
                    else showError = true;
                } else if (field === "ECONCRZSPD") {
                    if (/^\.\d{2}$/.test(inputBuffer)) data.ECONCRZSPD = value;
                    else showError = true;
                } else if (field === "WIND") {
                    if (/^\d{3}\/\d{2}$/.test(value)) data.WIND = value;
                    else showError = true;
                } else if (field === "TDPRED") {
                    if (/^\d{1,4}$/.test(value)) data.TDPRED = value;
                    else showError = true;
                }
            }
            // PERF DES
            else if (currentSection === 'PREF' && perfPages[currentPerfPage] === 'DES') {
                const data = perfData['DES'];
                if (field === "DESWIND") {
                    if (/^\d{3}\/\d{2}$/.test(value)) data.DESWIND = value;
                    else showError = true;
                } else if (field === "ECONDESSPD") {
                    if (/^\d{3}$/.test(value)) {
                        let spd = parseInt(value);
                        let mach = Math.round((spd/950)*100)/100;
                        let machStr = mach.toFixed(2).replace(/^0+/, '');
                        data.ECONDESSPD = `${value}/${machStr}`;
                    } else showError = true;
                } else if (field === "MANDESSPD") {
                    if (/^\d{3,4}$/.test(value)) {
                        data.MANDESSPD = value.length === 3 ? `${value}/----` : `---/${value}`;
                    } else if (/^\d{3}\/\d{4}$/.test(value) || /^\d{3}\/\d{3}$/.test(value)) {
                        data.MANDESSPD = value;
                    } else showError = true;
                } else if (field === "DECELPT") {
                    if (/^\d{3}\/\d{2}$/.test(value)) data.DECELPT = `${value}NM`;
                    else showError = true;
                } else if (field === "APPRSPD") {
                    if (/^\d{3}$/.test(value)) data.APPRSPD = value;
                    else showError = true;
                }
            }
            // INIT
            else if (currentSection === 'INIT') {
                if (field === "fromTo" && /^[A-Z]{4}\/([A-Z]{4})$/.test(value)) initFields.fromTo = value;
                else if (field === "fltNbr") initFields.fltNbr = value;
                else if (field === "costIndex" && /^\d{1,3}$/.test(value)) initFields.costIndex = value;
                else if (field === "crzFl" && /^FL\d{3}$/.test(value)) {
                    const fl = parseInt(value.slice(2));
                    const temp = Math.round(-0.002 * fl * 100 + 15);
                    initFields.crzFl = `${value}/${temp}°`;
                } else if (field === "altn" && /^[A-Z]{4}$/.test(value)) initFields.altn = value;
                else showError = true;
            }
            // Departure Subpage
            else if (currentSection === 'departure') {
                if (field === 'RWY') {
                    if (/^[A-Z0-9]{3}$/.test(value)) departuresInfo.RWY = value;
                    else showError = true;
                } else if (field === 'SIDS') {
                    if (/^[A-Z0-9]{5,6}$/.test(value)) departuresInfo.SIDS = value;
                    else showError = true;
                }
            }
            // Arrival Subpage
            else if (currentSection === 'arrival') {
                if (field === 'STAR') {
                    if (/^[A-Z0-9]{5,6}$/.test(value)) arrivalsInfo.STAR = value;
                    else showError = true;
                } else if (field === 'TRANS') {
                    if (/^[A-Z0-9]{5,6}$/.test(value)) arrivalsInfo.TRANS = value;
                    else showError = true;
                } else if (field === 'ILSRWY') {
                    if (/^[A-Z0-9]{3}$/.test(value)) arrivalsInfo.ILSRWY = value;
                    else showError = true;
                }
            }
            inputBuffer = "";
            mcduRenderPage(screenMain, screenInput);
        });

        mcduPanel._v1timer = setInterval(() => {
            updateFplnWaypointsFromDOM(); 
            if (currentSection === 'F-PLN') {
                mcduRenderPage(screenMain, screenInput);
            }


            if (currentSection === 'PROG') mcduRenderPage(screenMain, screenInput);

            let v1ForSound = null;
            let v1Raw = perfData['TAKE OFF']?.V1;
            if (/^\d{3}$/.test(v1Raw)) v1ForSound = parseInt(v1Raw, 10);
            if (v1ForSound && !v1Played && window.geofs && geofs.animation && geofs.animation.values) {
                const speed = geofs.animation.values.groundSpeedKnt;
                if (speed >= v1ForSound - 4) {
                    playV1Audio();
                    v1Played = true;
                }
            }
        }, 500);

        mcduRenderPage(screenMain, screenInput);
    }

    function closeMCDUPanel() {
        if (!mcduPanelOpen) return;
        mcduPanelOpen = false;
        if (mcduPanel) {
            if (mcduPanel._v1timer) clearInterval(mcduPanel._v1timer);
            mcduPanel.remove();
            mcduPanel = null;
        }
        const styleEl = document.getElementById('mcdu-panel-style');
        if (styleEl) styleEl.remove();
    }

    // -------------------- 工具栏按钮 ---------------------
    function addMCDUToolbarButton() {
        if (document.getElementById("mcdu-toolbar-button")) return;
        let buttonDiv = document.createElement("div");
        buttonDiv.innerHTML = `<button class="mdl-button mdl-js-button geofs-f-standard-ui geofs-mediumScreenOnly" 
            data-toggle-panel=".geofs-livery-list" 
            data-tooltip-classname="mdl-tooltip--top" 
            tabindex="0" 
            id="mcdu-toolbar-button" 
            size="50%">MCDU</button>`;
        let inserted = false;
        let bottomUI;
        let retryCount = 0;
        function tryInsert() {
            bottomUI = document.getElementsByClassName("geofs-ui-bottom")[0];
            if (bottomUI) {
                let element = buttonDiv.firstElementChild;
                if (typeof geofs !== "undefined" && geofs.version >= 3.6) {
                    bottomUI.insertBefore(element, bottomUI.children[5] || null);
                } else {
                    bottomUI.insertBefore(element, bottomUI.children[4] || null);
                }
                element.onclick = function() {
                    if (mcduPanelOpen) closeMCDUPanel();
                    else openMCDUPanel();
                };
                inserted = true;
            } else if (retryCount < 30) {
                retryCount++;
                setTimeout(tryInsert, 300);
            }
        }
        tryInsert();
    }

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }
    ready(() => {
        addMCDUToolbarButton();
    });
    setTimeout(addMCDUToolbarButton, 3000);
})();
