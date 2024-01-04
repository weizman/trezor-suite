import { MiddlewareAPI } from 'redux';
import { AppState, Action, Dispatch } from 'src/types/suite';
import { ROUTER } from 'src/actions/suite/constants';
import { openModal } from 'src/actions/suite/modalActions';

const evmMiddleware =
    (api: MiddlewareAPI<Dispatch, AppState>) =>
    (next: Dispatch) =>
    (action: Action): Action => {
        if (action.type === ROUTER.LOCATION_CHANGE) {
            const { account, status } = api.getState().wallet.selectedAccount;

            if (status === 'loaded' && account) {
                const validModalRoutes = ['wallet-receive', 'wallet-send'] as const;

                if (
                    account.networkType === 'ethereum' &&
                    action.payload.route?.name &&
                    validModalRoutes.includes(
                        action.payload.route?.name as (typeof validModalRoutes)[number],
                    ) &&
                    !api.getState().suite.evmSettings.confirmExplanationModalClosed[
                        account.symbol
                    ]?.[action.payload.route?.name]
                ) {
                    api.dispatch(
                        openModal({
                            type: 'confirm-evm-explanation',
                            coin: account.symbol,
                            route: action.payload.route?.name as (typeof validModalRoutes)[number],
                        }),
                    );
                }
            }
        }

        next(action);
        return action;
    };

export default evmMiddleware;
