import { notificationsActions } from '@suite-common/toast-notifications';
import TrezorConnect, { GetAddress, Params } from '@trezor/connect';
import { getDerivationType } from '@suite-common/wallet-utils';
import { TrezorDevice, UserContextPayload } from '@suite-common/suite-types';
import { selectDevice } from '@suite-common/wallet-core';

import { RECEIVE } from 'src/actions/wallet/constants';
import * as modalActions from 'src/actions/suite/modalActions';
import { GetState, Dispatch } from 'src/types/suite';
import {
    getStakingPath,
    getProtocolMagic,
    getNetworkId,
    getAddressType,
} from 'src/utils/wallet/cardanoUtils';
import { Account } from '@suite-common/wallet-types';

export type ReceiveAction =
    | { type: typeof RECEIVE.DISPOSE }
    | { type: typeof RECEIVE.SHOW_ADDRESS; path: string; address: string }
    | { type: typeof RECEIVE.SHOW_UNVERIFIED_ADDRESS; path: string; address: string };

export const dispose = (): ReceiveAction => ({
    type: RECEIVE.DISPOSE,
});

export const openAddressModal =
    (
        params: Pick<
            Extract<UserContextPayload, { type: 'address' }>,
            'addressPath' | 'value' | 'isConfirmed'
        >,
    ) =>
    (dispatch: Dispatch) => {
        dispatch(
            modalActions.openModal({
                type: 'address',
                ...params,
            }),
        );
        dispatch({
            type: params.isConfirmed ? RECEIVE.SHOW_ADDRESS : RECEIVE.SHOW_UNVERIFIED_ADDRESS,
            path: params.addressPath,
            address: params.value,
        });
    };

export const getAddressResponse = (
    account: Account,
    device: TrezorDevice,
    path: string,
    params: Params<GetAddress>,
) => {
    switch (account.networkType) {
        case 'ethereum':
            return TrezorConnect.ethereumGetAddress(params);
        case 'cardano':
            return TrezorConnect.cardanoGetAddress({
                device,
                useEmptyPassphrase: device.useEmptyPassphrase,
                addressParameters: {
                    stakingPath: getStakingPath(account),
                    addressType: getAddressType(account.accountType),
                    path,
                },
                protocolMagic: getProtocolMagic(account.symbol),
                networkId: getNetworkId(account.symbol),
                derivationType: getDerivationType(account.accountType),
            });
        case 'ripple':
            return TrezorConnect.rippleGetAddress(params);
        case 'bitcoin':
            return TrezorConnect.getAddress(params);
        case 'solana':
            return TrezorConnect.solanaGetAddress(params);
        default:
            return {
                success: false,
                payload: { error: 'Method for getAddress not defined', code: undefined },
            };
    }
};

export const showAddress =
    (path: string, address: string) => async (dispatch: Dispatch, getState: GetState) => {
        const device = selectDevice(getState());
        const { account } = getState().wallet.selectedAccount;

        if (!device || !account) return;

        const modalPayload = {
            value: address,
            addressPath: path,
        };

        // Show warning when device is not connected
        if (!device.connected || !device.available) {
            dispatch(
                modalActions.openModal({
                    type: 'unverified-address',
                    ...modalPayload,
                }),
            );
            return;
        }

        const params = {
            device,
            path,
            unlockPath: account.unlockPath,
            useEmptyPassphrase: device.useEmptyPassphrase,
            coin: account.symbol,
        };

        dispatch(modalActions.preserve());

        const response = await getAddressResponse(account, device, path, params);

        if (response.success) {
            // show second part of the "confirm address" modal
            dispatch(openAddressModal({ ...modalPayload, isConfirmed: true }));
        } else {
            dispatch(modalActions.onCancel());
            // special case: device no-backup permissions not granted
            if (response.payload.code === 'Method_PermissionsNotGranted') return;

            dispatch(
                notificationsActions.addToast({
                    type: 'verify-address-error',
                    error: response.payload.error,
                }),
            );
        }
    };
