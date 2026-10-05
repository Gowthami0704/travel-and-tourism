const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testOpportunities() {
    const artifactDir = "C:\\Users\\princ\\.gemini\\antigravity-ide\\brain\\854af1ee-fd17-4036-ab6b-0e72a3355282";
    
    const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
        '--headless=new',
        '--remote-debugging-port=9229',
        '--disable-gpu',
        '--window-size=1280,1000'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const list = await fetch('http://127.0.0.1:9229/json/list').then(r => r.json());
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

    ws.addEventListener('message', (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
            console.log('CONSOLE:', msg.params.type, msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
        }
        if (msg.method === 'Runtime.exceptionThrown') {
            console.error('JS EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
        }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false });

    // 1. Navigate to /vendor/login and login
    await send('Page.navigate', { url: 'http://localhost:8000/vendor/login' });
    await new Promise(r => setTimeout(r, 2000));

    await send('Runtime.evaluate', {
        expression: `
            (() => {
                const emailInput = document.querySelector('input[type="email"], input[name="email"]');
                const passInput = document.querySelector('input[type="password"], input[name="password"]');
                const submitBtn = document.querySelector('button[type="submit"]');
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                if (emailInput && passInput && submitBtn) {
                    nativeSetter.call(emailInput, 'vendor@tnexplore.com');
                    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                    nativeSetter.call(passInput, 'password');
                    passInput.dispatchEvent(new Event('input', { bubbles: true }));
                    setTimeout(() => submitBtn.click(), 200);
                }
            })()
        `
    });

    await new Promise(r => setTimeout(r, 4000));

    // 2. Navigate to /vendor/opportunities
    await send('Page.navigate', { url: 'http://localhost:8000/vendor/opportunities' });
    await new Promise(r => setTimeout(r, 2500));

    const check = await send('Runtime.evaluate', {
        expression: `({
            url: window.location.href,
            title: document.title,
            leadCards: document.querySelectorAll('.bg-white, .border').length,
            bodyPreview: document.body.innerText.slice(0, 300)
        })`,
        returnByValue: true
    });
    console.log('Opportunities check:', check.result.value);

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot.data) {
        fs.writeFileSync(path.join(artifactDir, 'vendor_opportunities_live.png'), Buffer.from(shot.data, 'base64'));
        console.log('Saved vendor_opportunities_live.png');
    }

    ws.close();
    chrome.kill();
}

testOpportunities().then(() => {
    console.log('Opportunities test complete.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
