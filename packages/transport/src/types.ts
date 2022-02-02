export type { INamespace as MessagesJSON } from 'protobufjs/light';
export type { Root as Messages } from 'protobufjs/light';

// does not have session
export type TrezorDeviceInfo = {
    path: string;
};

export type TrezorDeviceInfoWithSession = TrezorDeviceInfo & {
    session?: string;
    debugSession?: string | null;
    debug: boolean;
    path: string;
    vendor: string;
    product: number;
};

export type AcquireInput = {
    path: string;
    previous?: string;
};

export type MessageFromTrezor = { type: string; message: Record<string, unknown> };
