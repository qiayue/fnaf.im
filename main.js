import Fullscreen from './fullscreen.js';

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 获取元素
    const container = document.getElementById('gameContainer');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');

    // 创建全屏实例
    const fullscreen = new Fullscreen(container, {
        // 配置选项
        zIndex: 9999,
        backgroundColor: '#000',
        lockOrientation: true,
        // 进入全屏时的回调
        onEnterFullscreen: () => {
            fullscreenBtn.style.display = 'none';
            exitFullscreenBtn.style.display = 'block';
        },
        // 退出全屏时的回调
        onExitFullscreen: () => {
            fullscreenBtn.style.display = 'block';
            exitFullscreenBtn.style.display = 'none';
        }
    });

    // 绑定按钮点击事件
    fullscreenBtn.addEventListener('click', () => {
        fullscreen.enter();
    });

    exitFullscreenBtn.addEventListener('click', () => {
        fullscreen.exit();
    });

    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
        fullscreen.destroy();
    });
});