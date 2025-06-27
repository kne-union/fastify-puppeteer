
# fastify-puppeteer


### 描述

用于操作无头浏览器截图保存pdf等


### 安装

```shell
npm i --save @kne/fastify-puppeteer
```


### 概述

### 项目简介

fastify-puppeteer 是一个基于 Fastify 的插件，它集成了 Puppeteer 来提供强大的网页内容转换功能。该插件可以将 HTML 内容或 URL 转换为 PDF 文档或图片，支持单个转换和批量转换操作。

### 主要特性

- HTML 转 PDF：将 HTML 内容直接转换为 PDF 文档
- HTML 转图片：将 HTML 内容转换为图片
- URL 转 PDF：将指定 URL 的网页转换为 PDF 文档
- URL 转图片：将指定 URL 的网页转换为图片
- 批量处理：支持批量转换多个 HTML 内容或 URL
- 并发控制：内置任务队列管理，控制最大并发任务数量
- 缓存机制：支持文件缓存，提高转换效率

### 技术架构

#### 核心组件

- **Fastify 插件**：提供 HTTP 接口和静态文件服务
- **Puppeteer**：负责网页渲染和内容转换
- **任务队列**：管理并发任务，防止系统过载
- **文件缓存**：缓存转换结果，提高响应速度

#### 工作流程

1. 接收转换请求（HTML内容或URL）
2. 通过任务队列管理器控制并发
3. 使用 Puppeteer 打开页面并进行渲染
4. 执行转换操作（PDF或图片）
5. 返回转换结果

### 配置选项

- **maxTaskSize**：最大并发任务数，默认为 100
- **puppeteerOptions**：Puppeteer 启动选项，用于配置浏览器行为
- **cacheOptions**：文件缓存配置，控制缓存行为

### 使用场景

- 网页存档：将网页内容保存为 PDF 文档
- 报表生成：将动态内容转换为 PDF 报表
- 网页截图：捕获网页内容生成图片
- 批量处理：批量转换多个网页或HTML内容


### 示例

#### 示例代码



### API

### API 接口文档

本文档详细描述了 fastify-puppeteer 插件提供的所有 API 接口。

#### 接口概览

| 接口名称 | 请求方法 | 请求路径 | 描述 |
|---------|---------|---------|------|
| parseHtmlToPdf | POST | /parseHtmlToPdf | 将 HTML 内容转换为 PDF 文件 |
| parseHtmlToPdfBatch | POST | /parseHtmlToPdfBatch | 批量将 HTML 内容转换为 PDF 文件（打包为 ZIP） |
| parseHtmlToPhoto | POST | /parseHtmlToPhoto | 将 HTML 内容转换为图片 |
| parseHtmlToPhotoBatch | POST | /parseHtmlToPhotoBatch | 批量将 HTML 内容转换为图片（打包为 ZIP） |
| parseUrlToPdf | POST | /parseUrlToPdf | 将 URL 网页转换为 PDF 文件 |
| parseUrlToPdfBatch | POST | /parseUrlToPdfBatch | 批量将 URL 网页转换为 PDF 文件（打包为 ZIP） |
| parseUrlToPhoto | POST | /parseUrlToPhoto | 将 URL 网页转换为图片 |
| parseUrlToPhotoBatch | POST | /parseUrlToPhotoBatch | 批量将 URL 网页转换为图片（打包为 ZIP） |

#### 接口详情

##### HTML 转换接口

###### parseHtmlToPdf

| 项目 | 说明 |
|------|------|
| 接口描述 | 将 HTML 内容转换为 PDF 文件 |
| 请求方法 | POST |
| 请求路径 | /parseHtmlToPdf |
| 认证方式 | 根据配置的 authenticate 函数 |
| 请求参数 | JSON 对象 |

**请求参数详情：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| content | string | 是 | 需要转换的 HTML 内容 |
| options | object | 否 | PDF 生成选项，参考 Puppeteer API |

**响应结果：**
- 返回生成的 PDF 文件流

###### parseHtmlToPdfBatch

| 项目 | 说明 |
|------|------|
| 接口描述 | 批量将 HTML 内容转换为 PDF 文件（打包为 ZIP） |
| 请求方法 | POST |
| 请求路径 | /parseHtmlToPdfBatch |
| 认证方式 | 根据配置的 authenticate 函数 |
| 请求参数 | JSON 对象 |

**请求参数详情：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| contentList | array | 是 | 需要转换的 HTML 内容列表 |
| options | object | 否 | PDF 生成选项，参考 Puppeteer API |

**响应结果：**
- 返回包含所有生成 PDF 的 ZIP 文件流

###### parseHtmlToPhoto

| 项目 | 说明 |
|------|------|
| 接口描述 | 将 HTML 内容转换为图片 |
| 请求方法 | POST |
| 请求路径 | /parseHtmlToPhoto |
| 认证方式 | 根据配置的 authenticate 函数 |
| 请求参数 | JSON 对象 |

**请求参数详情：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| content | string | 是 | 需要转换的 HTML 内容 |
| options | object | 否 | 图片生成选项，参考 Puppeteer API |

**响应结果：**
- 返回生成的图片文件流

###### parseHtmlToPhotoBatch

| 项目 | 说明 |
|------|------|
| 接口描述 | 批量将 HTML 内容转换为图片（打包为 ZIP） |
| 请求方法 | POST |
| 请求路径 | /parseHtmlToPhotoBatch |
| 认证方式 | 根据配置的 authenticate 函数 |
| 请求参数 | JSON 对象 |

**请求参数详情：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| contentList | array | 是 | 需要转换的 HTML 内容列表 |
| options | object | 否 | 图片生成选项，参考 Puppeteer API |

**响应结果：**
- 返回包含所有生成图片的 ZIP 文件流

##### URL 转换接口

###### parseUrlToPdf

| 项目 | 说明 |
|------|------|
| 接口描述 | 将 URL 网页转换为 PDF 文件 |
| 请求方法 | POST |
| 请求路径 | /parseUrlToPdf |
| 认证方式 | 根据配置的 authenticate 函数 |
| 请求参数 | JSON 对象 |

**请求参数详情：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| url | string | 是 | 需要转换的网页 URL |
| options | object | 否 | PDF 生成选项，参考 Puppeteer API |

**响应结果：**
- 返回生成的 PDF 文件流

###### parseUrlToPdfBatch

| 项目 | 说明 |
|------|------|
| 接口描述 | 批量将 URL 网页转换为 PDF 文件（打包为 ZIP） |
| 请求方法 | POST |
| 请求路径 | /parseUrlToPdfBatch |
| 认证方式 | 根据配置的 authenticate 函数 |
| 请求参数 | JSON 对象 |

**请求参数详情：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| urlList | array | 是 | 需要转换的网页 URL 列表 |
| options | object | 否 | PDF 生成选项，参考 Puppeteer API |

**响应结果：**
- 返回包含所有生成 PDF 的 ZIP 文件流

###### parseUrlToPhoto

| 项目 | 说明 |
|------|------|
| 接口描述 | 将 URL 网页转换为图片 |
| 请求方法 | POST |
| 请求路径 | /parseUrlToPhoto |
| 认证方式 | 根据配置的 authenticate 函数 |
| 请求参数 | JSON 对象 |

**请求参数详情：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| url | string | 是 | 需要转换的网页 URL |
| selector | string | 否 | 页面元素选择器，指定截图区域 |
| options | object | 否 | 图片生成选项，参考 Puppeteer API |

**响应结果：**
- 返回生成的图片文件流

###### parseUrlToPhotoBatch

| 项目 | 说明 |
|------|------|
| 接口描述 | 批量将 URL 网页转换为图片（打包为 ZIP） |
| 请求方法 | POST |
| 请求路径 | /parseUrlToPhotoBatch |
| 认证方式 | 根据配置的 authenticate 函数 |
| 请求参数 | JSON 对象 |

**请求参数详情：**

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| urlList | array | 是 | 需要转换的网页 URL 列表 |
| selector | string | 否 | 页面元素选择器，指定截图区域 |
| options | object | 否 | 图片生成选项，参考 Puppeteer API |

**响应结果：**
- 返回包含所有生成图片的 ZIP 文件流

### 选项参数说明

#### PDF 生成选项

PDF 生成选项参考 Puppeteer 的 [page.pdf()](https://pptr.dev/api/puppeteer.page.pdf) 方法参数，常用选项包括：

| 选项名 | 类型 | 描述 |
|-------|------|------|
| format | string | 纸张格式，如 'A4', 'Letter' 等 |
| width | string | 纸张宽度，如 '8.5in' |
| height | string | 纸张高度，如 '11in' |
| margin | object | 页面边距，包含 top, right, bottom, left 属性 |
| printBackground | boolean | 是否打印背景图形 |
| landscape | boolean | 是否使用横向打印 |

#### 图片生成选项

图片生成选项参考 Puppeteer 的 [page.screenshot()](https://pptr.dev/api/puppeteer.page.screenshot) 方法参数，常用选项包括：

| 选项名 | 类型 | 描述 |
|-------|------|------|
| type | string | 图片格式，如 'png', 'jpeg' |
| quality | number | 图片质量 (0-100)，仅适用于 JPEG |
| fullPage | boolean | 是否捕获完整页面 |
| clip | object | 裁剪区域，包含 x, y, width, height 属性 |
| omitBackground | boolean | 是否隐藏默认白色背景 |

