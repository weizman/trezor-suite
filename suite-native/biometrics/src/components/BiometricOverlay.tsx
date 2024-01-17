import { StyleSheet } from 'react-native';

import { Box, Button, VStack } from '@suite-native/atoms';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { Icon } from '@suite-common/icons';
import { useTranslate } from '@suite-native/intl';

import { useIsBiometricsAuthenticationCanceled } from '../biometricsAtoms';

const overlayWrapperStyle = prepareNativeStyle(utils => ({
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: utils.colors.backgroundTertiaryDefaultOnElevation0,
}));

export const BiometricOverlay = () => {
    const { applyStyle } = useNativeStyles();
    const { translate } = useTranslate();
    const { isBiometricsAuthenticationCanceled, setIsBiometricsAuthenticationCanceled } =
        useIsBiometricsAuthenticationCanceled();

    const handleReenable = () => {
        // Setting this to true lets useBiometrics to ask for biometrics in case it was canceled by user before
        // https://github.com/trezor/trezor-suite/issues/10647
        setIsBiometricsAuthenticationCanceled(false);
    };

    return (
        <Box style={applyStyle(overlayWrapperStyle)}>
            <VStack>
                <Icon name="trezor" size="extraLarge" color="iconOnPrimary" />
                {isBiometricsAuthenticationCanceled && (
                    <Button data-testID="enable-biometrics" onPress={handleReenable}>
                        {translate('moduleHome.biometricsModal.title.unknown')}
                    </Button>
                )}
            </VStack>
        </Box>
    );
};
