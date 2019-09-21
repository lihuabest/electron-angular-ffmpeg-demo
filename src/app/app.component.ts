import { Component } from '@angular/core';
import { ElectronService } from './services/electron.service';

declare var flvjs;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(private electronService: ElectronService) {
        this.electronService.ipcRenderer.on('playOver', (e, message) => {
            console.log(message);
            this.initVideo();
        });
    }

    connectClick() {
        this.electronService.ipcRenderer.send('play', 'rtsp://admin:admin@192.168.0.233:554/h264/ch1/main/av_stream');
    }

    initVideo() {
        if (flvjs.isSupported()) {
            const videoElement = document.getElementById('videoElement');
            const flvPlayer = flvjs.createPlayer({
                type: 'flv',
                isLive: true,
                url: 'ws://localhost:3000/rtsp.out'
            });
            flvPlayer.attachMediaElement(videoElement);
            flvPlayer.load();
            flvPlayer.play();
        }
    }
}
