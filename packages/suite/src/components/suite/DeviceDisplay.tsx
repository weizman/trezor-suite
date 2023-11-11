import styled from 'styled-components';

import { useSelector } from 'src/hooks/suite/useSelector';
import { AddressDisplayOptions, selectAddressDisplayType } from 'src/reducers/suite/suiteReducer';
import {
    selectDeviceInternalModel,
    selectDeviceUnavailableCapabilities,
} from '@suite-common/wallet-core';
import { DeviceModelInternal } from '@trezor/connect';
import { Icon, variables } from '@trezor/components';
import { Translation } from './Translation';
import { ReactNode } from 'react';

const Display = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 16px;
    min-height: 134px;
    width: 100%;
    background: #000000;
    padding: 25px 12px;
`;

const Text = styled.div<{ isPixelType: boolean; isWithIndentation?: boolean }>`
    font-family: ${({ isPixelType }) => (isPixelType ? 'PixelOperatorMono8' : 'RobotoMono')};
    font-size: ${({ isPixelType }) => (isPixelType ? '12' : '18')}px;
    color: white;
    word-break: break-word;
    max-width: 216px;
    display: inline;
    text-indent: ${({ isWithIndentation }) => (isWithIndentation ? '28px' : '0')};
`;

const Row = styled.div<{ isAlignedRight?: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: ${({ isAlignedRight }) => (isAlignedRight ? 'flex-end' : 'flex-start')};
`;

const Chunks = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

const Wrapper = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const Divider = styled.div<{ areChunksUsed: boolean }>`
    width: 100%;
    height: 1px;
    background: #2b2b2b;
    margin: ${({ areChunksUsed }) => (areChunksUsed ? '20' : '0')}px 0;
`;

const AddressLabel = styled.span<{ areChunksUsed: boolean }>`
    font-weight: 600;
    color: #808080;
    font-size: ${variables.FONT_SIZE.TINY};
    text-transform: uppercase;
    position: absolute;
    background: #000000;
    padding: 0 10px;
    text-align: center;
    left: 50%;
    bottom: ${({ areChunksUsed }) => (areChunksUsed ? '12' : '-7')}px;
    transform: translate(-50%, 0);
`;

const StyledNextIcon = styled(Icon)<{ isPixelType: boolean }>`
    position: relative;
    bottom: ${({ isPixelType }) => (isPixelType ? '13' : '20')}px;
    right: ${({ isPixelType }) => (isPixelType ? '-95' : '35')}px;
`;

const StyledContinuesIcon = styled(Icon)<{ isPixelType: boolean }>`
    position: relative;
    top: ${({ isPixelType }) => (isPixelType ? '10' : '25')}px;
    right: ${({ isPixelType }) => (isPixelType ? '82' : '97')}px;
`;

export interface DeviceDisplayProps {
    address: string;
    network?: string;
}

export const DeviceDisplay = ({ address, network }: DeviceDisplayProps) => {
    const selectedDeviceInternalModel = useSelector(selectDeviceInternalModel);
    const unavailableCapabilities = useSelector(selectDeviceUnavailableCapabilities);
    const addressDisplayType = useSelector(selectAddressDisplayType);

    const areChunksUsed =
        addressDisplayType === AddressDisplayOptions.CHUNKED && !unavailableCapabilities?.chunkify;
    const isPixelType = selectedDeviceInternalModel !== DeviceModelInternal.T2T1;
    const isPaginated = network === 'cardano';
    const iconSize = isPixelType ? 10 : 20;
    const iconColor = isPixelType ? '#ffffff' : '#959596';
    const iconNextName = isPixelType ? 'ADDRESS_PIXEL_NEXT' : 'ADDRESS_NEXT';
    const iconContinuesName = isPixelType ? 'ADDRESS_PIXEL_CONTINUES' : 'ADDRESS_CONTINUES';

    const showChunksInRows = (chunks: ReactNode[][] | undefined, isNextAddress?: boolean) =>
        chunks?.map((row, rowIndex) => (
            <Row
                // eslint-disable-next-line react/no-array-index-key
                key={rowIndex}
                isPixelType={isPixelType}
                isAlignedRight={rowIndex === 0 && isNextAddress}
            >
                {row.map((chunk, chunkIndex) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Text isPixelType={isPixelType} key={chunkIndex}>
                        {chunk}
                    </Text>
                ))}
            </Row>
        ));

    const renderChunks = (address: string) => {
        const chunks = address.match(/.{1,4}/g);

        if (isPaginated) {
            // Add pagination icons
            // @ts-expect-error
            chunks?.splice(15, 0, <Icon size={iconSize} icon={iconNextName} color={iconColor} />);
            chunks?.splice(
                16,
                0,
                // @ts-expect-error
                <Icon size={iconSize} icon={iconContinuesName} color={iconColor} />,
            );
        }

        const groupedChunks = chunks?.reduce((result, chunk, index) => {
            const rowIndex = Math.floor(index / 4);

            if (!result[rowIndex]) {
                result[rowIndex] = [];
            }

            result[rowIndex].push(chunk);

            return result;
        }, [] as ReactNode[][]);

        if (isPaginated) {
            const PAGE_SIZE = 4;
            return (
                <>
                    <Chunks>{showChunksInRows(groupedChunks?.slice(0, PAGE_SIZE))}</Chunks>
                    <Wrapper>
                        <Divider areChunksUsed={areChunksUsed} />
                        <AddressLabel areChunksUsed={areChunksUsed}>
                            <Translation id="NEXT_PAGE" />
                        </AddressLabel>
                    </Wrapper>
                    <Chunks>{showChunksInRows(groupedChunks?.slice(PAGE_SIZE), true)}</Chunks>
                </>
            );
        }

        return <Chunks>{showChunksInRows(groupedChunks)}</Chunks>;
    };

    const renderOriginal = (address: string) => {
        if (isPaginated) {
            const breakpoint = isPixelType ? 70 : 81;
            return (
                <>
                    <Text isPixelType={isPixelType}>{address.slice(0, breakpoint)}</Text>
                    <StyledNextIcon
                        isPixelType={isPixelType}
                        size={iconSize}
                        icon={iconNextName}
                        color={iconColor}
                    />
                    <Wrapper>
                        <Divider areChunksUsed={areChunksUsed} />
                        <AddressLabel areChunksUsed={areChunksUsed}>
                            <Translation id="NEXT_PAGE" />
                        </AddressLabel>
                    </Wrapper>
                    <StyledContinuesIcon
                        isPixelType={isPixelType}
                        size={iconSize}
                        icon={iconContinuesName}
                        color={iconColor}
                    />
                    <Text isPixelType={isPixelType} isWithIndentation>
                        {address.slice(breakpoint)}
                    </Text>
                </>
            );
        }
        return <Text isPixelType={isPixelType}>{address}</Text>;
    };

    return <Display>{areChunksUsed ? renderChunks(address) : renderOriginal(address)}</Display>;
};
