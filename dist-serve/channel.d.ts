import * as Ffmpeg from 'fluent-ffmpeg';
import * as SocketIO from 'socket.io';
export declare class ChannelConfig {
    channelId: string;
    channelName: string;
    channelUrl: string;
}
export declare class Channel {
    freeTime: number;
    config: ChannelConfig;
    sockets: SocketIO.Socket[];
    ffmpeg: Ffmpeg.FfmpegCommand;
    constructor(config: ChannelConfig);
    startStreamWrap(): void;
    startStreamWrap2(): void;
    /**
     * 添加socket
     * @param socket
     */
    addSocket(socket: SocketIO.Socket): void;
    /**
     * 移除socket
     * @param socket
     */
    removeSocket(socket: SocketIO.Socket): void;
}
