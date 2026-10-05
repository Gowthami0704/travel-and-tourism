const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testHomeScroll() {
    const artifactDir = "C:\\Users\\princ\\.gemini\\antigravity-ide\\brain\\854af1ee-fd17-4036-ab6b-0e72a3355282";
    
    const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
        '--headless=new',
        '--remote-debugging-port=9235',
        '--disable-gpu',
        '--window-size=1400,900'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    try {
        const list = await fetch('http://127.0.0.1:9235/json/list').then(r => r.json());
        const pageTarget = list.find(t => t.type === 'page') || list[0];
        const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

        await new Promise((resolve) => {
            ws.onopen = resolve;
        });

        let id = 1;
        function send(method, params = {}) {
            return new Promise((resolve, reject) => {
                const reqId = id++;
                const handler = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.id === reqId) {
                        ws.removeEventListener('message', handler);
                        if (data.error) reject(data.error);
                        else resolve(data.result);
                    }
                };
                ws.addEventListener('message', handler);
                ws.send(JSON.stringify({ id: reqId, method, params }));
            });
        }

        await send('Page.enable');
        await send('Runtime.enable');
        await send('DOM.enable');

        console.log('Navigating to home http://127.0.0.1:8000/...');
        await send('Page.navigate', { url: 'http://127.0.0.1:8000/' });
        await new Promise(r => setTimeout(r, 2500));

        // Scroll down 750px so the cards pass under the sticky navbar
        console.log('Scrolling down 750px...');
        await send('Runtime.evaluate', {
            expression: `window.scrollTo(0, 750);`
        });
        await new Promise(r => setTimeout(r, 1000));

        // Capture screenshot of scrolled header
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'home_navbar_fixed.png'), Buffer.from(shot.data, 'base64'));
        console.log('Saved home_navbar_fixed.png');

        ws.close();
    } catch (e) {
        console.error('Error during test:', e);
    } finally {
        chrome.kill();
    }
}

testHomeScroll();
