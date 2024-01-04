import { prepareFiatRatesMiddleware, prepareBlockchainMiddleware } from '@suite-common/wallet-core';

import { prepareDiscoveryMiddleware } from './discoveryMiddleware';
import storageMiddleware from './storageMiddleware';
import walletMiddleware from './walletMiddleware';
import graphMiddleware from './graphMiddleware';
import coinmarketMiddleware from './coinmarketMiddleware';
import coinmarketSavingsMiddleware from './coinmarketSavingsMiddleware';
import pollingMiddleware from './pollingMiddleware';
import { coinjoinMiddleware } from './coinjoinMiddleware';
import { extraDependencies } from 'src/support/extraDependencies';
import evmMiddleware from 'src/middlewares/wallet/evmMiddleware';

export default [
    prepareBlockchainMiddleware(extraDependencies),
    walletMiddleware,
    prepareDiscoveryMiddleware(extraDependencies),
    prepareFiatRatesMiddleware(extraDependencies),
    storageMiddleware,
    graphMiddleware,
    coinmarketMiddleware,
    coinmarketSavingsMiddleware,
    pollingMiddleware,
    coinjoinMiddleware,
    evmMiddleware,
];
