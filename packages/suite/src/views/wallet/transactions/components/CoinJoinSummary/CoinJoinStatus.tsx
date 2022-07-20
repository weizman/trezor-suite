import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FormattedDate } from 'react-intl';
import { Card, H3, P, Button, Loader, Icon, colors } from '@trezor/components';
import { disableCoinJoin } from '@wallet-actions/coinjoinActions';
import { useActions } from '@suite-hooks';
import { CoinJoinStatusDetail } from './CoinJoinStatusDetail';
import type { Account } from '@wallet-types';
import type { CoinjoinRegistration } from '@wallet-types/coinjoin';

const Wrapper = styled(Card)`
    width: 100%;
    display: flex;
    flex-direction: row;
`;

const Left = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 24px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const PhaseWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const StyledP = styled(P)`
    margin-left: 12px;
`;

const Counter = ({ deadline }: any) => {
    const [left, setLeft] = useState(new Date(deadline));
    useEffect(() => {
        const interval = setInterval(() => {
            const milis = new Date(deadline).getTime() - Date.now();
            const date = new Date();
            date.setHours(0, 0, 0, milis > 0 ? milis : 0);
            setLeft(date);
        }, 100);
        return () => {
            clearInterval(interval);
        };
    }, [deadline]);
    return <FormattedDate minute="numeric" second="numeric" hourCycle="h23" value={left} />;
};

const getPhase = (registration: CoinjoinRegistration) => {
    switch (registration.phase) {
        case 0:
            return (
                <PhaseWrapper>
                    <Loader size={12} />
                    <StyledP>
                        Waiting for other participants <Counter deadline={registration.deadline} />
                    </StyledP>
                </PhaseWrapper>
            );
        case 1:
            return (
                <PhaseWrapper>
                    <Icon icon="WARNING" size={14} color={colors.TYPE_ORANGE} />
                    <StyledP>Confirming participation</StyledP>
                </PhaseWrapper>
            );
        case 2:
            return (
                <PhaseWrapper>
                    <Icon icon="WARNING" size={14} color={colors.TYPE_ORANGE} />
                    <StyledP>Registering outputs</StyledP>
                </PhaseWrapper>
            );
        case 3:
            return (
                <PhaseWrapper>
                    <Icon icon="WARNING" size={14} color={colors.TYPE_ORANGE} />
                    <StyledP>Signing transaction</StyledP>
                </PhaseWrapper>
            );

        default:
            return (
                <PhaseWrapper>
                    <Loader size={12} />
                    <StyledP>
                        Looking for round <Counter deadline={registration.deadline} />
                    </StyledP>
                </PhaseWrapper>
            );
    }
};

interface CoinjoinStatusProps {
    account: Account;
    registration: CoinjoinRegistration;
}

export const CoinJoinStatus = ({ account, registration }: CoinjoinStatusProps) => {
    const actions = useActions({
        disable: disableCoinJoin,
    });
    return (
        <Wrapper>
            <Left>
                <H3>Running coinjoin</H3>
                <Row>
                    {account.formattedBalance} {account.symbol.toUpperCase()} left
                </Row>
                <Row>
                    {registration.signedRounds.length} of {registration.maxRounds} rounds done
                </Row>
                {getPhase(registration)}
                <Row>
                    <Button onClick={() => actions.disable(account)}>Stop coinjoin</Button>
                </Row>
            </Left>
            <CoinJoinStatusDetail
                account={account}
                anonLevel={registration.anonymityLevel}
                rounds={registration.maxRounds}
                fee={registration.maxFeePerKvbyte}
                coordinatorFee={registration.maxCoordinatorFeeRate}
            />
        </Wrapper>
    );
};
