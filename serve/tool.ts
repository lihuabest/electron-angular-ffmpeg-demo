import * as path from 'path';
import { app } from 'electron';

// 返回文件绝对路径
export function getFile(p) {
    let rootDir = app.getAppPath();
    let last = path.basename(rootDir);
    if (last === 'app.asar') {
        rootDir = path.join(app.getAppPath(), p).replace('app.asar', 'app.asar.unpacked'); // 打包环境
    } else {
        rootDir = path.resolve('.', p); // 开发环境
    }

    return rootDir;
}
