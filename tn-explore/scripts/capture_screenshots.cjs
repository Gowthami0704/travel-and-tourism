const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function capture() {
    const artifactDir = "C:\\Users\\princ\\.gemini\\antigravity-ide\\brain\\854af1ee-fd17-4036-ab6b-0e72a3355282";
    
    // Launch Chrome with remote debugging
    const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
        '--headless=new',
        '--remote-debugging-port=9222',
        '--disable-gpu',
        '--window-size=1280,1000'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    // Get the page target
    const list = await fetch('http://127.0.0.1:9222/json/list').then(r => r.json());
    const pageTarget = list.find(t => t.type === 'page') || list[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve) => {
        ws.onopen = resolve;
    });

    let id = 1;
    function send(method, params = {}) {
        return new Promise((resolve) => {
            const currentId = id++;
            const handler = (evt) => {
                const msg = JSON.parse(evt.data);
                if (msg.id === currentId) {
                    ws.removeEventListener('message', handler);
                    resolve(msg.result || msg);
                }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id: currentId, method, params }));
        });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false });

    // 1. Navigate to Custom Trips Create (Light Mode)
    await send('Page.navigate', { url: 'http://localhost:8000/custom-trips/create' });
    await new Promise(r => setTimeout(r, 3000));

    await send('Runtime.evaluate', { expression: "document.documentElement.classList.remove('dark'); localStorage.setItem('tn_theme', 'light');" });
    await new Promise(r => setTimeout(r, 500));

    const lightShot = await send('Page.captureScreenshot', { format: 'png' });
    if (lightShot.data) {
        fs.writeFileSync(path.join(artifactDir, 'custom_trips_light.png'), Buffer.from(lightShot.data, 'base64'));
        console.log('Saved custom_trips_light.png');
    }

    // 2. Toggle to Dark Mode
    await send('Runtime.evaluate', { expression: "document.documentElement.classList.add('dark'); localStorage.setItem('tn_theme', 'dark');" });
    await new Promise(r => setTimeout(r, 500));

    const darkShot = await send('Page.captureScreenshot', { format: 'png' });
    if (darkShot.data) {
        fs.writeFileSync(path.join(artifactDir, 'custom_trips_dark.png'), Buffer.from(darkShot.data, 'base64'));
        console.log('Saved custom_trips_dark.png');
    }

    // 3. Dev Theme Page in Light Mode
    await send('Page.navigate', { url: 'http://localhost:8000/dev/theme' });
    await new Promise(r => setTimeout(r, 2000));
    await send('Runtime.evaluate', { expression: "document.documentElement.classList.remove('dark');" });
    await new Promise(r => setTimeout(r, 500));

    const themeLightShot = await send('Page.captureScreenshot', { format: 'png' });
    if (themeLightShot.data) {
        fs.writeFileSync(path.join(artifactDir, 'theme_preview_light.png'), Buffer.from(themeLightShot.data, 'base64'));
        console.log('Saved theme_preview_light.png');
    }

    // 4. Dev Theme Page in Dark Mode
    await send('Runtime.evaluate', { expression: "document.documentElement.classList.add('dark');" });
    await new Promise(r => setTimeout(r, 500));

    const themeDarkShot = await send('Page.captureScreenshot', { format: 'png' });
    if (themeDarkShot.data) {
        fs.writeFileSync(path.join(artifactDir, 'theme_preview_dark.png'), Buffer.from(themeDarkShot.data, 'base64'));
        console.log('Saved theme_preview_dark.png');
    }

    ws.close();
    chrome.kill();
}

capture().then(() => {
    console.log('All screenshots captured successfully.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
