const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testListingModal() {
    const artifactDir = "C:\\Users\\princ\\.gemini\\antigravity-ide\\brain\\854af1ee-fd17-4036-ab6b-0e72a3355282";
    
    const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
        '--headless=new',
        '--remote-debugging-port=9228',
        '--disable-gpu',
        '--window-size=1280,1000'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const list = await fetch('http://127.0.0.1:9228/json/list').then(r => r.json());
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

    // 2. Navigate to /vendor/listings
    await send('Page.navigate', { url: 'http://localhost:8000/vendor/listings' });
    await new Promise(r => setTimeout(r, 2500));

    // Ensure Light Mode
    await send('Runtime.evaluate', { expression: "document.documentElement.classList.remove('dark'); localStorage.setItem('tn_theme', 'light');" });
    await new Promise(r => setTimeout(r, 500));

    // Capture Listings Page
    const listingsShot = await send('Page.captureScreenshot', { format: 'png' });
    if (listingsShot.data) {
        fs.writeFileSync(path.join(artifactDir, 'vendor_listings_bright_page.png'), Buffer.from(listingsShot.data, 'base64'));
        console.log('Saved vendor_listings_bright_page.png');
    }

    // 3. Open Add Listing Modal
    await send('Runtime.evaluate', {
        expression: `
            (() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const addBtn = buttons.find(b => b.innerText.includes('Add New Listing') || b.innerText.includes('Add Listing') || b.innerText.includes('Add New Service'));
                if (addBtn) {
                    addBtn.click();
                    return 'Clicked Add Listing button';
                }
                return 'Add button not found';
            })()
        `
    });

    await new Promise(r => setTimeout(r, 1000));

    // Capture Add Listing Modal in Light Mode
    const modalShot = await send('Page.captureScreenshot', { format: 'png' });
    if (modalShot.data) {
        fs.writeFileSync(path.join(artifactDir, 'vendor_add_listing_modal_bright.png'), Buffer.from(modalShot.data, 'base64'));
        console.log('Saved vendor_add_listing_modal_bright.png');
    }

    // Capture in Dark Mode too
    await send('Runtime.evaluate', { expression: "document.documentElement.classList.add('dark'); localStorage.setItem('tn_theme', 'dark');" });
    await new Promise(r => setTimeout(r, 500));

    const modalDarkShot = await send('Page.captureScreenshot', { format: 'png' });
    if (modalDarkShot.data) {
        fs.writeFileSync(path.join(artifactDir, 'vendor_add_listing_modal_dark.png'), Buffer.from(modalDarkShot.data, 'base64'));
        console.log('Saved vendor_add_listing_modal_dark.png');
    }

    ws.close();
    chrome.kill();
}

testListingModal().then(() => {
    console.log('Modal test complete.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
