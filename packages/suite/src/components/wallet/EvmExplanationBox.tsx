import { NetworkSymbol } from '@suite-common/wallet-config';
import { CoinLogo, variables } from '@trezor/components';
import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import styled, { css } from 'styled-components';

const EvmExplanationBoxWrapper = styled.div<{ caret?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 18px;
    gap: 18px;
    background: ${({ theme }) => theme.BG_GREY};
    border-radius: 8px;

    ${({ caret }) =>
        caret &&
        css`
            &:before {
                position: absolute;
                content: '';
                width: 0px;
                height: 0px;
                top: -9px;
                left: 14px;
                border-bottom: 10px solid ${({ theme }) => theme.BG_GREY};
                border-left: 9px solid transparent;
                border-right: 9px solid transparent;
            }
        `}
`;

const EvmExplanationTitle = styled.div`
    color: ${({ theme }) => theme.TYPE_DARK_GREY};
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: 600;
    margin-bottom: 4px;
`;

const EvmExplanationDescription = styled.span`
    color: ${({ theme }) => theme.TYPE_LIGHT_GREY};
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: 500;
    line-height: 18px;
`;

export interface EvmExplanationBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    title?: ReactNode;
    symbol: NetworkSymbol;
    caret?: boolean;
    children?: ReactNode;
}

export const EvmExplanationBox = forwardRef<HTMLDivElement, EvmExplanationBoxProps>(
    ({ symbol, title, caret, children, ...rest }, ref) => (
        <EvmExplanationBoxWrapper ref={ref} caret={caret} {...rest}>
            <CoinLogo symbol={symbol} />
            <div>
                <EvmExplanationTitle>{title}</EvmExplanationTitle>
                <EvmExplanationDescription>{children}</EvmExplanationDescription>
            </div>
        </EvmExplanationBoxWrapper>
    ),
);
