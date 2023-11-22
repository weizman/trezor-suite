import { createMiddlewareWithExtraDeps } from '@suite-common/redux-utils';

import { accountsActions } from '../accounts/accountsActions';
import { selectTokenDefinition } from './tokenDefinitionsReducer';
import { getTokenDefinition } from './tokenDefinitionsThunk';

export const prepareTokenDefinitionsMiddleware = createMiddlewareWithExtraDeps(
    (action, { dispatch, next, getState }) => {
        next(action);

        if (accountsActions.updateSelectedAccount.match(action)) {
            const { network } = action.payload;

            if (action.payload.status === 'loaded' && network?.networkType === 'ethereum') {
                action.payload.account.tokens?.forEach(token => {
                    const contractAddress = token.contract;

                    const tokenDefinition = selectTokenDefinition(
                        network?.symbol,
                        contractAddress,
                    )(getState());

                    if (!tokenDefinition || tokenDefinition.error) {
                        dispatch(getTokenDefinition({ network, contractAddress }));
                    }
                });
            }
        }
        return action;
    },
);
