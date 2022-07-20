import React, { createRef } from 'react';
import styled from 'styled-components';
import { Button } from '@trezor/components';
import { CollapsibleBox, Translation } from '@suite-components';
import { copyToClipboard } from '@suite-utils/dom';

const LogWrapper = styled.div`
    margin: 10px 0px;
    max-height: 250px;
    overflow: auto;
`;

const ActionsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    padding-bottom: 6px;
`;

const LogRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 6px;
`;

interface Props {
    log: { time: string; value: string }[];
}

export const CoinjoinLog = ({ log }: Props) => {
    const htmlElement = createRef<HTMLDivElement>();
    const copy = () => {
        copyToClipboard(JSON.stringify(log), htmlElement.current);
    };
    const download = () => {
        const element = document.createElement('a');
        element.setAttribute(
            'href',
            `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(log))}`,
        );
        element.setAttribute('download', 'coinjoin-log.txt');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    };
    return (
        <CollapsibleBox opened={false} heading="Log" variant="small">
            <ActionsWrapper ref={htmlElement}>
                <Button variant="tertiary" onClick={download}>
                    <Translation id="TR_EXPORT_TO_FILE" />
                </Button>
                <Button variant="tertiary" onClick={copy}>
                    <Translation id="TR_COPY_TO_CLIPBOARD" />
                </Button>
            </ActionsWrapper>
            <LogWrapper>
                {log.map((l, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <LogRow key={l.time + l.value + i}>
                        {l.time} {l.value}
                    </LogRow>
                ))}
            </LogWrapper>
        </CollapsibleBox>
    );
};
