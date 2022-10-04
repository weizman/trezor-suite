import { analytics, EventType, getRandomId } from '@trezor/connect-analytics';
import { storage } from '@trezor/connect-common';

const onEnable = () => {
    save(TRACKING_ENABLED, true);
    analytics.report({ type: EventType.SettingsTracking, value: true });
};

const onDisable = () => {
    save(TRACKING_ENABLED, false);
    analytics.report({ type: EventType.SettingsTracking, value: false }, true);
};

export const initAnalytics = () => {
    let instanceId = load(TRACKING_ID);
    if (!instanceId) {
        instanceId = getRandomId();
        save(TRACKING_ID, instanceId);
    }

    const userAllowedTracking = load(TRACKING_ENABLED) || false;

    analytics.init(userAllowedTracking, {
        instanceId,
        environment: 'web',
        commitId: process.env.COMMIT_HASH || '',
        isDev: process.env.NODE_ENV === 'development',
        callbacks: {
            onEnable,
            onDisable,
        },
    });
};
