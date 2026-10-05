const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testAiGuide() {
    const artifactDir = "C:\\Users\\princ\\.gemini\\antigravity-ide\\brain\\854af1ee-fd17-4036-ab6b-0e72a3355282";
    
    const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
        '--headless=new',
        '--remote-debugging-port=9236',
        '--disable-gpu',
        '--window-size=1440,960'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    try {
        const list = await fetch('http://127.0.0.1:9236/json/list').then(r => r.json());
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

        console.log('Navigating to http://127.0.0.1:8000/ai-guide...');
        await send('Page.navigate', { url: 'http://127.0.0.1:8000/ai-guide' });
        await new Promise(r => setTimeout(r, 2500));

        // Scroll down slightly to see cards
        await send('Runtime.evaluate', {
            expression: `window.scrollTo(0, 200);`
        });
        await new Promise(r => setTimeout(r, 800));

        // Capture light screenshot
        const lightShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'ai_guide_bright.png'), Buffer.from(lightShot.data, 'base64'));
        console.log('Saved ai_guide_bright.png');

        // Switch to dark mode
        await send('Runtime.evaluate', {
            expression: `document.documentElement.classList.add('dark');`
        });
        await new Promise(r => setTimeout(r, 500));

        // Capture dark screenshot
        const darkShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'ai_guide_dark.png'), Buffer.from(darkShot.data, 'base64'));
        console.log('Saved ai_guide_dark.png');

        ws.close();
    } catch (e) {
        console.error('Error during test:', e);
    } finally {
        chrome.kill();
    }
}

testAiGuide();
