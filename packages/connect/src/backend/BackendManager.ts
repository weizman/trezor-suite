import { DataManager } from '../data/DataManager';
import { ERRORS } from '../constants';
import { Blockchain, BlockchainOptions } from './Blockchain';

import type { CoinInfo, BlockchainLink } from '../types';

type CoinShortcut = CoinInfo['shortcut'];
type Identity = string;
type CoinShortcutIdentity = `${CoinShortcut}/${Identity}`;

const DEFAULT_IDENTITY = 'default';

export class BackendManager {
    private readonly instances: { [shortcut: CoinShortcutIdentity]: Blockchain } = {};
    private readonly custom: { [shortcut: CoinShortcut]: BlockchainLink } = {};
    private readonly preferred: { [shortcut: CoinShortcut]: string } = {};

    get(shortcut: CoinShortcut, identity = DEFAULT_IDENTITY): Blockchain | null {
        return this.instances[`${shortcut}/${identity}`] ?? null;
    }

    remove(shortcut: CoinShortcut, identity = DEFAULT_IDENTITY) {
        delete this.instances[`${shortcut}/${identity}`];
    }

    async getOrConnect(
        coinInfo: CoinInfo,
        postMessage: BlockchainOptions['postMessage'],
        identity = DEFAULT_IDENTITY,
    ): Promise<Blockchain> {
        let backend = this.get(coinInfo.shortcut, identity);
        if (!backend) {
            backend = new Blockchain({
                coinInfo: this.patchCoinInfo(coinInfo),
                postMessage,
                debug: DataManager.getSettings('debug'),
                proxy: DataManager.getSettings('proxy'),
                onConnected: url => this.setPreferred(coinInfo.shortcut, url),
                onDisconnected: () => this.remove(coinInfo.shortcut, identity),
                identity,
            });
            this.instances[`${coinInfo.shortcut}/${identity}`] = backend;

            try {
                await backend.init();
            } catch (error) {
                this.remove(coinInfo.shortcut, identity);
                this.removePreferred(coinInfo.shortcut);
                throw error;
            }
        }
        return backend;
    }

    dispose() {
        Object.values(this.instances).forEach(i => i.disconnect());
    }

    reconnect(info?: CoinInfo) {
        // collect all running backends (for given coin if coinInfo is present)
        const backends = Object.values(this.instances).filter(
            i => !info || i.coinInfo.shortcut === info.shortcut,
        );
        return Promise.all(
            backends.map(b => {
                const { coinInfo, postMessage, identity } = b;
                // remove backend
                b.disconnect();
                // initialize again
                return this.getOrConnect(info ?? coinInfo, postMessage, identity);
            }),
        );
    }

    isSupported(coinInfo: CoinInfo) {
        const info = this.custom[coinInfo.shortcut] || coinInfo.blockchainLink;
        if (!info) {
            throw ERRORS.TypedError('Backend_NotSupported');
        }
    }

    setCustom(shortcut: CoinShortcut, blockchainLink: BlockchainLink) {
        this.removePreferred(shortcut);
        this.custom[shortcut] = blockchainLink;
    }

    removeCustom(shortcut: CoinShortcut) {
        this.removePreferred(shortcut);
        delete this.custom[shortcut];
    }

    // keep backend as a preferred once connection is successfully made
    // switching between urls could lead to side effects (mempool differences, non existing/missing pending transactions)
    private setPreferred(shortcut: CoinShortcut, url: string) {
        this.preferred[shortcut] = url;
    }

    private removePreferred(shortcut: CoinShortcut) {
        delete this.preferred[shortcut];
    }

    private patchCoinInfo(coinInfo: CoinInfo): CoinInfo {
        const custom = this.custom[coinInfo.shortcut];
        const preferred = this.preferred[coinInfo.shortcut];
        const url = preferred ? [preferred] : custom?.url ?? coinInfo.blockchainLink?.url;
        return {
            ...coinInfo,
            blockchainLink: {
                ...coinInfo.blockchainLink,
                ...custom,
                url,
            },
        };
    }
}
