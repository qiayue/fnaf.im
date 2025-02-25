module.exports = {
    // 基础配置
    baseUrl: 'https://fnaf.im',
    languages: ['en'],
    
    // sitemap 配置
    sitemap: {
        defaultPriority: 0.8,
        defaultChangefreq: 'weekly',
        homepage: {
            priority: 1.0,
            changefreq: 'daily'
        },
        translations: {
            priority: 0.9,
            changefreq: 'daily'
        }
    },
    
    // robots.txt 配置
    robots: {
        crawlDelay: 10,
        disallowDirs: [
            '/Base-Template/',
            '/css/',
            '/js/',
            '/img/',
            '/node_modules/',
            '/.git/'
        ]
    }
};