/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class ChannelConfig {
    channelId?: string;
    channelName?: string;
    channelUrl: string;
}
export declare class Channel {
    config: ChannelConfig;
    ffmpeg: any;
    emitter: EventEmitter;
    isLive: boolean;
    firstBuffer: any;
    constructor(config: ChannelConfig);
    startStream(): void;
}
