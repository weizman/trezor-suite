import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigation } from '@react-navigation/native';

import { TrezorDevice } from '@suite-common/suite-types';
import { AccountType, NetworkSymbol, Network } from '@suite-common/wallet-config';
import {
    AccountsRootState,
    DeviceRootState,
    selectDevice,
    selectDeviceAccounts,
} from '@suite-common/wallet-core';
import { Account } from '@suite-common/wallet-types';
import { useAlert } from '@suite-native/alerts';
import {
    addNetworkAccountThunk,
    selectAreTestnetsEnabled,
    selectDiscoverySupportedNetworks,
    getCardanoSupportedAccountTypesThunk,
} from '@suite-native/discovery';
import { useTranslate } from '@suite-native/intl';
import { useOpenLink } from '@suite-native/link';
import {
    RootStackParamList,
    RootStackRoutes,
    StackNavigationProps,
} from '@suite-native/navigation';

const availableNetworkAccountTypes: Map<NetworkSymbol | undefined, AccountType[]> = new Map([
    ['btc', ['normal', 'taproot', 'segwit', 'legacy']],
    ['ltc', ['normal', 'segwit', 'legacy']],
    ['btg', ['normal', 'segwit', 'legacy']],
    ['dgb', ['normal', 'segwit', 'legacy']],
    ['vtc', ['normal', 'segwit', 'legacy']],
]);

export const useAddCoinAccount = () => {
    const dispatch = useDispatch();
    const { translate } = useTranslate();
    const openLink = useOpenLink();
    const areTestnetsEnabled = useSelector(selectAreTestnetsEnabled);
    const supportedNetworks = useSelector((state: DeviceRootState) =>
        selectDiscoverySupportedNetworks(state, areTestnetsEnabled),
    );
    const accounts = useSelector((state: AccountsRootState & DeviceRootState) =>
        selectDeviceAccounts(state),
    );
    const device = useSelector(selectDevice);
    const { showAlert, hideAlert } = useAlert();
    const navigation =
        useNavigation<StackNavigationProps<RootStackParamList, RootStackRoutes.AccountDetail>>();
    const [availableCardanoTypes, setAvailableCardanoTypes] = useState<AccountType[]>([]);
    const [supportedNetworkSymbols, setSupportedNetworkSymbols] = useState<NetworkSymbol[]>([]);
    const [addedAccount, setAddedAccount] = useState<Account | undefined>(undefined);
    const [isAddingCoinAccount, setIsAddingCoinAccount] = useState<boolean>(false);

    useEffect(() => {
        const getSupportedCardanoTypes = async ({
            deviceState,
            trezorDevice,
        }: {
            deviceState: string;
            trezorDevice: TrezorDevice;
        }) => {
            const types = await dispatch(
                getCardanoSupportedAccountTypesThunk({
                    deviceState,
                    device: trezorDevice,
                }),
            ).unwrap();

            if (types.success && types.payload) {
                setAvailableCardanoTypes(types.payload ?? []);
            } else {
                setAvailableCardanoTypes([]);
            }
        };

        if (device?.state !== undefined) {
            // Cardano supported account types can vary based on device and firmware, so we need to fetch them
            getSupportedCardanoTypes({ deviceState: device.state, trezorDevice: device });
        } else {
            setAvailableCardanoTypes([]);
        }
    }, [device, dispatch]);

    useEffect(() => {
        const symbols: NetworkSymbol[] = [];
        supportedNetworks.forEach(element => {
            if (symbols.indexOf(element.symbol) === -1) {
                symbols.push(element.symbol);
            }
        });

        setSupportedNetworkSymbols(symbols);
    }, [supportedNetworks]);

    const getAvailableAccountTypesForNetwork = useCallback(
        ({ network }: { network: Network }) =>
            network.networkType === 'cardano'
                ? availableCardanoTypes
                : availableNetworkAccountTypes.get(network.symbol),
        [availableCardanoTypes],
    );

    const getDefaultAccountType = ({ network }: { network: Network }) =>
        getAvailableAccountTypesForNetwork({ network })?.[0];

    const getNetwork = useCallback(
        ({
            networkSymbol,
            accountType,
        }: {
            networkSymbol: NetworkSymbol;
            accountType?: AccountType;
        }) => {
            const type =
                accountType ??
                getDefaultAccountType({
                    network: supportedNetworks.filter(
                        network => network.symbol === networkSymbol,
                    )[0],
                });

            return supportedNetworks.filter(
                network =>
                    network.symbol === networkSymbol &&
                    (type === 'normal'
                        ? network.accountType === undefined
                        : network.accountType === type),
            )[0];
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const showTooManyAccountsAlert = useCallback(() => {
        showAlert({
            title: translate('moduleAddCoinAccount.alerts.tooManyAccounts.title'),
            description: translate('moduleAddCoinAccount.alerts.tooManyAccounts.description'),
            icon: 'warningCircle',
            pictogramVariant: 'red',
            primaryButtonTitle: translate(
                'moduleAddCoinAccount.alerts.tooManyAccounts.actionPrimary',
            ),
            onPressPrimaryButton: () => {
                hideAlert();
            },
        });
    }, [hideAlert, showAlert, translate]);

    const showAnotherEmptyAccountAlert = useCallback(() => {
        showAlert({
            title: translate('moduleAddCoinAccount.alerts.anotherEmptyAccount.title'),
            description: translate('moduleAddCoinAccount.alerts.anotherEmptyAccount.description'),
            icon: 'warningCircle',
            pictogramVariant: 'red',
            primaryButtonTitle: translate(
                'moduleAddCoinAccount.alerts.anotherEmptyAccount.actionPrimary',
            ),
            onPressPrimaryButton: () => {
                hideAlert();
            },
            secondaryButtonTitle: translate(
                'moduleAddCoinAccount.alerts.anotherEmptyAccount.actionSecondary',
            ),
            onPressSecondaryButton: () => {
                openLink(
                    translate('moduleAddCoinAccount.alerts.anotherEmptyAccount.actionSecondaryUrl'),
                );
                hideAlert();
            },
        });
    }, [hideAlert, showAlert, translate, openLink]);

    const addCoinAddress = useCallback(
        ({ network, type }: { network: Network; type?: AccountType }) => {
            if (!device?.state) {
                return false;
            }

            const accountType =
                type ?? getAvailableAccountTypesForNetwork({ network })?.[0] ?? 'normal';

            const currentAccountTypeAccounts = accounts.filter(
                account => account.symbol === network.symbol && account.accountType === accountType,
            );

            // Do not allow adding more than 10 accounts of the same type
            if (currentAccountTypeAccounts.length > 10) {
                showTooManyAccountsAlert();
                return false;
            }

            // Do not allow adding another empty account if there is already one
            const emptyAccounts = currentAccountTypeAccounts.filter(account => account.empty);

            if (emptyAccounts.length > 0) {
                showAnotherEmptyAccountAlert();
                return false;
            }

            const addNetworkAccount = async (deviceState: string) => {
                setIsAddingCoinAccount(true);
                const result = await dispatch(
                    addNetworkAccountThunk({
                        network,
                        accountType,
                        deviceState,
                    }),
                ).unwrap();

                setAddedAccount(result.account);
                setIsAddingCoinAccount(false);
            };

            addNetworkAccount(device.state);
        },
        [
            device?.state,
            getAvailableAccountTypesForNetwork,
            accounts,
            dispatch,
            showTooManyAccountsAlert,
            showAnotherEmptyAccountAlert,
            setIsAddingCoinAccount,
        ],
    );

    useEffect(() => {
        if (addedAccount) {
            navigation.navigate(RootStackRoutes.AccountDetail, {
                accountKey: addedAccount.key,
                tokenContract: undefined,
            });
            setAddedAccount(undefined);
        }
    }, [addedAccount, navigation]);

    return {
        supportedNetworks,
        supportedNetworkSymbols,
        isAddingCoinAccount,
        getAvailableAccountTypesForNetwork,
        getNetwork,
        getDefaultAccountType,
        addCoinAddress,
    };
};
