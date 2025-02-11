import { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import { variables } from '@trezor/components/src/config';

const Wrapper = styled.div<{ size?: string; isHoverable?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    ::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        transform: scale(0.5);
        border-radius: 8px;
        transition: ${({ theme }) =>
            `all ${theme.HOVER_TRANSITION_TIME} ${theme.HOVER_TRANSITION_EFFECT}`};

        background-color: transparent;
        pointer-events: none;
        z-index: ${variables.Z_INDEX.BASE};
    }

    ${props =>
        props.isHoverable &&
        css`
            :hover,
            :focus,
            :active {
                ::after {
                    transform: scale(1);
                    background-color: ${({ theme }) =>
                        transparentize(
                            theme.HOVER_TRANSPARENTIZE_FILTER,
                            theme.HOVER_PRIMER_COLOR,
                        )};
                }
            }
        `}
`;

interface HoverAnimationProps {
    isHoverable?: boolean;
    children: ReactNode;
    className?: string;
}

export const HoverAnimation = ({
    isHoverable = true,
    className,
    children,
}: HoverAnimationProps) => (
    <Wrapper isHoverable={isHoverable} className={className}>
        {children}
    </Wrapper>
);
