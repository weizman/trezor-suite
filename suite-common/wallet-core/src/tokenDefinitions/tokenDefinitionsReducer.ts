import { NetworkSymbol } from '@suite-common/wallet-config';
import { createReducerWithExtraDeps } from '@suite-common/redux-utils';

import { tokenDefinitionsActions } from './tokenDefinitionsActions';

export type TokenDefinitionsState = {
    [key in NetworkSymbol]?: {
        [contractAddress: string]: {
            data: ArrayBuffer | undefined;
            isLoading: boolean;
            error: boolean;
        };
    };
};

export type TokenDefinitionsRootState = { wallet: { tokenDefinitions: TokenDefinitionsState } };

const initialStatePredefined: Partial<TokenDefinitionsState> = {};

export const prepareTokenDefinitionsReducer = createReducerWithExtraDeps(
    initialStatePredefined,
    builder => {
        builder

            .addCase(tokenDefinitionsActions.fetchInit, (state, action) => {
                const { networkSymbol, contractAddress } = action.payload;
                if (!state[networkSymbol]) {
                    state[networkSymbol] = {};
                }
                state[networkSymbol]![contractAddress] = {
                    data: undefined,
                    isLoading: true,
                    error: false,
                };
            })
            .addCase(tokenDefinitionsActions.fetchSuccess, (state, action) => {
                const { networkSymbol, tokenDefinition, contractAddress } = action.payload;
                if (!state[networkSymbol]) {
                    state[networkSymbol] = {};
                }

                state[networkSymbol]![contractAddress] = {
                    data: tokenDefinition,
                    isLoading: false,
                    error: false,
                };
            })
            .addCase(tokenDefinitionsActions.fetchError, (state, action) => {
                const { networkSymbol, contractAddress } = action.payload;
                state[networkSymbol]![contractAddress] = {
                    data: undefined,
                    isLoading: false,
                    error: true,
                };
            });
    },
);

export const selectTokenDefinition =
    (networkSymbol: NetworkSymbol, contractAddress: string) => (state: TokenDefinitionsRootState) =>
        state.wallet.tokenDefinitions?.[networkSymbol]?.[contractAddress];
