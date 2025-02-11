/**
 * IMPORTS WARNING
 * this file is bundled into content script so be careful what you are importing not to bloat the bundle
 */

import { Deferred, createDeferred } from '@trezor/utils/lib/createDeferred';
import { TypedEmitter } from '@trezor/utils/lib/typedEventEmitter';
import { scheduleAction } from '@trezor/utils/lib/scheduleAction';

// todo: I can't import Log from connect to connect-common (connect imports from connect-common).
// so logger should be probably moved to connect common, or this file should be moved to connect
// import type { Log } from '@trezor/connect/lib/utils/debug';
type Log = any;

export interface AbstractMessageChannelConstructorParams {
    sendFn: (message: any) => void;
    channel: {
        here: string;
        peer: string;
    };
    logger?: Log;
}

export type Message<IncomingMessages extends { type: string }> = {
    channel: AbstractMessageChannelConstructorParams['channel'];
    id: number;
    type: IncomingMessages['type'];
    payload: IncomingMessages;
    success: boolean;
};

/**
 * concepts:
 * - it handshakes automatically with the other side of the channel
 * - it queues messages fired before handshake and sends them after handshake is done
 */
export abstract class AbstractMessageChannel<
    IncomingMessages extends { type: string },
> extends TypedEmitter<{
    message: Message<IncomingMessages>;
}> {
    protected messagePromises: Record<number, Deferred<any>> = {};
    /** queue of messages that were scheduled before handshake */
    protected messagesQueue: any[] = [];
    protected messageID = 0;

    abstract disconnect(): void;

    private readonly handshakeMaxRetries = 5;
    private readonly handshakeRetryInterval = 2000;
    private handshakeFinished: Deferred<void> | undefined;

    protected logger?: Log;

    /**
     * function that passes data to the other side of the channel
     */
    sendFn: AbstractMessageChannelConstructorParams['sendFn'];
    /**
     * channel identifiers that pairs AbstractMessageChannel instances on sending and receiving end together
     */
    channel: AbstractMessageChannelConstructorParams['channel'];

    constructor({ sendFn, channel, logger }: AbstractMessageChannelConstructorParams) {
        super();
        this.channel = channel;
        this.sendFn = sendFn;
        this.logger = logger;
    }

    /**
     * initiates handshake sequence with peer. resolves after communication with peer is established
     */
    public init() {
        if (!this.handshakeFinished) {
            this.handshakeFinished = createDeferred();
            this.handshakeWithPeer();
        }
        return this.handshakeFinished.promise;
    }

    /**
     * handshake between both parties of the channel.
     * both parties initiate handshake procedure and keep asking over time in a loop until they time out or receive confirmation from peer
     */
    protected handshakeWithPeer(): Promise<void> {
        this.logger?.log(this.channel.here, 'handshake');
        return scheduleAction(
            async () => {
                this.postMessage(
                    {
                        type: 'channel-handshake-request',
                        data: { success: true, payload: undefined },
                    },
                    { usePromise: false, useQueue: false },
                );
                await this.handshakeFinished?.promise;
            },
            {
                attempts: this.handshakeMaxRetries,
                timeout: this.handshakeRetryInterval,
            },
        )
            .then(() => {
                this.logger?.log(this.channel.here, 'handshake confirmed');
                this.messagesQueue.forEach(message => {
                    message.channel = this.channel;
                    this.sendFn(message);
                });
                this.messagesQueue = [];
            })
            .catch(() => {
                this.handshakeFinished?.reject(new Error('handshake failed'));
                this.handshakeFinished = undefined;
            });
    }

    /**
     * message received from communication channel in descendants of this class
     * should be handled by this common onMessage method
     */
    protected onMessage(message: Message<IncomingMessages>) {
        const { channel, id, type, payload, success } = message;
        if (!channel?.peer || channel.peer !== this.channel.here) {
            return;
        }
        if (!channel?.here || this.channel.peer !== channel.here) {
            return;
        }

        if (type === 'channel-handshake-request') {
            this.postMessage(
                {
                    type: 'channel-handshake-confirm',
                    data: { success: true, payload: undefined },
                },
                { usePromise: false, useQueue: false },
            );
            return;
        }
        if (type === 'channel-handshake-confirm') {
            this.handshakeFinished?.resolve(undefined);
            return;
        }

        if (this.messagePromises[id]) {
            this.messagePromises[id].resolve({ id, payload, success });
            delete this.messagePromises[id];
        }
        const messagePromisesLength = Object.keys(this.messagePromises).length;
        if (messagePromisesLength > 5) {
            this.logger.warn(
                `too many message promises (${messagePromisesLength}). this feels unexpected!`,
            );
        }

        this.emit('message', message);
    }

    // todo: outgoing messages should be typed
    postMessage(message: any, { usePromise = true, useQueue = true } = {}) {
        message.channel = this.channel;
        if (!usePromise) {
            try {
                this.sendFn(message);
            } catch (err) {
                if (useQueue) {
                    this.messagesQueue.push(message);
                }
            }
            return;
        }

        this.messageID++;
        message.id = this.messageID;
        this.messagePromises[message.id] = createDeferred();

        try {
            this.sendFn(message);
        } catch (err) {
            if (useQueue) {
                this.messagesQueue.push(message);
            }
        }

        return this.messagePromises[message.id].promise;
    }

    resolveMessagePromises(resolvePayload: Record<string, any>) {
        // This is used when we know that the connection has been interrupted but there might be something waiting for it.
        Object.keys(this.messagePromises).forEach(id =>
            this.messagePromises[id as any].resolve({
                id,
                payload: resolvePayload,
            }),
        );
    }

    clear() {
        this.handshakeFinished = undefined;
    }
}
