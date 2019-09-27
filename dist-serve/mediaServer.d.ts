import { Channel, ChannelConfig } from './channel';
import * as SocketIO from 'socket.io';
export declare class MediaServer {
    readonly channels: Channel[];
    io: SocketIO.Server;
    httpServer: any;
    app: any;
    mp4frag: any;
    constructor();
    /**
     * 初始化socket.io
     */
    initIo(): void;
    play(config: ChannelConfig, socket: SocketIO.Socket): void;
    playMp4frag(config: ChannelConfig): void;
}
