const fs = require('fs').promises;
const path = require('path');
const defaultConfig = require('./seo-config.cjs');

class SEOGenerator {
    constructor(config = {}) {
        this.config = { ...defaultConfig, ...config };
        this.baseDir = path.join(__dirname, '..');
    }

    async generateSitemap() {
        try {
            const currentDate = new Date().toISOString().split('T')[0];
            let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
            // 添加首页
            sitemapContent += this._generateUrlEntry('/', currentDate, 
                this.config.sitemap.homepage.changefreq,
                this.config.sitemap.homepage.priority
            );

            // 添加其他语言版本的首页
            for (const lang of this.config.languages) {
                if (lang === 'en') continue;
                sitemapContent += this._generateUrlEntry(`/${lang}/`, currentDate,
                    this.config.sitemap.translations.changefreq,
                    this.config.sitemap.translations.priority
                );
            }

            // 扫描项目根目录
            const rootDir = path.join(__dirname, '..');
            
            // 获取所有子目录（排除特定目录和语言目录）
            const excludeDirs = [
                ...this.config.robots.disallowDirs.map(dir => dir.replace(/^\/|\/$/g, '')), // 移除首尾的斜杠
                ...this.config.languages,
                '.git',  // 额外排除一些系统目录
                '.vscode'
            ];
            const dirs = (await fs.readdir(rootDir, { withFileTypes: true }))
                .filter(dirent => dirent.isDirectory() && !excludeDirs.includes(dirent.name))
                .map(dirent => dirent.name);

            // 为每个目录添加到 sitemap
            for (const dir of dirs) {
                // 添加英文版本（默认）
                sitemapContent += this._generateUrlEntry(
                    `/${dir}/`,
                    currentDate,
                    this.config.sitemap.defaultChangefreq,
                    this.config.sitemap.defaultPriority
                );

                // 检查其他语言版本是否存在
                for (const lang of this.config.languages) {
                    if (lang === 'en') continue;
                    const langPath = path.join(rootDir, lang, dir);
                    try {
                        const stat = await fs.stat(langPath);
                        if (stat.isDirectory()) {
                            sitemapContent += this._generateUrlEntry(
                                `/${lang}/${dir}/`,
                                currentDate,
                                this.config.sitemap.defaultChangefreq,
                                this.config.sitemap.defaultPriority
                            );
                        }
                    } catch (error) {
                        // 目录不存在，跳过
                        continue;
                    }
                }
            }

            sitemapContent += '</urlset>';
            await this._writeFile('sitemap.xml', sitemapContent);
            console.log('Sitemap 生成成功！');
        } catch (error) {
            console.error('生成 Sitemap 时发生错误:', error);
        }
    }

    async generateRobots() {
        try {
            const robotsContent = `# robots.txt for ${this.config.baseUrl}
User-agent: *
Allow: /
${this.config.languages.map(lang => `Allow: /${lang}/`).join('\n')}

# 站点地图
Sitemap: ${this.config.baseUrl}/sitemap.xml

# 爬虫限制
Crawl-delay: ${this.config.robots.crawlDelay}

# 禁止访问的目录
${this.config.robots.disallowDirs.map(dir => `Disallow: ${dir}`).join('\n')}
`;
            await this._writeFile('robots.txt', robotsContent);
            console.log('robots.txt 生成成功！');
        } catch (error) {
            console.error('生成 robots.txt 时发生错误:', error);
        }
    }

    _generateUrlEntry(url, date, changefreq, priority) {
        return `    <url>
        <loc>${this.config.baseUrl}${url}</loc>
        <lastmod>${date}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
    </url>
`;
    }

   
    async _writeFile(filename, content) {
        const filePath = path.join(this.baseDir, filename);
        await fs.writeFile(filePath, content, 'utf8');
    }

    // 添加 generateAll 方法
    async generateAll() {
        await this.generateSitemap();
        await this.generateRobots();
        console.log('所有 SEO 文件生成完成！');
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const generator = new SEOGenerator();
    generator.generateAll();
}

module.exports = SEOGenerator;