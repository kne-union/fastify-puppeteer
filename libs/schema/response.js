// 接口均通过 reply.sendFile 返回文件流，响应 schema 只写说明、不声明类型，避免干扰输出
const fileResponse = description => ({ 200: { description } });

const DISPOSITION = '；请求传 filename 时附带 Content-Disposition: attachment 下载头';
const pdfFile = fileResponse(`PDF 文件流（application/pdf）${DISPOSITION}`);
const photoFile = fileResponse(`图片文件流，格式由 options.type 决定，默认 png${DISPOSITION}`);
const zipFile = kind => fileResponse(`zip 压缩包文件流，按输入顺序包含每一项生成的${kind}${DISPOSITION}`);

// filename 原本未声明、无类型约束，这里只补说明不加 type
const filename = { description: '下载文件名；传入后响应附带 Content-Disposition: attachment 头，不传则浏览器按文件流直接展示' };
const encodedContent = '的 HTML 内容，需先用 plantuml-encoder 的 encode 压缩编码后放入 query';

module.exports = { fileResponse, pdfFile, photoFile, zipFile, filename, encodedContent };
