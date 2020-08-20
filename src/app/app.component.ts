import { Component } from '@angular/core';
import { ElectronService } from './services/electron.service';
// import io from 'socket.io-client';
declare var flvjs;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    url = 'rtsp://192.168.0.249/h264/ch1/main/av_stream';
    player;

    constructor(private electronService: ElectronService) {

    }

    play() {
        let video = document.getElementById('video') as HTMLVideoElement;
        let rtsp = this.url;
        let player = this.player;

        if (player) {
            destroy();
        }

        function createPlayer() {
            player = flvjs.createPlayer({
                type: 'flv',
                isLive: true,
                url: 'http://localhost:8888/rtsp?url=' + rtsp + '&time=' + new Date().getTime()
            }, {
                enableWorker: false,
                enableStashBuffer: false,
                stashInitialSize: 128
            });
            player.attachMediaElement(video);
            // 检测到报错后 可以重连
            player.on(flvjs.Events.ERROR, function(errorType, errorDetail) {
                setTimeout(function() {
                    replay();
                }, 10000);
            });

            try {
                player.load();
                player.play();

                setTimeout(checkTime, 10 * 1000);
            } catch (error) {
                console.log(error);
            }
        }

        function replay() {
            destroy();
            createPlayer();
        }

        function destroy() {
            player.pause();
            player.unload();
            player.detachMediaElement();
            player.destroy();
            player = null;
        }

        function checkTime() {
            let buffered = video.buffered;
            if (buffered.length > 0) {
                let end = buffered.end(0);
                if (end - video.currentTime > 0.15) {
                    video.currentTime = end - 0.08;
                }
            }

            setTimeout(checkTime, 10 * 1000);
        }

        createPlayer();
        this.player = player;
    }
}
