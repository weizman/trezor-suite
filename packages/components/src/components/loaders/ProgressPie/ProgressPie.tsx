import { ReactNode } from 'react';
import styled from 'styled-components';

const Container = styled.div<{
    value: number;
    size: number;
    color?: string;
    backgroundColor?: string;
}>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${({ size }) => `${size}px`};
    height: ${({ size }) => `${size}px`};
    border-radius: 50%;
    background: ${({ theme, value, color, backgroundColor }) =>
        `conic-gradient(${color || theme.BG_GREEN} ${3.6 * value}deg, ${
            backgroundColor || theme.STROKE_GREY
        } 0)`};
`;

export interface ProgressPieProps {
    value: number;
    size?: number;
    color?: string;
    backgroundColor?: string;
    children?: ReactNode;
    className?: string;
}

export const ProgressPie = ({ size = 16, children, ...props }: ProgressPieProps) => (
    <Container size={size} {...props}>
        {children}
    </Container>
);
