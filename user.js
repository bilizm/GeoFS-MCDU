// ==UserScript==
// @name         GeoFS MCDU MENU + INIT + PERF Pages
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  INIT页面输入修复，添加PERF页面及MCDU MENU增强（FLAPS 1-4无°，5以上加°）
// @author       111
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
            height: 160px;
            margin-bottom: 10px;
            padding: 10px 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            font-size: 14px;
            color: white;
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
            font-size: 14px;
            white-space: pre-line;
            text-align: center;
            cursor: pointer;
        }

        .mcdu-btn:active {
            background: #777;
        }

        .mcdu-btn.blank {
            background: transparent;
            border: none;
            cursor: default;
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
    mcdu.appendChild(screen);

    const sectionNames = ["INIT", "F-PLN", "PROG", "PREF", "DATA", "DIR", "RAD\nNAV", "SEC\nF-PLN", "FUFL\nPRED", "ATC\nCOMM", "AIR\nPORT", "DIM BRT"];

    let currentSection = 'menu';
    let inputBuffer = "";
    let showError = false;
    let currentPerfPage = 0;

    const initFields = {
        coRte: "[   ][   ][   ][   ][   ][   ][   ][   ][   ][   ]",
        altn: "NONE",
        fromTo: "[ ][ ][ ][ ]/[ ][ ][ ][ ]",
        fltNbr: "[ ][ ][ ][ ][ ][ ]",
        costIndex: "[ ][ ][ ]",
        crzFl: "-----/---°"
    };

    const perfPages = ['TAKE OFF', 'PERF CLIMB', 'PERF CRUISE', 'PERF APPROACH'];
    const perfData = {
        'TAKE OFF': { V1: '[][][]', VR: '[][][]', V2: '[][][]', TRANSALT: '[    ]', FLAPS: '[     ]', TOTEMP: '---°' },
        'PERF CLIMB': { CRZFL: '---', CRZTEMP: '---°', STEPALTS: '---/---/---' },
        'PERF CRUISE': {},
        'PERF APPROACH': {}
    };

    function renderPage() {
        screenMain.innerHTML = "";
        if (currentSection === 'menu') {
            screenMain.innerHTML = `<div style='text-align:center;color:white;font-weight:bold;margin-bottom:10px'>GEOFS MCDU</div>
            <div style='text-align:center;color:cyan'>Applicable to all aircrafts!</div>
            <div style='text-align:center;color:cyan'>thank you for using it!</div>
            <div style='text-align:center;color:white'>AUTHOR: <span style='color:lime'>zm</span></div>
            <div style='text-align:center;color:white'>VERSION: <span style='color:lime'>0.1</span></div>
            <div style='text-align:center'><a href='https://discord.gg/4snrKwHpAA' target='_blank' style='color:deepskyblue;text-decoration:underline;cursor:pointer'>JOIN OUR DISCORD GROUP</a></div>`;
        } else if (currentSection === 'INIT') {
            screenMain.innerHTML = `<div style='text-align:center;color:white'>INIT A</div>
            <div data-field='coRte'><span style='color:white'>CO RTE</span> <span style='color:orange'>${initFields.coRte}</span></div>
            <div data-field='altn'><span style='color:white'>ALTN/CO RTE</span> <span style='color:cyan'>${initFields.altn}</span></div>
            <div data-field='fromTo'><span style='color:white'>FROM/TO</span> <span style='color:${initFields.fromTo.includes('[') ? 'orange' : 'cyan'}'>${initFields.fromTo}</span></div>
            <div data-field='fltNbr'><span style='color:white'>FLT NMB</span> <span style='color:cyan'>${initFields.fltNbr}</span></div>
            <div data-field='costIndex'><span style='color:white'>COST INDEX</span> <span style='color:${initFields.costIndex.includes('[') ? 'orange' : 'cyan'}'>${initFields.costIndex}</span></div>
            <div data-field='crzFl'><span style='color:white'>CRZ FL/TEMP</span> <span style='color:${initFields.crzFl.includes('-') ? 'orange' : 'cyan'}'>${initFields.crzFl}</span></div>
            <div style='text-align:right;color:white'>INIT PAGE</div>`;
        } else if (currentSection === 'PREF') {
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
        screenInput.textContent = showError ? "ERROR" : inputBuffer;
        screenInput.style.color = showError ? 'red' : 'cyan';
    }

    screenMain.addEventListener("click", e => {
        const field = e.target.closest("div")?.dataset?.field;
        if (!field || !inputBuffer) return;
        let value = inputBuffer.trim().toUpperCase();
        showError = false;

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
        } else if (currentSection === 'INIT') {
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

        inputBuffer = "";
        renderPage();
    });

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
                    else if (label === "DEL") inputBuffer = inputBuffer.slice(0, -1);
                    else if (label === "SP") inputBuffer += " ";
                    else if (label === "+/-") {
                        if (/^\d+$/.test(inputBuffer)) inputBuffer = '-' + inputBuffer;
                        else if (/^-\d+$/.test(inputBuffer)) inputBuffer = inputBuffer.slice(1);
                    } else if (label === "←") {
                        if (currentSection === 'PREF') currentPerfPage = (currentPerfPage + 3) % 4;
                    } else if (label === "→") {
                        if (currentSection === 'PREF') currentPerfPage = (currentPerfPage + 1) % 4;
                    } else if (label === "↑" || label === "↓") {
                        // no scroll behavior
                    } else if (label === "MCDU\nMENU") currentSection = 'menu';
                    else if (sectionNames.includes(label)) currentSection = label;
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
