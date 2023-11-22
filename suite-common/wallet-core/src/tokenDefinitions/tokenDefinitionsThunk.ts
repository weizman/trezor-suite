import { createThunk } from '@suite-common/redux-utils';
import { Network } from '@suite-common/wallet-config';
import { getEthereumDefinitions } from '@trezor/connect/src/api/ethereum/ethereumDefinitions';

import { selectTokenDefinition } from './tokenDefinitionsReducer';
import { tokenDefinitionsActions } from './tokenDefinitionsActions';

export const getTokenDefinition = createThunk(
    `${tokenDefinitionsActions.actionsPrefix}/getTokenDefinition`,
    async (params: { network: Network; contractAddress: string }, { getState, dispatch }) => {
        const { network, contractAddress } = params;
        const tokenDefinition = selectTokenDefinition(network.symbol, contractAddress)(getState());

        let tokenDefinitionData = tokenDefinition?.data;

        if (!tokenDefinition) {
            try {
                dispatch(
                    tokenDefinitionsActions.fetchInit({
                        networkSymbol: network.symbol,
                        contractAddress,
                    }),
                );
                const fetchedTokenDefinition = await getEthereumDefinitions({
                    chainId: network?.chainId,
                    contractAddress: contractAddress.substring(2),
                });

                tokenDefinitionData = fetchedTokenDefinition?.encoded_token;

                dispatch(
                    tokenDefinitionsActions.fetchSuccess({
                        networkSymbol: network.symbol,
                        contractAddress,
                        tokenDefinition: tokenDefinitionData,
                    }),
                );
            } catch (error) {
                dispatch(
                    tokenDefinitionsActions.fetchError({
                        networkSymbol: network.symbol,
                        contractAddress,
                    }),
                );
            }
        }

        return tokenDefinitionData;
    },
);
