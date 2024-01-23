import { useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-shadow
import * as Clipboard from 'expo-clipboard';

import { useToast } from '@suite-native/toasts';

export function useCopyToClipboard() {
    const { showToast } = useToast();

    const copyToClipboard = useCallback(
        async (value: string, toastMessage?: string) => {
            await Clipboard.setStringAsync(value);

            showToast({
                variant: 'default',
                message: toastMessage ?? 'Copied to clipboard.',
                icon: 'copy',
            });
        },
        [showToast],
    );
    return copyToClipboard;
}
