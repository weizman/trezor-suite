import { envUtils } from './envUtils';

export type { Environment } from './types';

export const {
    isWeb,
    isDesktop,
    getEnvironment,
    getUserAgent,
    isAndroid,
    isChromeOs,
    getBrowserVersion,
    getBrowserName,
    getCommitHash,
    getDeviceType,
    getOsVersion,
    getSuiteVersion,
    isFirefox,
    getPlatform,
    getPlatformLanguages,
    getScreenWidth,
    getScreenHeight,
    getWindowWidth,
    getWindowHeight,
    getLocationOrigin,
    getLocationHostname,
    getProcessPlatform,
    isMacOs,
    isWindows,
    isIOs,
    isLinux,
    getOsName,
    getOsNameWeb,
    getOsFamily,
} = envUtils;
