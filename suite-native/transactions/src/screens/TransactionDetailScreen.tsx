import React from 'react';
import { useSelector } from 'react-redux';
import { Linking } from 'react-native';

import { Box, Button, Text, VStack } from '@suite-native/atoms';
import {
    RootStackParamList,
    RootStackRoutes,
    Screen,
    ScreenHeader,
    StackProps,
} from '@suite-native/navigation';
import { selectTransactionByTxid } from '@suite-common/wallet-core';
import { formatNetworkAmount, toFiatCurrency } from '@suite-common/wallet-utils';
import { selectFiatCurrency } from '@suite-native/module-settings';
import { useFormatters } from '@suite-common/formatters';
import { Icon } from '@trezor/icons';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';

import { TransactionDetailHeader } from '../components/TransactionDetail/TransactionDetailHeader';
import { TransactionDetailData } from '../components/TransactionDetail/TransactionDetailData';
import { TransactionDetailSheets } from '../components/TransactionDetail/TransactionDetailSheets';

const BLOCKCHAIN_EXPLORER_URL = 'https://www.blockchain.com/explorer/transactions';

const linkStyle = prepareNativeStyle(_ => ({
    marginRight: 12,
}));

export const TransactionDetailScreen = ({
    route,
}: StackProps<RootStackParamList, RootStackRoutes.TransactionDetail>) => {
    const { applyStyle } = useNativeStyles();
    const { txid } = route.params;
    const transaction = useSelector(selectTransactionByTxid(txid));
    // const blockchain = useSelector(selectBlockchainState);
    const fiatCurrency = useSelector(selectFiatCurrency);
    const { CryptoAmountFormatter } = useFormatters();

    // TODO please add empty state when design is ready
    if (!transaction) return null;

    // const confirmations = getConfirmations(transaction, blockchain[transaction.symbol].blockHeight);

    const transactionAmount = formatNetworkAmount(transaction.amount, transaction.symbol);
    const fiatAmount = toFiatCurrency(transactionAmount, fiatCurrency.label, transaction.rates);
    const cryptoAmountFormatted = CryptoAmountFormatter.format(transactionAmount, {
        symbol: transaction.symbol,
    });

    const handleOpenBlockchain = () => {
        // TODO this should open the https://goerli2.trezor.io/
        Linking.openURL(`${BLOCKCHAIN_EXPLORER_URL}/${transaction.symbol}/${transaction.txid}`);
    };

    return (
        <Screen header={<ScreenHeader />}>
            <VStack spacing="large">
                <TransactionDetailHeader
                    type={transaction.type}
                    amount={cryptoAmountFormatted}
                    fiatAmount={fiatAmount}
                />
                <TransactionDetailData transaction={transaction} />
            </VStack>
            <TransactionDetailSheets />
            <Box marginVertical="large" />
            <Button onPress={handleOpenBlockchain} colorScheme="gray">
                <Box flexDirection="row" alignItems="center">
                    <Text style={applyStyle(linkStyle)}>Explore in blockchain</Text>
                    <Icon size="mediumLarge" name="arrowUpRight" color="gray1000" />
                </Box>
            </Button>
        </Screen>
    );
};
