// ==UserScript==
// @name         GeoFS MCDU MENU + INIT + PERF + F-PLN Pages Optimized (Direct Add Waypoint)
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  F-PLN航点直接点击空行录入，无橙色高亮，无取消、编辑状态
// @author       zm
// @match        https://www.geo-fs.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const mcdu = document.createElement('div');
    mcdu.id = 'mcdu-panel';
    document.body.appendChild(mcdu);

    const style = document.createElement('style');
    style.textContent = `
        #mcdu-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #333;
            color: white;
            font-family: monospace;
            border: 2px solid #444;
            z-index: 9999;
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
    `;
    document.head.appendChild(style);

    // --- UI Elements ---
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
    mcdu.appendChild(screen);

    const sectionNames = ["INIT", "F-PLN", "PROG", "PREF", "DATA", "DIR", "RAD\nNAV", "SEC\nF-PLN", "FUFL\nPRED", "ATC\nCOMM", "AIR\nPORT", "DIM BRT"];
    let currentSection = 'menu';
    let inputBuffer = "";
    let showError = false;
    let currentPerfPage = 0;

    // --- INIT Fields ---
    const initFields = {
        coRte: "[   ][   ][   ][   ][   ][   ][   ][   ][   ][   ]",
        altn: "NONE",
        fromTo: "[ ][ ][ ][ ]/[ ][ ][ ][ ]",
        fltNbr: "[ ][ ][ ][ ][ ][ ]",
        costIndex: "[ ][ ][ ]",
        crzFl: "-----/---°"
    };

    // --- PERF Pages ---
    const perfPages = ['TAKE OFF', 'PERF CLIMB', 'PERF CRUISE', 'PERF APPROACH'];
    const perfData = {
        'TAKE OFF': { V1: '[][][]', VR: '[][][]', V2: '[][][]', TRANSALT: '[    ]', FLAPS: '[     ]', TOTEMP: '---°' },
        'PERF CLIMB': { CRZFL: '---', CRZTEMP: '---°', STEPALTS: '---/---/---' },
        'PERF CRUISE': {},
        'PERF APPROACH': {}
    };

    // --- F-PLN Fields ---
    let fplnWaypoints = []; // Array of {name: string}
    let fplnPageIdx = 0; // Page index for waypoints (5 per page)
    const fplnPerPage = 5; // Waypoints per page

    // --- Departure/Arrival Subpages ---
    let subPageMode = null; // 'departure' or 'arrival'
    let subPageAirport = '';
    let departuresInfo = { RWY: '', SIDS: '' };
    let arrivalsInfo = { STAR: '', TRANS: '', ILSRWY: '' };

    function renderPage() {
        screenMain.innerHTML = "";
        // MENU
        if (currentSection === 'menu') {
            screenMain.innerHTML = `<div style='text-align:center;color:white;font-weight:bold;margin-bottom:10px'>GEOFS MCDU</div>
            <div style='text-align:center;color:cyan'>Applicable to all aircrafts!</div>
            <div style='text-align:center;color:cyan'>thank you for using it!</div>
            <div style='text-align:center;color:white'>AUTHOR: <span style='color:lime'>zm</span></div>
            <div style='text-align:center;color:white'>VERSION: <span style='color:lime'>0.6</span></div>
            <div style='text-align:center'><a href='https://discord.gg/4snrKwHpAA' target='_blank' style='color:deepskyblue;text-decoration:underline;cursor:pointer'>JOIN OUR DISCORD GROUP</a></div>`;
        }
        // INIT
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
        // PERF
        else if (currentSection === 'PREF') {
            const title = perfPages[currentPerfPage];
            screenMain.innerHTML = `<div style='text-align:center;color:white'>${title}</div>`;
            const data = perfData[title];
            if (title === 'TAKE OFF') {
                screenMain.innerHTML += `
                    <div data-field='V1'><span style='color:white'>V1</span> <span style='color:${data.V1.includes('[') ? 'orange' : 'cyan'}'>${data.V1}</span></div>
                    <div data-field='VR'><span style='color:white'>VR</span> <span style='color:${data.VR.includes('[') ? 'orange' : 'cyan'}'>${data.VR}</span></div>
                    <div data-field='V2'><span style='color:white'>V2</span> <span style='color:${data.V2.includes('[') ? 'orange' : 'cyan'}'>${data.V2}</span></div>
                    <div data-field='TRANSALT'><span style='color:white'>TRANS ALT</span> <span style='color:${data.TRANSALT.includes('[') ? 'lightblue' : 'cyan'}'>${data.TRANSALT}</span></div>
                    <div data-field='FLAPS'><span style='color:white'>FLAPS</span> <span style='color:${data.FLAPS === 'ERROR' ? 'red' : (data.FLAPS.includes('[') ? 'lightblue' : 'cyan')}'>${data.FLAPS}</span></div>
                    <div data-field='TOTEMP'><span style='color:white'>TO TEMP</span> <span style='color:${data.TOTEMP === '---°' ? 'lightblue' : (data.TOTEMP === 'ERROR' ? 'red' : 'cyan')}'>${data.TOTEMP}</span></div>
                    <div style='text-align:right;color:white'>${title} ${currentPerfPage + 1}/4</div>`;
            } else {
                screenMain.innerHTML += `<div style='text-align:center;color:cyan'>PAGE NOT IMPLEMENTED</div>
                <div style='text-align:right;color:white'>${title} ${currentPerfPage + 1}/4</div>`;
            }
        }
        // F-PLN
        else if (currentSection === 'F-PLN') {
            const ftFilled = /^[A-Z]{4}\/[A-Z]{4}$/.test(initFields.fromTo);
            if (!ftFilled) {
                screenMain.innerHTML = `<div style='text-align:center;color:yellow;font-weight:bold;'>ERROR INIT INFORMATION IS NOT FILLED IN</div>`;
            } else {
                const [dep, arr] = initFields.fromTo.split('/');
                screenMain.innerHTML = `
                  <div>
                    <span class='mcdu-code' id='mcdu-dep' style='margin-right:7px;'>${dep}</span>
                    <span style='color:#00FF00'>→</span>
                    <span class='mcdu-code' id='mcdu-arr' style='margin-left:7px;'>${arr}</span>
                  </div>`;
                let wptStart = fplnPageIdx * fplnPerPage;
                let wptEnd = Math.min(fplnWaypoints.length, wptStart + fplnPerPage);
                for (let i = wptStart; i < wptEnd; ++i) {
                    screenMain.innerHTML +=
                        `<div class='mcdu-wpt' data-wpt='${i}' style='color:white;'>${i + 1}. ${fplnWaypoints[i].name}</div>`;
                }
                for (let j = wptEnd - wptStart; j < fplnPerPage; ++j) {
                    let idx = wptStart + j;
                    screenMain.innerHTML += `<div class='mcdu-wpt mcdu-wpt-empty' data-wpt='${idx}' style='color:#888;'>${idx + 1}. ---</div>`;
                }
                screenMain.innerHTML += `<div style='text-align:center;color:#888'> </div>`;
                screenMain.innerHTML += `<div style='text-align:right;color:#00FF00'>↑↓</div>`;
            }
        }
        // Departure Subpage
        else if (currentSection === 'departure') {
            const title = subPageAirport ? subPageAirport : '----';
            screenMain.innerHTML +=
                `<div style='text-align:center;color:white;font-weight:bold;'>DEPARTURES FROM <span style='color:#00FF00'>${title}</span></div>`;
            screenMain.innerHTML +=
                `<div data-field='RWY' style='color:white'>
                    RWY <span style='color:${departuresInfo.RWY === '' ? 'blue' : 'blue'}'>${departuresInfo.RWY === '' ? '---' : departuresInfo.RWY}</span>
                </div>`;
            screenMain.innerHTML +=
                `<div data-field='SIDS' style='color:white'>
                    SIDS <span style='color:${departuresInfo.SIDS === '' ? 'orange' : 'blue'}'>${departuresInfo.SIDS === '' ? '[][][][][]' : departuresInfo.SIDS}</span>
                </div>`;
            screenMain.innerHTML += `<button class='mcdu-return' id='mcdu-return-dep'>&lt;RETURN</button>`;
        }
        // Arrival Subpage
        else if (currentSection === 'arrival') {
            const title = subPageAirport ? subPageAirport : '----';
            screenMain.innerHTML +=
                `<div style='text-align:center;color:white;font-weight:bold;'>STAR & APPROACH TO <span style='color:#00FF00'>${title}</span></div>`;
            screenMain.innerHTML +=
                `<div data-field='STAR' style='color:white'>
                    STAR <span style='color:${arrivalsInfo.STAR === '' ? 'orange' : 'blue'}'>${arrivalsInfo.STAR === '' ? '[][][][][]' : arrivalsInfo.STAR}</span>
                </div>`;
            screenMain.innerHTML +=
                `<div data-field='TRANS' style='color:white'>
                    TRANS <span style='color:${arrivalsInfo.TRANS === '' ? 'orange' : 'blue'}'>${arrivalsInfo.TRANS === '' ? '[][][][][]' : arrivalsInfo.TRANS}</span>
                </div>`;
            screenMain.innerHTML +=
                `<div data-field='ILSRWY' style='color:white'>
                    ILSRWY <span style='color:${arrivalsInfo.ILSRWY === '' ? 'blue' : 'blue'}'>${arrivalsInfo.ILSRWY === '' ? '---' : arrivalsInfo.ILSRWY}</span>
                </div>`;
            screenMain.innerHTML += `<button class='mcdu-return' id='mcdu-return-arr'>&lt;RETURN</button>`;
        }

        screenInput.textContent = showError ? "ERROR" : inputBuffer;
        screenInput.style.color = showError ? 'red' : 'cyan';

        // F-PLN机场代码点击进入子界面
        if (currentSection === 'F-PLN') {
            if (document.getElementById('mcdu-dep')) {
                document.getElementById('mcdu-dep').onclick = () => {
                    subPageAirport = initFields.fromTo.split('/')[0];
                    currentSection = 'departure';
                    renderPage();
                };
            }
            if (document.getElementById('mcdu-arr')) {
                document.getElementById('mcdu-arr').onclick = () => {
                    subPageAirport = initFields.fromTo.split('/')[1];
                    currentSection = 'arrival';
                    renderPage();
                };
            }
            // 航点点击
            Array.from(screenMain.querySelectorAll('.mcdu-wpt-empty')).forEach(el => {
                const idx = parseInt(el.getAttribute('data-wpt'));
                el.onclick = () => {
                    if (inputBuffer.trim() && /^[A-Z0-9]{2,8}$/.test(inputBuffer.trim().toUpperCase())) {
                        fplnWaypoints[idx] = { name: inputBuffer.trim().toUpperCase() };
                        inputBuffer = "";
                        renderPage();
                    }
                };
            });
        }
        // <RETURN for subpages
        if (currentSection === 'departure') {
            if (document.getElementById('mcdu-return-dep')) {
                document.getElementById('mcdu-return-dep').onclick = () => {
                    currentSection = 'F-PLN';
                    renderPage();
                };
            }
        }
        if (currentSection === 'arrival') {
            if (document.getElementById('mcdu-return-arr')) {
                document.getElementById('mcdu-return-arr').onclick = () => {
                    currentSection = 'F-PLN';
                    renderPage();
                };
            }
        }
    }

    // --- 字段点击录入 ---
    screenMain.addEventListener("click", e => {
        const field = e.target.closest("div")?.dataset?.field;
        if (!field || !inputBuffer) return;
        let value = inputBuffer.trim().toUpperCase();
        showError = false;

        // PERF TAKE OFF
        if (currentSection === 'PREF' && perfPages[currentPerfPage] === 'TAKE OFF') {
            const data = perfData['TAKE OFF'];
            if (["V1", "VR", "V2"].includes(field)) {
                if (/^\d{3}$/.test(value)) data[field] = value;
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
        renderPage();
    });

    // --- Button Grid ---
    const grid = document.createElement('div');
    grid.className = 'mcdu-grid';
    const layout = [
        ["DIR", "PROG", "PREF", "INIT", "DATA", "DIM BRT", "", ""],
        ["F-PLN", "RAD\nNAV", "FUFL\nPRED", "SEC\nF-PLN", "ATC\nCOMM", "MCDU\nMENU", "", ""],
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
                        // F-PLN 删除最后一个航点
                        if (currentSection === 'F-PLN' && fplnWaypoints.length > 0) {
                            fplnWaypoints.pop();
                        }
                        else inputBuffer = inputBuffer.slice(0, -1);
                    }
                    else if (label === "SP") inputBuffer += " ";
                    else if (label === "+/-") {
                        if (/^\d+$/.test(inputBuffer)) inputBuffer = '-' + inputBuffer;
                        else if (/^-\d+$/.test(inputBuffer)) inputBuffer = inputBuffer.slice(1);
                    }
                    else if (label === "↑") {
                        if (currentSection === 'F-PLN') {
                            fplnPageIdx = fplnPageIdx > 0 ? fplnPageIdx - 1 : 0;
                        } else if (currentSection === 'PREF') {
                            currentPerfPage = (currentPerfPage + 3) % 4;
                        }
                    } else if (label === "↓") {
                        if (currentSection === 'F-PLN') {
                            const maxIdx = Math.max(0, Math.ceil(fplnWaypoints.length / fplnPerPage) - 1);
                            fplnPageIdx = fplnPageIdx < maxIdx ? fplnPageIdx + 1 : maxIdx;
                        } else if (currentSection === 'PREF') {
                            currentPerfPage = (currentPerfPage + 1) % 4;
                        }
                    }
                    else if (label === "←") {
                        if (currentSection === 'PREF') currentPerfPage = (currentPerfPage + 3) % 4;
                    } else if (label === "→") {
                        if (currentSection === 'PREF') currentPerfPage = (currentPerfPage + 1) % 4;
                    }
                    else if (label === "MCDU\nMENU") currentSection = 'menu';
                    else if (sectionNames.includes(label)) {
                        currentSection = label;
                        if (label === 'F-PLN') fplnPageIdx = 0;
                    }
                    else inputBuffer += label.replace("\n", "");
                    renderPage();
                };
            }
            grid.appendChild(btn);
        });
    });
    mcdu.appendChild(grid);
    renderPage();
})();
