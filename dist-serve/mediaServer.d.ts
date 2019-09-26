import { Channel, ChannelConfig } from './channel';
import * as SocketIO from 'socket.io';
export declare class MediaServer {
    readonly channels: Channel[];
    io: SocketIO.Server;
    constructor();
    /**
     * 初始化socket.io
     */
    initIo(): void;
    play(config: ChannelConfig, socket: SocketIO.Socket): void;
}
