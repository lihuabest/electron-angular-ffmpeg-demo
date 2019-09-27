const { app, BrowserWindow, ipcMain } = require('electron');
const client = require('electron-connect').client;
import * as path from 'path';
import * as url from 'url';
const { MediaServer } = require('./mediaServer');

let serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

const server = new MediaServer();

function createWindow() {
    // 创建浏览器窗口
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // 加载index.html文件
    if (serve) {
        win.loadURL('http://localhost:4200');
    } else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    if (serve) {
        // 打开工具
        win.webContents.openDevTools();

        // 开发环境打开热启动
        client.create(win);
    }

    win.on('closed', () => {
        win = null;
    });

    // 页面通信
    ipcMain.on('play', (event, message) => {
        server.playMp4frag({
            channelUrl: message
        });

        win.webContents.send('playOver', 'copy play: ' + message);
    });
}

app.on('ready', createWindow);
