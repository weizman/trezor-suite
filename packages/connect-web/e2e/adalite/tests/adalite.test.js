const { test, expect } = require('@playwright/test');
const { Controller } = require('../../../../integration-tests/websocket-client');
const { createDeferred } = require('@trezor/utils');

const url = process.env.URL || 'https://localhost:3000/';
const controller = new Controller();

let popup;
let popupClosedPromise;

test.beforeAll(async () => {
    await controller.connect();
});

test.beforeEach(async ({ page }) => {
    await controller.send({
        type: 'bridge-stop',
    });
    await controller.send({
        type: 'emulator-stop',
    });
    await controller.send({
        type: 'emulator-start',
        wipe: true,
    });
    await controller.send({
        type: 'emulator-setup',
        mnemonic: 'alcohol woman abuse must during monitor noble actual mixed trade anger aisle',
        pin: '',
        passphrase_protection: false,
        label: 'My Trevor',
        needs_backup: false,
    });
    await controller.send({
        type: 'bridge-start',
    });
});

test.afterEach(async ({ page }) => {});

test('test adalite', async ({ page }) => {
    await page.goto(url);
    await page.locator('text=Continue to AdaLite').click();
    await page.locator('.hw-wallet').click();

    const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.locator('text=Trezor model TSupport us by buying one Unlock with >> button').click(),
    ]);
    await popup.waitForLoadState('load');

    await popup.locator('#container >> text=Allow once for this session').click();
    await popup.locator('#container button:has-text("Export")').click();

    await page.locator('button:has-text("Close")').click();

    await page.pause();
});
