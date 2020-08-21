const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const client = require('electron-connect').client;
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';
import { getFile } from './tool';

const { createServer } = require('./server');

let serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

app.allowRendererProcessReuse = true;
// 关闭工具栏
Menu.setApplicationMenu(null);

async function createWindow() {
    // 创建浏览器窗口
    let win = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    // 窗口最大化
    win.maximize();
    // 显示窗口
    win.show();

    // 读取配置文件
    let data = fs.readFileSync(getFile('config/data.json'), 'utf-8');
    let d = JSON.parse(data);
    // 初始化ffmpeg server
    createServer(d.localServerPort);
    // 往前端页面注册信息
    win.webContents.executeJavaScript('localStorage.setItem("localServerPort", "' + d.localServerPort + '");', true);
    win.webContents.executeJavaScript('localStorage.setItem("httpProxyServer", "' + d.httpProxyServer + '");', true);

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

    if (serve) {
        // 开发环境打开热启动
        client.create(win);
        // 打开工具
        win.webContents.openDevTools();
    }

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);
