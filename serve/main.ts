const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const client = require('electron-connect').client;
import * as url from 'url';
import * as path from 'path';

const { createServer } = require('./server');

let serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

Menu.setApplicationMenu(null);
createServer();

function createWindow() {
    // 创建浏览器窗口
    let win = new BrowserWindow({
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
    } else {
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

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);
