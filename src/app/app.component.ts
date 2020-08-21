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
    // url = 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov';
    // url = 'rtmp://58.200.131.2:1935/livetv/gxtv';
    player;

    list = [];

    constructor(private electronService: ElectronService) {
        this.addClick();
    }

    /**
     * 添加播放组件
     */
    addClick() {
        this.list.push({
            player: null,
            url: null,
            id: new Date().getTime()
        });
    }

    /**
     * 播放
     */
    play(item) {
        let video = document.getElementById(item.id) as HTMLVideoElement;
        let rtsp = item.url;
        let player = item.player;
        let port = this.electronService.localServerPort;

        if (player) {
            destroy();
        }

        function createPlayer() {
            player = flvjs.createPlayer({
                type: 'flv',
                isLive: true,
                url: 'http://localhost:' + port + '/rtsp?url=' + encodeURIComponent(rtsp) + '&time=' + new Date().getTime()
            }, {
                enableWorker: false,
                enableStashBuffer: false,
                stashInitialSize: 128
            });
            player.attachMediaElement(video);

            // 检测到报错后 可以重连
            flvjs.LoggingControl.addLogListener((res, desc) => {
                if (desc === '[MSEController] > MediaSource onSourceEnded' || desc === '[IOController] > Loader error, code = 403, msg = Forbidden') {
                    setTimeout(() => {
                        if (player) {
                            player.unload();
                            player.load();
                            player.play();
                        }
                    }, 5 * 1000);
                }
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
        item.player = player;
    }
}
