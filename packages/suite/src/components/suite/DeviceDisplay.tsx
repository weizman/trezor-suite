import styled from 'styled-components';

import { useSelector } from 'src/hooks/suite/useSelector';
import { AddressDisplayOptions, selectAddressDisplay } from 'src/reducers/suite/suiteReducer';
import {
    selectDeviceInternalModel,
    selectDeviceUnavailableCapabilities,
} from '@suite-common/wallet-core';
import { DeviceModelInternal } from '@trezor/connect';
import { Icon, variables } from '@trezor/components';
import { Translation } from './Translation';

const Content = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: center;
    align-items: center;
`;

const Display = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 16px;
    min-height: 134px;
    width: 100%;
    background: #000000;
    padding: 25px 12px;
`;

const Text = styled.div<{ isPixelType: boolean; areChunksUsed?: boolean }>`
    font-family: ${props => (props.isPixelType ? 'PixelOperatorMono8' : 'RobotoMono')};
    font-size: ${props => (props.isPixelType ? '12' : '18')}px;
    color: white;
    word-break: break-word;
    max-width: ${props => (props.areChunksUsed ? '100%' : '216px')};
`;

const Row = styled.div<{ isPixelType: boolean }>`
    display: flex;
    align-items: center;
    gap: ${props => (props.isPixelType ? '8' : '9')}px;
`;

const Chunks = styled.div<{ isPixelType: boolean }>`
    display: flex;
    flex-direction: column;
    gap: ${props => (props.isPixelType ? '6' : '5')}px;
`;

const Wrapper = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const Divider = styled.div<{ isPixelType: boolean }>`
    width: 100%;
    height: 1px;
    background: #2b2b2b;
    margin: ${props => (props.isPixelType ? '10px' : '0')} 0;
`;

const AddressLabel = styled.span<{ isPixelType: boolean }>`
    font-weight: 600;
    color: #868686;
    font-size: ${variables.FONT_SIZE.TINY};
    text-transform: uppercase;
    position: absolute;
    background: #000000;
    padding: 0 10px;
    text-align: center;
    left: 50%;
    bottom: ${props => (props.isPixelType ? '2' : '-7')}px;
    transform: translate(-50%, 0);
`;

const StyledNextIcon = styled(Icon)<{ isPixelType: boolean }>`
    position: relative;
    bottom: ${props => (props.isPixelType ? '13' : '20')}px;
    right: ${props => (props.isPixelType ? '-95' : '35')}px;
`;

const StyledContinuesIcon = styled(Icon)<{ isPixelType: boolean }>`
    position: relative;
    right: ${props => (props.isPixelType ? '82' : '97')}px;
    top: ${props => (props.isPixelType ? '10' : '25')}px;
`;

export interface DeviceDisplayProps {
    address: string;
    network?: string;
}

export const DeviceDisplay = ({ address, network }: DeviceDisplayProps) => {
    const selectedDeviceInternalModel = useSelector(selectDeviceInternalModel);
    const unavailableCapabilities = useSelector(selectDeviceUnavailableCapabilities);
    const addressDisplay = useSelector(selectAddressDisplay);

    const areChunksUsed =
        addressDisplay === AddressDisplayOptions.CHUNKED && !unavailableCapabilities?.chunkify;
    const isPixelType = selectedDeviceInternalModel !== DeviceModelInternal.T2T1;
    const isPaginated = network === 'cardano';

    const showChunksInRows = (chunks: string[][] | undefined) =>
        chunks?.map((row, rowIndex) => (
            // eslint-disable-next-line react/no-array-index-key
            <Row key={rowIndex} isPixelType={isPixelType}>
                {row.map((chunk, chunkIndex) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Text isPixelType={isPixelType} key={chunkIndex}>
                        {chunk}
                    </Text>
                ))}
            </Row>
        ));

    const showChunks = (address: string) => {
        const chunks = address.match(/.{1,4}/g);

        const groupedChunks = chunks?.reduce((result, chunk, index) => {
            const rowIndex = Math.floor(index / 4);

            if (!result[rowIndex]) {
                result[rowIndex] = [];
            }

            result[rowIndex].push(chunk);
            return result;
        }, [] as string[][]);

        if (isPaginated) {
            return (
                <Content>
                    <Chunks isPixelType={isPixelType}>
                        {showChunksInRows(groupedChunks?.slice(0, 4))}
                    </Chunks>
                    <Wrapper>
                        <Divider isPixelType={isPixelType} />
                        <AddressLabel isPixelType={isPixelType}>
                            <Translation id="NEXT_PAGE" />
                        </AddressLabel>
                    </Wrapper>
                    <Chunks isPixelType={isPixelType}>
                        {showChunksInRows(groupedChunks?.slice(4))}
                    </Chunks>
                </Content>
            );
        }

        return <Chunks isPixelType={isPixelType}>{showChunksInRows(groupedChunks)}</Chunks>;
    };

    function showOriginal(address: string) {
        if (isPaginated) {
            const breakpoint = isPixelType ? 70 : 81;
            return (
                <Content>
                    <Text isPixelType={isPixelType}>{address.slice(0, breakpoint)}</Text>
                    <StyledNextIcon
                        isPixelType={isPixelType}
                        size={isPixelType ? 10 : 20}
                        icon={isPixelType ? 'ADDRESS_PIXEL_NEXT' : 'ADDRESS_NEXT'}
                        color={isPixelType ? '#ffffff' : '#959596'}
                    />
                    <Wrapper>
                        <Divider isPixelType={isPixelType} />
                        <AddressLabel isPixelType={isPixelType}>
                            <Translation id="NEXT_PAGE" />
                        </AddressLabel>
                    </Wrapper>
                    <StyledContinuesIcon
                        isPixelType={isPixelType}
                        size={isPixelType ? 10 : 20}
                        icon={isPixelType ? 'ADDRESS_PIXEL_CONTINUES' : 'ADDRESS_CONTINUES'}
                        color={isPixelType ? '#ffffff' : '#959596'}
                    />
                    <Text isPixelType={isPixelType}>
                        &nbsp;&nbsp;&nbsp;{address.slice(breakpoint)}
                    </Text>
                </Content>
            );
        }
        return <Text isPixelType={isPixelType}>{address}</Text>;
    }

    return (
        <Display>
            {areChunksUsed ? showChunks(address as string) : showOriginal(address as string)}
        </Display>
    );
};
