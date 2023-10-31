// import TrezorConnect from '@trezor/connect';
import { Button, ButtonProps } from '@trezor/components';
import { Translation } from 'src/components/suite';

export const WebUsbButton = (props: ButtonProps) => (
    <Button
        {...props}
        icon="SEARCH"
        onClick={e => {
            e.stopPropagation();
            // TrezorConnect.requestWebUSBDevice();

            try {
                // @ts-expect-error
                navigator.bluetooth.requestDevice({
                    filters: [{ services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] }],
                });
            } catch (error) {
                // silent
            }
        }}
    >
        <Translation id="TR_CHECK_FOR_DEVICES" />
    </Button>
);
