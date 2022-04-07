import AbstractMethod from './abstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { ERRORS } from '../constants';

import { findBackend, setCustomBackend, initBlockchain } from '../backend/BlockchainLink';
import { getCoinInfo } from '../data/CoinInfo';
import type { CoinInfo } from '../types';

type Params = {
    coinInfo: CoinInfo;
};

export default class BlockchainSetCustomBackend extends AbstractMethod<'blockchainSetCustomBackend'> {
    params: Params;

    init() {
        this.requiredPermissions = [];
        this.info = '';
        this.useDevice = false;
        this.useUi = false;

        const { payload } = this;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'coin', type: 'string', required: true },
            { name: 'blockchainLink', type: 'object' },
        ]);

        const coinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        }

        setCustomBackend(coinInfo, payload.blockchainLink);

        this.params = {
            coinInfo,
        };
    }

    async run() {
        const current = findBackend(this.params.coinInfo.name);
        if (current) {
            current.disconnect();
            await initBlockchain(this.params.coinInfo, this.postMessage);
        }

        return true;
    }
}
