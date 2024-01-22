import { Screen, ScreenSubHeader } from '@suite-native/navigation';
import { Card, SelectableNetworkItem, VStack } from '@suite-native/atoms';
import { useTranslate } from '@suite-native/intl';
import { NetworkSymbol } from '@suite-common/wallet-config';

import { useAddCoinAccount } from '../hooks/useAddCoinAccount';

export const AddCoinAccountScreen = () => {
    const { translate } = useTranslate();

    const { supportedNetworkSymbols, isAddingCoinAccount, addCoinAddress, getNetwork } =
        useAddCoinAccount();

    const onSelectItem = (networkSymbol: NetworkSymbol) => {
        if (isAddingCoinAccount) {
            return;
        }
        const network = getNetwork({ networkSymbol });
        if (network) {
            addCoinAddress({ network });
        } else {
            console.warn('Network not found', networkSymbol);
        }
    };

    return (
        <Screen
            screenHeader={
                <ScreenSubHeader
                    content={translate('moduleAddCoinAccount.addCoinAccountScreen.title')}
                />
            }
        >
            <Card>
                <VStack spacing="large">
                    {supportedNetworkSymbols.map(symbol => (
                        <SelectableNetworkItem
                            key={symbol}
                            symbol={symbol}
                            data-testID={`@add-coin/select-coin/${symbol}`}
                            onPress={onSelectItem}
                            rightIcon="plus"
                        />
                    ))}
                </VStack>
            </Card>
        </Screen>
    );
};
