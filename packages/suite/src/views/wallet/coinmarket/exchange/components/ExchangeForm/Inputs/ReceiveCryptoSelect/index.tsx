import { variables, Select } from '@trezor/components';
import { ExchangeInfo } from 'src/actions/wallet/coinmarketExchangeActions';
import { Controller } from 'react-hook-form';
import styled from 'styled-components';
import { CryptoSymbol, CryptoSymbolInfo } from 'invity-api';
import { useCoinmarketExchangeFormContext } from 'src/hooks/wallet/useCoinmarketExchangeForm';
import { Translation } from 'src/components/suite';
import { Account } from 'src/types/wallet';
import invityAPI from 'src/services/suite/invityAPI';
import { getInputState } from '@suite-common/wallet-utils';
import {
    cryptoToCoinSymbol,
    cryptoToNetworkSymbol,
    isCryptoSymbolToken,
} from 'src/utils/wallet/coinmarket/cryptoSymbolUtils';
import { networks } from '@suite-common/wallet-config';

const Wrapper = styled.div`
    display: flex;
    flex: 1;
    min-width: 230px;

    @media screen and (max-width: ${variables.SCREEN_SIZE.LG}) {
        flex-direction: column;
    }
`;

const CoinLogo = styled.img`
    display: flex;
    align-items: center;
    padding-right: 6px;
    height: 16px;
`;

const OptionNetwork = styled.div`
    padding: 4px 6px;
    margin-left: 10px;
    font-size: ${variables.FONT_SIZE.TINY};
    background: ${({ theme }) => theme.BG_WHITE_ALT_HOVER};
    border-radius: 4px;
`;

const Option = styled.div`
    display: flex;
    align-items: center;

    &:hover ${OptionNetwork} {
        background: ${({ theme }) => theme.BG_WHITE_ALT};
    }
`;

const OptionName = styled.div`
    display: flex;
    color: ${({ theme }) => theme.TYPE_LIGHT_GREY};
    font-size: ${variables.FONT_SIZE.TINY};
    max-width: 150px;
`;

const OptionLabel = styled.div`
    min-width: 60px;
`;

const buildOptions = (
    account: Account,
    exchangeCoinInfo?: CryptoSymbolInfo[],
    exchangeInfo?: ExchangeInfo,
    token?: string,
) => {
    if (!exchangeInfo || !exchangeCoinInfo) return [];

    interface OptionsGroup {
        label: string;
        options: { label: string; value: string; name: string; cryptoSymbol?: CryptoSymbol }[];
    }

    const symbolToFilter = token || account.symbol;

    return exchangeCoinInfo
        .filter(
            coin =>
                coin.symbol &&
                coin.name &&
                coin.category &&
                coin.symbol.toLowerCase() !== symbolToFilter &&
                coin.symbol.toLowerCase() !== 'usdt20' && // temporary solution; invity-api renamed USDT20 => USDT and sends both codes (USDT and USDT20) to maintain backward compatibility with old versions of suite
                exchangeInfo.buySymbols.has(coin.symbol),
        )
        .reduce((options, coin) => {
            let category = options.find(option => option.label === coin.category);
            if (!category) {
                category = { label: coin.category, options: [] };
                options.push(category);
            }
            const coinSymbol = cryptoToCoinSymbol(coin.symbol);
            category.options.push({
                label: coinSymbol,
                value: coinSymbol,
                name: coin.name,
                cryptoSymbol: coin.symbol,
            });
            return options;
        }, [] as OptionsGroup[]);
};

const ReceiveCryptoSelect = () => {
    const {
        control,
        setAmountLimits,
        exchangeInfo,
        symbolsInfo,
        account,
        getValues,
        formState: { errors },
    } = useCoinmarketExchangeFormContext();

    const customSearch = (
        option: { data: { label: string; value: string; name: string } },
        searchText: string,
    ) => {
        if (
            option.data.label.toLowerCase().includes(searchText.toLowerCase()) ||
            option.data.name.toLowerCase().includes(searchText.toLowerCase())
        ) {
            return true;
        }
        return false;
    };

    const { outputs, receiveCryptoSelect } = getValues();
    const token = outputs?.[0]?.token;
    const tokenData = account.tokens?.find(t => t.contract === token);

    return (
        <Wrapper>
            <Controller
                control={control}
                name="receiveCryptoSelect"
                render={({ field: { onChange, value } }) => (
                    <Select
                        inputState={getInputState(
                            errors.receiveCryptoSelect,
                            receiveCryptoSelect?.value,
                        )}
                        onChange={(selected: any) => {
                            onChange(selected);
                            setAmountLimits(undefined);
                        }}
                        label={<Translation id="TR_TO" />}
                        value={value}
                        isClearable={false}
                        filterOption={customSearch}
                        options={buildOptions(
                            account,
                            symbolsInfo,
                            exchangeInfo,
                            tokenData?.symbol,
                        )}
                        data-test="@coinmarket/exchange/receive-crypto-select"
                        minWidth="70px"
                        formatOptionLabel={(
                            option: ReturnType<typeof buildOptions>[number]['options'][number],
                        ) => (
                            <Option>
                                <CoinLogo
                                    src={`${invityAPI.getApiServerUrl()}/images/coins/suite/${
                                        option.value
                                    }.svg`}
                                />
                                <OptionLabel>{option.label}</OptionLabel>
                                <OptionName>{option.name}</OptionName>
                                {option.cryptoSymbol &&
                                    isCryptoSymbolToken(option.cryptoSymbol) &&
                                    cryptoToNetworkSymbol(option.cryptoSymbol) && (
                                        <OptionNetwork>
                                            {
                                                networks[
                                                    cryptoToNetworkSymbol(option.cryptoSymbol)!
                                                ].name
                                            }
                                        </OptionNetwork>
                                    )}
                            </Option>
                        )}
                        placeholder={<Translation id="TR_TRADE_SELECT_COIN" />}
                        isSearchable
                    />
                )}
            />
        </Wrapper>
    );
};

export default ReceiveCryptoSelect;
