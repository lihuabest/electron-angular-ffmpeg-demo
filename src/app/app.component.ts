import { Component } from '@angular/core';
import { ElectronService } from './services/electron.service';

import io from 'socket.io-client';

declare var flvjs;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    url: string;
    socket: any;
    flvPlayer: any;

    constructor(private electronService: ElectronService) {
        this.electronService.ipcRenderer.on('playOver', (e, message) => {
            this.initVideo();
        });
    }

    connectClick() {
        const img = document.getElementById('img');
        const streamCanvas = document.getElementById('streamCanvas');
        const streamCtx = streamCanvas['getContext']('2d');

        img.onload = () => {
            URL.revokeObjectURL(img['src']);
            streamCtx.drawImage(img, 0, 0, 720, 480);
        };

        this.socket = io('http://localhost:3000/socket');

        this.socket.on('connect', () => {
            this.socket.emit('msg', {
                url: 'rtsp://admin:admin@192.168.0.233:554/h264/ch1/main/av_stream',
                name: 'demo'
            });
        });
        this.socket.on('msg', (data) => {
            const arrayBuffer = new Uint8Array(data.body);
            const blob = new Blob([arrayBuffer.buffer], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            img['src'] = url;

            // const reader = new FileReader();
            // reader.readAsDataURL(blob);
            // reader.onload = (e) => {
            //     img['src'] = e.target['result'];
            // };
        });
        this.socket.on('disconnect', () => {
            console.log('disconnect');
        });
    }

    closeClick() {
        this.socket && this.socket.close();
        this.socket = null;
    }

    connectMp4fragClick() {
        // this.electronService.ipcRenderer.send('play', 'rtsp://admin:admin@192.168.0.233:554/h264/ch1/main/av_stream');
        this.electronService.ipcRenderer.send('play', 'rtsp://192.168.31.51:554/stream=0');
    }

    closeMp4fragClick() {
        this.flvPlayer && this.flvPlayer.destroy();
        this.flvPlayer = null;
    }

    initVideo() {
        if (flvjs.isSupported()) {
            const videoElement = document.getElementById('videoElement');
            this.flvPlayer = flvjs.createPlayer({
                type: 'mp4',
                isLive: true,
                url: 'http://localhost:3000/mp4frag.mp4'
            });
            this.flvPlayer.attachMediaElement(videoElement);
            this.flvPlayer.load();
            this.flvPlayer.play();
        }
    }
}
