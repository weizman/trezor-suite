import EventEmitter from 'events';

// NOTE: @trezor/connect part is intentionally not imported from the index due to NormalReplacementPlugin
// in packages/suite-build/configs/web.webpack.config.ts
import {
    ERRORS,
    IFRAME,
    POPUP,
    createErrorMessage,
    ConnectSettings,
    Manifest,
    CallMethod,
} from '@trezor/connect/lib/exports';
import { factory } from '@trezor/connect/lib/factory';

import { parseConnectSettings } from '../connectSettings';
import { WindowServiceWorkerChannel } from '../channels/window-serviceworker';

const eventEmitter = new EventEmitter();
let _settings = parseConnectSettings();
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

    return Promise.resolve(undefined);
};

const cancel = () => {
    if (_channel) {
        _channel.clear();
    }
};

const init = async (settings: Partial<ConnectSettings> = {}): Promise<void> => {
    _settings = parseConnectSettings({ ..._settings, ...settings });

    if (!_settings.manifest) {
        throw ERRORS.TypedError('Init_ManifestMissing');
    }

    if (!_settings.transports?.length) {
        _settings.transports = ['BridgeTransport', 'WebUsbTransport'];
    }

    if (!_channel) {
        _channel = new WindowServiceWorkerChannel({
            name: 'trezor-connect-proxy',
            channel: {
                here: '@trezor/connect-foreground-proxy',
                peer: '@trezor/connect-service-worker-proxy',
            },
        });
    }

    return _channel.init().then(() =>
        _channel.postMessage(
            {
                type: POPUP.INIT,
                payload: { settings: _settings },
            },
            { usePromise: false },
        ),
    );
};

const call: CallMethod = async (params: any) => {
    try {
        const response = await _channel.postMessage({
            type: IFRAME.CALL,
            payload: params,
        });
        if (response) {
            return response;
        }

        return createErrorMessage(ERRORS.TypedError('Method_NoResponse'));
    } catch (error) {
        _channel.clear();

        return createErrorMessage(error);
    }
};

const uiResponse = () => {
    // Not needed here.
    throw ERRORS.TypedError('Method_InvalidPackage');
};

const renderWebUSBButton = () => {
    // Not needed here - webUSB paring happens in popup.
    throw ERRORS.TypedError('Method_InvalidPackage');
};

const requestLogin = () => {
    // Not needed here - Not used here.
    throw ERRORS.TypedError('Method_InvalidPackage');
};

const disableWebUSB = () => {
    // Not needed here - webUSB paring happens in popup.
    throw ERRORS.TypedError('Method_InvalidPackage');
};

const requestWebUSBDevice = () => {
    // Not needed here - webUSB pairing happens in popup.
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
