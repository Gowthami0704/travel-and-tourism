const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testVendorLoginAndDashboard() {
    const artifactDir = "C:\\Users\\princ\\.gemini\\antigravity-ide\\brain\\854af1ee-fd17-4036-ab6b-0e72a3355282";
    
    // Launch Chrome with remote debugging
    const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
        '--headless=new',
        '--remote-debugging-port=9227',
        '--disable-gpu',
        '--window-size=1280,1000'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const list = await fetch('http://127.0.0.1:9227/json/list').then(r => r.json());
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

    // 1. Navigate to /vendor/login
    await send('Page.navigate', { url: 'http://localhost:8000/vendor/login' });
    await new Promise(r => setTimeout(r, 2500));

    // Fill form using React input value setter
    const submitResult = await send('Runtime.evaluate', {
        expression: `
            (() => {
                const emailInput = document.querySelector('input[type="email"], input[name="email"]');
                const passInput = document.querySelector('input[type="password"], input[name="password"]');
                const submitBtn = document.querySelector('button[type="submit"]');
                
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                
                if (emailInput && passInput && submitBtn) {
                    nativeSetter.call(emailInput, 'vendor@tnexplore.com');
                    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                    emailInput.dispatchEvent(new Event('change', { bubbles: true }));

                    nativeSetter.call(passInput, 'password');
                    passInput.dispatchEvent(new Event('input', { bubbles: true }));
                    passInput.dispatchEvent(new Event('change', { bubbles: true }));

                    setTimeout(() => {
                        submitBtn.click();
                    }, 300);
                    return 'Filled and triggered click';
                }
                return 'Missing fields';
            })()
        `,
        returnByValue: true
    });
    console.log('Submit result:', submitResult.result.value);

    // Wait for redirect to /vendor/dashboard
    await new Promise(r => setTimeout(r, 4500));

    const currentLoc = await send('Runtime.evaluate', {
        expression: 'window.location.href',
        returnByValue: true
    });
    console.log('Location after submit:', currentLoc.result.value);

    // Capture Vendor Dashboard screenshot
    const dashShot = await send('Page.captureScreenshot', { format: 'png' });
    if (dashShot.data) {
        fs.writeFileSync(path.join(artifactDir, 'vendor_dashboard_live.png'), Buffer.from(dashShot.data, 'base64'));
        console.log('Saved vendor_dashboard_live.png');
    }

    // Check page text to confirm full content is rendered
    const contentCheck = await send('Runtime.evaluate', {
        expression: `({
            title: document.title,
            header: document.querySelector('h1, h2')?.innerText,
            navLinks: Array.from(document.querySelectorAll('aside nav a')).map(a => a.innerText.trim()),
            statsText: document.querySelector('.grid')?.innerText?.slice(0, 200),
            bodyPreview: document.body.innerText.slice(0, 300)
        })`,
        returnByValue: true
    });
    console.log('Dashboard content check:', contentCheck.result.value);

    // 2. Navigate to /vendor/studio/fleet
    await send('Page.navigate', { url: 'http://localhost:8000/vendor/studio/fleet' });
    await new Promise(r => setTimeout(r, 3000));

    const fleetShot = await send('Page.captureScreenshot', { format: 'png' });
    if (fleetShot.data) {
        fs.writeFileSync(path.join(artifactDir, 'vendor_studio_fleet_live.png'), Buffer.from(fleetShot.data, 'base64'));
        console.log('Saved vendor_studio_fleet_live.png');
    }

    // 3. Navigate to /vendor/studio
    await send('Page.navigate', { url: 'http://localhost:8000/vendor/studio' });
    await new Promise(r => setTimeout(r, 3000));

    const studioShot = await send('Page.captureScreenshot', { format: 'png' });
    if (studioShot.data) {
        fs.writeFileSync(path.join(artifactDir, 'vendor_studio_index_live.png'), Buffer.from(studioShot.data, 'base64'));
        console.log('Saved vendor_studio_index_live.png');
    }

    ws.close();
    chrome.kill();
}

testVendorLoginAndDashboard().then(() => {
    console.log('Vendor test completed.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
