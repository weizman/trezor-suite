// origin: https://github.com/trezor/connect/blob/develop/src/js/core/methods/FirmwareUpdate.js

// import randombytes from 'randombytes';
import { AbstractMethod } from '../core/AbstractMethod';
import { ERRORS } from '../constants';
import { UI, createUiMessage } from '../events';
import {
    getBinary,
    modifyFirmware,
    stripFwHeaders,
    uploadFirmware,
    calculateFirmwareHash,
} from './firmware';
import { validateParams } from './common/paramsValidator';
import { getReleases } from '../data/firmwareInfo';
import { isStrictFeatures } from '../utils/firmwareUtils';

type Params = {
    binary?: ArrayBuffer;
    version?: number[];
    btcOnly?: boolean;
    baseUrl?: string;
    intermediary?: boolean;
};

export default class FirmwareUpdate extends AbstractMethod<'firmwareUpdate', Params> {
    init() {
        this.useEmptyPassphrase = true;
        this.requiredPermissions = ['management'];
        this.allowDeviceMode = [UI.BOOTLOADER, UI.INITIALIZE];
        this.requireDeviceMode = [UI.BOOTLOADER];
        this.useDeviceState = false;
        this.skipFirmwareCheck = true;

        const { payload } = this;

        validateParams(payload, [
            { name: 'version', type: 'array' },
            { name: 'btcOnly', type: 'boolean' },
            { name: 'baseUrl', type: 'string' },
            { name: 'binary', type: 'array-buffer' },
            { name: 'intermediary', type: 'boolean' },
        ]);

        if ('version' in payload) {
            this.params = {
                // either receive version and btcOnly
                version: payload.version,
                btcOnly: payload.btcOnly,
                baseUrl: payload.baseUrl || 'https://data.trezor.io',
                intermediary: payload.intermediary,
            };
        }

        if ('binary' in payload) {
            // or binary
            this.params = {
                ...this.params,
                binary: payload.binary,
            };
        }
    }

    async confirmation() {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION);

        // request confirmation view
        this.postMessage(
            createUiMessage(UI.REQUEST_CONFIRMATION, {
                view: 'device-management',
                customConfirmButton: {
                    className: 'wipe',
                    label: 'Proceed',
                },
                label: 'Do you want to update firmware? Never do this without your recovery card.',
            }),
        );

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async run() {
        const { device, params } = this;

        let binary: ArrayBuffer;
        try {
            if (params.binary) {
                binary = params.binary;
            } else {
                const firmware = await getBinary({
                    // features and releases are used for sanity checking
                    features: device.features,
                    releases: getReleases(device.features.major_version),
                    // version argument is used to find and fetch concrete release from releases list
                    version: params.version,
                    btcOnly: params.btcOnly,
                    baseUrl: params.baseUrl!,
                    intermediary: params.intermediary,
                });
                binary = firmware.binary;
            }
        } catch (err) {
            throw ERRORS.TypedError(
                'Method_FirmwareUpdate_DownloadFailed',
                'Failed to download firmware binary',
            );
        }

        if (!isStrictFeatures(device.features)) {
            throw new Error('Features of unexpected shape provided');
        }

        // calculate firmware hash for
        const hardcodedChallenge = Buffer.from(
            '62a4fa3809c3b4bccbf03583b3d74def41dd39bde8ac934305075a82df64f9e6',
        );

        const { challenge, hash } = calculateFirmwareHash(
            device.features.major_version,
            stripFwHeaders(binary),
            // randombytes(32),
            hardcodedChallenge,
        );

        console.log('challenge', challenge);

        if (challenge !== '62a4fa3809c3b4bccbf03583b3d74def41dd39bde8ac934305075a82df64f9e6') {
            throw new Error('wrong challenge string <---> buffer conversions');
        }

        // "just received hash"
        if (hash !== 'c5f717ec7eb6498bb18be927a4d6ea5fb9d4fe59d106fae1ac3b5385977d8844') {
            throw new Error('hash not match');
        }

        await uploadFirmware(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.postMessage,
            device,

            { payload: modifyFirmware({ fw: binary, features: device.features }) },
        );

        return {
            challenge,
            hash,
        };
    }
}
