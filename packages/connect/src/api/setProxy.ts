// origin: https://github.com/trezor/connect/blob/develop/src/js/core/methods/SetProxy.js

import { AbstractMethod } from '../core/AbstractMethod';
import { validateParams } from './common/paramsValidator';
import { DataManager } from '../data/DataManager';
import { reconnectBackends } from '../backend/BlockchainLink';

export default class SetProxy extends AbstractMethod<'setProxy'> {
    init() {
        this.requiredPermissions = [];
        this.useDevice = false;
        this.useUi = false;

        validateParams(this.payload, []);
    }

    async run() {
        const { proxy } = DataManager.getSettings();
        const isChanged = proxy !== this.payload.proxy;
        if (isChanged) {
            DataManager.getSettings().proxy = this.payload.proxy;
            await reconnectBackends();
        }

        return { message: 'Success' };
    }
}
