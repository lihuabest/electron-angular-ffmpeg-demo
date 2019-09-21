import { Channel, ChannelConfig } from './channel';
import * as SocketIO from 'socket.io';
export declare class MediaServer {
    readonly channels: Channel[];
    io: SocketIO.Server;
    constructor();
    play(config: ChannelConfig): void;
}
