const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testTripChats() {
    const artifactDir = "C:\\Users\\princ\\.gemini\\antigravity-ide\\brain\\854af1ee-fd17-4036-ab6b-0e72a3355282";
    
    const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
        '--headless=new',
        '--remote-debugging-port=9234',
        '--disable-gpu',
        '--window-size=1400,900'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    try {
        const list = await fetch('http://127.0.0.1:9234/json/list').then(r => r.json());
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

        console.log('Navigating to /vendor/login...');
        await send('Page.navigate', { url: 'http://127.0.0.1:8000/vendor/login' });
        await new Promise(r => setTimeout(r, 2000));

        // Fill credentials with nativeSetter
        console.log('Logging in via /vendor/login...');
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
                        submitBtn.click();
                        return 'login submitted';
                    }
                    return 'inputs not found';
                })()
            `
        });

        await new Promise(r => setTimeout(r, 3000));

        console.log('Navigating to /trip-chats...');
        await send('Page.navigate', { url: 'http://127.0.0.1:8000/trip-chats' });
        await new Promise(r => setTimeout(r, 2500));

        // Click first chat card
        console.log('Opening first chat room...');
        await send('Runtime.evaluate', {
            expression: `
                (() => {
                    const firstChat = document.querySelector('main a[href*="/trip-chats/"]');
                    if (firstChat) {
                        firstChat.click();
                        return 'clicked first chat';
                    }
                    return 'no chat link found';
                })()
            `
        });
        await new Promise(r => setTimeout(r, 3000));

        // Take light screenshot of chat room
        const roomShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'trip_chatroom_bright.png'), Buffer.from(roomShot.data, 'base64'));
        console.log('Saved trip_chatroom_bright.png');

        ws.close();
    } catch (e) {
        console.error('Error during test:', e);
    } finally {
        chrome.kill();
    }
}

testTripChats();
