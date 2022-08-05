import { Account as CoinjoinAccount } from '@trezor/coinjoin';
import { Account } from '@wallet-types';
import { CoinjoinParameters } from '@wallet-types/coinjoin';
import { getBip43Type } from './accountUtils';

const getAccountType = (path: string) => {
    const bip43 = getBip43Type(path);
    switch (bip43) {
        case 'bip86':
        case 'coinjoin':
            return 'Taproot';
        case 'bip84':
            return 'P2WPKH';
        default:
            return 'P2WPKH';
    }
};

export const getInputScriptType = (path: string) => {
    const bip43 = getBip43Type(path);
    switch (bip43) {
        case 'bip86':
        case 'coinjoin':
            return 'Taproot';
        case 'bip84':
            return 'P2WPKH';
        default:
            return 'P2WPKH';
    }
};

// transform suite Account to coinjoin Account
// TODO: validate and throw errors (account type, symbol)
export const sanitizeAccount = (account: Account, params: CoinjoinParameters): CoinjoinAccount => ({
    type: getAccountType(account.path),
    symbol: account.symbol as any,
    descriptor: account.key,
    anonymityLevel: 0,
    maxRounds: params.maxRounds,
    maxFeePerKvbyte: params.maxFeePerKvbyte,
    maxCoordinatorFeeRate: params.maxCoordinatorFeeRate,
    utxos: account.utxo?.map(utxo => ({ ...utxo, amount: Number(utxo.amount) })) || [],
    addresses: account.addresses!.change,
});

// export const getCoinjoinUrl = () => 'http://localhost:8081/';
export const getCoinjoinUrl = () => 'https://coinjoin.corp.sldev.cz/';
