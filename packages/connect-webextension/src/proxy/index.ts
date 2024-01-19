import EventEmitter from 'events';

// NOTE: @trezor/connect part is intentionally not imported from the index due to NormalReplacementPlugin
// in packages/suite-build/configs/web.webpack.config.ts
import {
    ERRORS,
    IFRAME,
    createErrorMessage,
    ConnectSettings,
    Manifest,
    UiResponseEvent,
    CallMethod,
} from '@trezor/connect/lib/exports';
import { factory } from '@trezor/connect/lib/factory';
// import { createWorkerProxy } from '@trezor/worker-proxy';

import { parseConnectSettings } from '../connectSettings';
import { WindowServiceWorkerChannel } from '../channels/window-serviceworker';

const eventEmitter = new EventEmitter();
let _settings = parseConnectSettings();

// TODO: type it
// let _proxy: any;

/**
 */
let _channel: any;

const manifest = (data: Manifest) => {
    _settings = parseConnectSettings({
        ..._settings,
        manifest: data,
    });
};

const dispose = () => {
    eventEmitter.removeAllListeners();
    _settings = parseConnectSettings();

    // if (_proxy) {
    //     _proxy.dispose();
    // }
    return Promise.resolve(undefined);
};

const cancel = (error?: string) => {
    console.error(error);

    // if (_proxy) {
    //     _proxy.cancel();
    // }
};

const init = async (settings: Partial<ConnectSettings> = {}): Promise<void> => {
    console.log('settings in init in proxy/index', settings);
    _settings = parseConnectSettings({ ..._settings, ...settings });

    // if (!_proxy) {
    //     _proxy = await createWorkerProxy<typeof TrezorConnect>('TrezorConnect');
    // }

    if (!_channel) {
        _channel = new WindowServiceWorkerChannel({
            name: 'trezor-connect-proxy',
            channel: {
                here: '@trezor/connect-foreground-proxy',
                peer: '@trezor/connect-service-worker-proxy',
            },
        });
    }

    if (!_settings.manifest) {
        throw ERRORS.TypedError('Init_ManifestMissing');
    }

    if (!_settings.transports?.length) {
        _settings.transports = ['BridgeTransport', 'WebUsbTransport'];
    }

    console.log('_channel in proxy is going to initialize', _channel);

    // return _proxy.init({ settings: _settings });
    return _channel.init();
};

const call: CallMethod = async (params: any) => {
    console.log('params in CallMethod', params);
    console.log('_channel', _channel);
    try {
        // const response = await _proxy[params.method](params);
        const response = await _channel.postMessage({
            type: IFRAME.CALL,
            payload: params,
        });
        console.log('response in call in connect-webextension src/proxy/index.ts', response);
        if (response) {
            return response;
        }
        return createErrorMessage(ERRORS.TypedError('Method_NoResponse'));
    } catch (error) {
        // _proxy.clear();
        _channel.clear();

        return createErrorMessage(error);
    }
};

const uiResponse = (response: UiResponseEvent) => {
    const { type, payload } = response;
    console.log('type', type);
    console.log('payload', payload);
    // TODO: ???
};

const renderWebUSBButton = () => {};

const requestLogin = () => {
    // todo: not supported yet
    throw ERRORS.TypedError('Method_InvalidPackage');
};

const disableWebUSB = () => {
    // todo: not supported yet, probably not needed
    throw ERRORS.TypedError('Method_InvalidPackage');
};

const requestWebUSBDevice = () => {
    // not needed - webusb pairing happens in popup
    throw ERRORS.TypedError('Method_InvalidPackage');
};

const TrezorConnect = factory({
    eventEmitter,
    manifest,
    init,
    call,
    requestLogin,
    uiResponse,
    renderWebUSBButton,
    disableWebUSB,
    requestWebUSBDevice,
    cancel,
    dispose,
});

// eslint-disable-next-line import/no-default-export
export default TrezorConnect;
export * from '@trezor/connect/lib/exports';
