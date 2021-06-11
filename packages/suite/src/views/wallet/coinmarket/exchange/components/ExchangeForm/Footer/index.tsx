import React from 'react';
import { Button } from '@trezor/components';
import { ExternalLink, NotificationCard, Translation } from '@suite-components';
import styled from 'styled-components';
import { useCoinmarketExchangeFormContext } from '@wallet-hooks/useCoinmarketExchangeForm';
import { CRYPTO_INPUT } from '@suite/types/wallet/coinmarketExchangeForm';
import { WIKI_ETH_FEES } from '@suite-constants/urls';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
`;

const NotificationCardWrapper = styled(NotificationCard)`
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: 20px;
`;

const StyledButton = styled(Button)`
    min-width: 200px;
`;

const Footer = () => {
    const {
        formState,
        watch,
        errors,
        isComposing,
        canCompareOffers,
        formNoteTranslationId,
        account,
    } = useCoinmarketExchangeFormContext();
    const hasValues = !!watch(CRYPTO_INPUT) && !!watch('receiveCryptoSelect')?.value;
    const formIsValid = Object.keys(errors).length === 0;

    const isCompareOffersButtonDisabled =
        !canCompareOffers || !(formIsValid && hasValues) || formState.isSubmitting;

    return (
        <>
            <Wrapper>
                <StyledButton
                    isDisabled={isCompareOffersButtonDisabled}
                    isLoading={formState.isSubmitting || isComposing}
                    type="submit"
                >
                    <Translation id="TR_EXCHANGE_SHOW_OFFERS" />
                </StyledButton>
            </Wrapper>
            {formNoteTranslationId ===
                'TR_EXCHANGE_TOKENS_NOT_TRANSFERABLE_AFTER_ALL_BALANCE_EXCHANGE' && (
                <NotificationCardWrapper variant="warning">
                    <div>
                        <Translation
                            id={formNoteTranslationId}
                            values={{ symbol: account.symbol.toUpperCase() }}
                        />
                    </div>
                    <div>
                        <ExternalLink href={WIKI_ETH_FEES}>
                            <Translation id="TR_LEARN_MORE" />
                        </ExternalLink>
                    </div>
                </NotificationCardWrapper>
            )}
        </>
    );
};

export default Footer;
