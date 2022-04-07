import type { CoreMessage } from '../../types';
import { ERRORS } from '../../constants';

import AbstractMethod from './abstractMethod';

import blockchainDisconnect from './blockchainDisconnect';
import blockchainEstimateFee from './blockchain/BlockchainEstimateFee';
import blockchainGetAccountBalanceHistory from './blockchain/BlockchainGetAccountBalanceHistory';
import blockchainGetCurrentFiatRates from './blockchain/BlockchainGetCurrentFiatRates';
import blockchainGetFiatRatesForTimestamps from './blockchain/BlockchainGetFiatRatesForTimestamps';
import blockchainGetTransactions from './blockchain/BlockchainGetTransactions';
import blockchainSetCustomBackend from './blockchain/BlockchainSetCustomBackend';
import blockchainSubscribe from './blockchain/BlockchainSubscribe';
import blockchainSubscribeFiatRates from './blockchain/BlockchainSubscribeFiatRates';
import blockchainUnsubscribe from './blockchain/BlockchainUnsubscribe';
import blockchainUnsubscribeFiatRates from './blockchain/BlockchainUnsubscribeFiatRates';
import cardanoGetAddress from './cardanoGetAddress';
import cardanoGetNativeScriptHash from './cardanoGetNativeScriptHash';
import cardanoGetPublicKey from './cardanoGetPublicKey';
import cardanoSignTransaction from './cardanoSignTransaction';
import cipherKeyValue from './cipherKeyValue';
import composeTransaction from './composeTransaction';
import customMessage from './customMessage';
import ethereumGetAddress from './ethereumGetAddress';
import ethereumGetPublicKey from './ethereumGetPublicKey';
import ethereumSignMessage from './ethereumSignMessage';
import ethereumSignTransaction from './ethereumSignTransaction';
import ethereumSignTypedData from './ethereumSignTypedData';
import ethereumVerifyMessage from './ethereumVerifyMessage';
import getAccountInfo from './getAccountInfo';
import getAddress from './getAddress';
import getDeviceState from './getDeviceState';
import getFeatures from './fetFeatures';
import getPublicKey from './getPublicKey';
import getSettings from './getSettings';
import liskDeprecated from './liskDeprecated';
import pushTransaction from './pushTransaction';
import requestLogin from './requestLogin';
import resetDevice from './resetDevice';
import rippleGetAddress from './rippleGetAddress';
import rippleSignTransaction from './rippleSignTransaction';
import nemGetAddress from './nemGetAddress';
import nemSignTransaction from './nemSignTransaction';
import setProxy from './setProxy';
import signMessage from './signMessage';
import signTransaction from './signTransaction';
import stellarGetAddress from './stellarGetAddress';
import stellarSignTransaction from './stellarSignTransaction';
import tezosGetAddress from './tezosGetAddress';
import tezosGetPublicKey from './tezosGetPublicKey';
import tezosSignTransaction from './tezosSignTransaction';
import eosGetPublicKey from './eosGetPublicKey';
import eosSignTransaction from './eosSignTransaction';
import binanceGetPublicKey from './binanceGetPublicKey';
import binanceGetAddress from './binanceGetAddress';
import binanceSignTransaction from './binanceSignTransaction';
import verifyMessage from './verifyMessage';
import wipeDevice from './wipeDevice';
import applyFlags from './applyFlags';
import applySettings from './applySettings';
import backupDevice from './backupDevice';
import changePin from './changePin';
import firmwareUpdate from './firmwareUpdate';
import recoveryDevice from './recoveryDevice';
import getCoinInfo from './getCoinInfo';
import rebootToBootloader from './rebootToBootloader';

const METHODS = {
    blockchainDisconnect,
    blockchainEstimateFee,
    blockchainGetAccountBalanceHistory,
    blockchainGetCurrentFiatRates,
    blockchainGetFiatRatesForTimestamps,
    blockchainGetTransactions,
    blockchainSetCustomBackend,
    blockchainSubscribe,
    blockchainSubscribeFiatRates,
    blockchainUnsubscribe,
    blockchainUnsubscribeFiatRates,
    cardanoGetAddress,
    cardanoGetNativeScriptHash,
    cardanoGetPublicKey,
    cardanoSignTransaction,
    cipherKeyValue,
    composeTransaction,
    customMessage,
    ethereumGetAddress,
    ethereumGetPublicKey,
    ethereumSignMessage,
    ethereumSignTransaction,
    ethereumSignTypedData,
    ethereumVerifyMessage,
    getAccountInfo,
    getAddress,
    getDeviceState,
    getFeatures,
    getPublicKey,
    getSettings,
    liskDeprecated,
    pushTransaction,
    requestLogin,
    resetDevice,
    rippleGetAddress,
    rippleSignTransaction,
    nemGetAddress,
    nemSignTransaction,
    setProxy,
    signMessage,
    signTransaction,
    stellarGetAddress,
    stellarSignTransaction,
    tezosGetAddress,
    tezosGetPublicKey,
    tezosSignTransaction,
    eosGetPublicKey,
    eosSignTransaction,
    binanceGetPublicKey,
    binanceGetAddress,
    binanceSignTransaction,
    verifyMessage,
    wipeDevice,
    applyFlags,
    applySettings,
    backupDevice,
    changePin,
    firmwareUpdate,
    recoveryDevice,
    getCoinInfo,
    rebootToBootloader,
};

export const find = (message: CoreMessage): AbstractMethod<any> => {
    if (!message.payload) {
        throw ERRORS.TypedError('Method_InvalidParameter', 'Message payload not found');
    }

    const { method } = message.payload;
    if (!method || typeof method !== 'string') {
        throw ERRORS.TypedError('Method_InvalidParameter', 'Message method is not set');
    }

    if (METHODS[method]) {
        return new METHODS[method](message);
    }

    throw ERRORS.TypedError('Method_InvalidParameter', `Method ${method} not found`);
};
