"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('electron'), app = _a.app, BrowserWindow = _a.BrowserWindow, ipcMain = _a.ipcMain;
var client = require('electron-connect').client;
var path = require("path");
var url = require("url");
var MediaServer = require('./mediaServer').MediaServer;
var serve;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
var server = new MediaServer();
function createWindow() {
    // 创建浏览器窗口
    var win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    // 加载index.html文件
    if (serve) {
        win.loadURL('http://localhost:4200');
    }
    else {
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
    win.on('closed', function () {
        win = null;
    });
    // 页面通信
    ipcMain.on('play', function (event, message) {
        server.play({
            channelUrl: message
        });
        win.webContents.send('playOver', 'copy play: ' + message);
    });
}
app.on('ready', createWindow);
