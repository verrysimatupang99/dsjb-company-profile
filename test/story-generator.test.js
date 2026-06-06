
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Mock HTML environment
const html = `
  <canvas id="storyCanvas"></canvas>
  <input id="storyTitle" value="Title">
  <input id="storySubtitle" value="Subtitle">
  <textarea id="storyBody"></textarea>
  <input id="storyCTA" value="CTA">
  <div id="templateSelector"></div>
  <div id="colorRow"></div>
  <button id="btnReset"></button>
  <button id="btnDownload"></button>
  <button id="btnWhatsApp"></button>
  <div id="labelTitle"></div>
  <div id="labelSubtitle"></div>
  <div id="labelBody"></div>
  <div id="labelCTA"></div>
  <div id="countTitle"></div>
  <div id="countSubtitle"></div>
  <div id="countBody"></div>
  <div id="countCTA"></div>
`;

describe('Story Generator', () => {
    let dom, window, document, canvas;

    beforeEach(() => {
        dom = new JSDOM(html, { resources: "usable" });
        window = dom.window;
        document = window.document;
        global.document = document;
        global.window = window;
        global.Image = window.Image;
        global.HTMLCanvasElement = window.HTMLCanvasElement;
        
        // Mock Canvas context
        canvas = document.getElementById("storyCanvas");
        // Mock Canvas context
        const mockGradient = { addColorStop: jest.fn() };
        canvas.getContext = jest.fn().mockReturnValue({
            fillRect: jest.fn(),
            stroke: jest.fn(),
            fillText: jest.fn(),
            measureText: (text) => ({ width: text.length * 10 }),
            save: jest.fn(),
            restore: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            quadraticCurveTo: jest.fn(),
            fill: jest.fn(),
            arc: jest.fn(),
            createLinearGradient: () => mockGradient,
            strokeRect: jest.fn(),
            clearRect: jest.fn(),
            closePath: jest.fn(),
            textBaseline: '',
            textAlign: '',
            fillStyle: '',
            font: '',
            globalAlpha: 1,
            lineWidth: 1,
            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetY: 0,
            translate: jest.fn(),
            ellipse: jest.fn()
        });
        // Load the actual script
        const script = fs.readFileSync(path.join(__dirname, '../assets/js/story-generator.js'), 'utf8');
        eval(script);
    });

    test('should initialize and render without crashing', () => {
        // Since it's an IIFE, it runs on load. 
        // Just checking if the canvas context was called
        expect(canvas.getContext).toHaveBeenCalled();
    });
});
