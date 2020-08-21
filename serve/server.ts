import * as express from 'express';
import * as expressWebSocket from 'express-ws';
import { Channel, ChannelConfig } from './channel';
import * as path from 'path';

let Channels: Channel[] = [];

// 开启服务
export function createServer(port) {
    let appBase = express();
    let { app } = expressWebSocket(appBase);

    // 开启跨域
    // app.all('*', function(req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    //     res.header("X-Powered-By",' 3.2.1')
    //     res.header("Content-Type", "application/json;charset=utf-8");
    //     next();
    // });

    app.ws('/rtsp', wsRequestHandle);
    app.get('/rtsp', httpRequestHandle);
    app.use(express.static(path.join(__dirname, '../node_modules')));
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../index.html'));
    });
    app.listen(port);
    console.log('express server start at http://localhost:' + port);
}

// ws处理rtsp服务
function wsRequestHandle(ws, req) {
    let url = req.query.url;
    let config: ChannelConfig = {
        channelUrl: url
    };

    let channel = Channels.find(channel => channel.config.channelUrl === config.channelUrl);
    if (!channel) {
        channel = new Channel(config);
        Channels.push(channel);
        channel.startStream();
    }

    let writeStream = buffer => {
        ws.send(buffer);
    };
    channel.emitter.on('data', writeStream);

    // 第一帧很特殊 每次直接返回
    if (channel.firstBuffer) {
        ws.send(channel.firstBuffer);
    }

    ws.on('close', () => {
        channel.emitter.removeListener('data', writeStream);

        // 流检测
        checkStream();
    });
}

// http处理rtsp服务
function httpRequestHandle(req, res) {
    res.setHeader('Content-Type', 'video/x-flv');
    res.setHeader('Access-Control-Allow-Origin', '*');

    let url = req.query.url;
    let config: ChannelConfig = {
        channelUrl: url
    };

    let channel = Channels.find(channel => channel.config.channelUrl === config.channelUrl);
    if (!channel) {
        channel = new Channel(config);
        Channels.push(channel);
        channel.startStream();
    }

    // ffmpeg通过emitter发送数据出来
    let writeStream = buffer => {
        res.write(buffer);
    };
    channel.emitter.on('data', writeStream);

    // ffmpeg主动发送关闭了
    let closeStream = () => {
        channel.emitter.removeListener('data', writeStream);
        channel.emitter.removeListener('close', closeStream);

        res.status(403).end();
    };
    channel.emitter.on('close', closeStream);

    // 第一帧很特殊 每次直接返回
    if (channel.firstBuffer) {
        res.write(channel.firstBuffer);
    }

    res.on('close', () => {
        channel.emitter.removeListener('data', writeStream);

        // 流检测
        checkStream();
    });
}

/**
 * 每10s 检测一下是否还有连接
 */
function checkStream() {
    setTimeout(() => {
        Channels.forEach(channel => {
            let count = channel.emitter.listeners('data');
            if (count.length <= 0) {
                channel.ffmpeg.kill(); // 关闭ffmpeg
                channel.isLive = false;
            }
        });

        Channels = Channels.filter(channel => channel.isLive);
    }, 10000);
}
