// import { PopupEventMessage } from 'packages/connect/lib/exports';

import { ServiceWorkerWindowChannel } from '../channels/serviceworker-window';

// import { ServiceWorkerWindowChannel } from '../channels/serviceworker-window';

// let _settings: any;
// const broadcast = new BroadcastChannel('connect-explorer');
// broadcast.onmessage = (event: any) => {
//     console.log('event in background-proxy-api', event);
//     const { data } = event;
//     const { method, args, id } = data;

//     if (method === 'init') {
//         const { settings } = args[0];
//         // TODO: use the provided settings in init.
//         console.log('settings', settings);
//         // const devSettings = {
//         //     manifest: {
//         //         email: 'test@webextension.com',
//         //         appUrl: 'http://localhost:8088',
//         //     },
//         //     transports: ['BridgeTransport', 'WebUsbTransport'],
//         //     connectSrc: 'http://localhost:8088/',
//         // };
//         // @ts-expect-error
//         TrezorConnect.init(settings).then((response: any) => {
//             broadcast.postMessage({
//                 id,
//                 payload: response,
//             });
//         });
//         return;
//     }

//     // @ts-expect-error
//     TrezorConnect[method](...args).then((response: any) => {
//         console.log('res', response);
//         broadcast.postMessage({
//             id,
//             payload: response,
//         });
//     });
// };

/**
 * TODO(karliatto):
 * There are several considerations with tha approach of using `ServiceWorkerWindowChannel` with `WindowServiceWorkerChannel`:
 *
 * 1. Service worker should be waiting for handshake for ever??
 * Since it is initialize when webextension is loaded but there might be no call to it.
 * 2. connect-explorer calls init TrezorConnect when the page changes the route and when calling a method.
 * It means that when connect-explorer calls TrezorConnect.init tha handshake was not completed.
 */

const _channel = new ServiceWorkerWindowChannel<any>({
    name: 'trezor-connect-proxy',
    channel: {
        here: '@trezor/connect-service-worker-proxy',
        peer: '@trezor/connect-foreground-proxy',
    },
    // logger: this.logger,
});
console.log('channel is initializing in service worker to be able to handshake', _channel);
_channel.init().then(() => {
    console.log('channel init');
    _channel.on('message', message => {
        console.log('message in connect-webextension in service-worker', message);

        const { id, payload } = message;
        const { method } = payload;

        const devSettings = {
            manifest: {
                email: 'test@webextension.com',
                appUrl: 'http://localhost:8088',
            },
            transports: ['BridgeTransport', 'WebUsbTransport'],
            connectSrc: 'http://localhost:8088/',
        };
        // @ts-expect-error
        TrezorConnect.init(devSettings).then(() => {
            // @ts-expect-error
            TrezorConnect[method](message.payload).then((response: any) => {
                console.log('response from method in service-worker', response);
                _channel.postMessage({
                    id,
                    payload: response.payload,
                });
            });
        });
    });
});
