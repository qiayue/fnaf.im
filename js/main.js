// 方式1：使用动态加载（推荐，因为您的HTML中没有使用type="module"）
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script load error: ${src}`));
        document.body.appendChild(script);
    });
}

// 初始化所有需要的脚本
async function initScripts() {
    try {
        await loadScript('../js/modules/faq.js');
        await loadScript('../js/modules/fullscreen.js');
        await loadScript('../js/modules/mobile-menu.js');
        // await loadScript('../js/modules/more-game.js');
        // 如果还有其他JS文件需要加载，可以继续添加
        // await loadScript('../js/other2.js');
    } catch (error) {
        console.error('Error loading scripts:', error);
    }
}

// 执行加载
initScripts();
