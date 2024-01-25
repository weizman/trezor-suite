import { useBiometrics } from '../useBiometrics';
import { useIsBiometricsOverlayVisible } from '../biometricsAtoms';
import { BiometricOverlay } from './BiometricOverlay';

export const BiometricsModalRenderer = () => {
    useBiometrics();
    const { isBiometricsOverlayVisible } = useIsBiometricsOverlayVisible();

    return <>{isBiometricsOverlayVisible && <BiometricOverlay />}</>;
};
