"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('electron'), app = _a.app, BrowserWindow = _a.BrowserWindow, ipcMain = _a.ipcMain, Menu = _a.Menu;
var client = require('electron-connect').client;
var url = require("url");
var path = require("path");
var createServer = require('./server').createServer;
var serve;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
Menu.setApplicationMenu(null);
createServer();
function createWindow() {
    // 创建浏览器窗口
    var win = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.maximize();
    win.show();
    // 加载index.html文件
    if (serve) {
        win.loadURL('http://localhost:4200');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, '../dist-src/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    // 打开工具
    win.webContents.openDevTools();
    if (serve) {
        // 开发环境打开热启动
        client.create(win);
    }
    win.on('closed', function () {
        win = null;
    });
}
app.on('ready', createWindow);
