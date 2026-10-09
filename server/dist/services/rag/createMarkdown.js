//根据任务、结论和引用生成 Markdown，保存到受限目录。
import fs from 'node:fs';
import path from 'node:path';
//
import { Transformer } from 'markmap-lib'; //解析md文件为mindmap
import { fillTemplate } from 'markmap-render'; //转换为html
import { createMarkdownInput } from '../../schemas/report.shcema.js';
import { REPORTS_DIR } from '../../config/paths.js';
import reportData from './reportData.js';
import judjeIsmap from './judjeIsmap.js';
const transformer = new Transformer();
//报告内容上限,超过就不落盘
const MAX_REPORT_BYTES = 2 * 1024 * 1024;
//关键词转成可用作文件名的片段:去掉路径分隔符等非法字符,并限长
function toFileSlug(keyword) {
    const cleaned = keyword
        .replace(/[\\/:*?"<>|\s]+/g, '_')
        .replace(/^[_.]+|[_.]+$/g, '')
        .slice(0, 50);
    return cleaned || 'report';
}
async function createMarkdown(isMap = 'auto', keyword, list, codeResults = []) {
    //isMap 可能来自 LLM,先按 schema 收成严格 boolean
    const { isMap: safeIsMap } = createMarkdownInput.parse({ keyword, isMap });
    const shouldCreateMap = await judjeIsmap(keyword, safeIsMap);
    console.log('judjeIsmap判断是否生成思维导图', shouldCreateMap);
    //报告目录由 config/paths.ts 统一给出
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    //每次调用用独立文件名,避免同名互相覆盖
    const slug = `${toFileSlug(keyword)}-${Date.now()}`;
    const mdPath = path.join(REPORTS_DIR, `${slug}.md`);
    const mapPath = path.join(REPORTS_DIR, `${slug}-map.html`);
    //接受内容
    const obj1 = await reportData(keyword, list, codeResults);
    const md = `# ${obj1.title}

## 用户任务
${obj1.task}

## 结论
${obj1.conclusion}

## 分析
${obj1.analysis}
${obj1.code ? `\n## 相关代码\n${obj1.code}\n` : ''}
## 参考资料
${obj1.sourceMarkdown}
`;
    //限制内容大小,避免一次写入过大文件
    const mdBytes = Buffer.byteLength(md, 'utf-8');
    if (mdBytes > MAX_REPORT_BYTES) {
        throw new Error(`报告内容超过大小上限:${mdBytes} 字节,上限 ${MAX_REPORT_BYTES} 字节`);
    }
    fs.writeFileSync(mdPath, md);
    console.log('生成文件', mdPath);
    //根据isMap是否生成思维导图
    if (shouldCreateMap) {
        //用内存里的 md,不再重复读盘
        const { root, features } = transformer.transform(md);
        //获取需要的cssjs资源
        const assets = transformer.getUsedAssets(features);
        //转换为html
        const html = fillTemplate(root, assets);
        fs.writeFileSync(mapPath, html, 'utf-8');
        //把链接追加到md,链接与md同目录,用相对文件名
        fs.appendFileSync(mdPath, `\n## 思维导图\n\n[打开交互式思维导图](${path.basename(mapPath)})\n`);
        console.log('附加思维导图', mapPath);
    }
    //console.log('createmarkdown返回值', { mdFileName: `${slug}.md`, mapFileName: shouldCreateMap ? `${slug} - map.html` : null })
    //返回md文件和思维导图html文件
    return { mdFileName: `${slug}.md`, mapFileName: shouldCreateMap ? `${slug}-map.html` : null };
}
export default createMarkdown;
//# sourceMappingURL=createMarkdown.js.map