//createmarkdown生成报告之后,路由读取文件返回给浏览器
import express from 'express';
import path from 'node:path';
import { REPORTS_DIR } from '../config/paths.js';
const router = express.Router();
//白名单挡掉斜杠、反斜杠、冒号等一切路径拼接素材,穿越无从谈起
const SAFE_FILE_NAME = /^[A-Za-z0-9_.-]+$/;
router.get('/:fileName', (req, res) => {
    //Express 5 的 params 类型是 string | string[],收窄成 string
    const rawFileName = req.params.fileName;
    const fileName = Array.isArray(rawFileName) ? rawFileName[0] : rawFileName;
    if (!fileName || !SAFE_FILE_NAME.test(fileName)) {
        return res.status(400).json({ message: '文件名不合法' });
    }
    //html 用 inline,思维导图直接开;md 用 attachment 下载
    const isHtml = path.extname(fileName) === '.html';
    const disposition = isHtml ? 'inline' : 'attachment';
    res.sendFile(
    //下载路由读取刚刚createmarkdown存档的文件
    path.join(REPORTS_DIR, fileName), { headers: { 'Content-Disposition': `${disposition}; filename="${fileName}"` } }, err => {
        if (!err || res.headersSent)
            return;
        const notFound = err.message.includes('ENOENT');
        res.status(notFound ? 404 : 500).json({
            message: notFound ? '报告不存在' : '读取报告失败',
        });
    });
});
export default router;
//# sourceMappingURL=reports.js.map