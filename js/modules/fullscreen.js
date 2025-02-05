// 检测是否为移动设备
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// 获取必要的DOM元素
const fullscreenBtn = document.getElementById('fullscreenBtn');
const exitFullscreenBtn = document.querySelector('#exitFullscreenBtn');
const iframeContainer = document.querySelector('.iframeContainer');
const gameFrame = document.getElementById('gameFrame');

// 处理PC端全屏
function handlePCFullscreen() {
    if (!document.fullscreenElement) {
        gameFrame.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// 处理移动端全屏
function handleMobileFullscreen() {
    if (!iframeContainer.classList.contains('mobile-fullscreen')) {
        // 进入全屏模式
        iframeContainer.classList.add('mobile-fullscreen');
        gameFrame.classList.add('mobile-fullscreen');
        exitFullscreenBtn.style.display = 'block';
        // 处理屏幕旋转
        screen.orientation.lock('landscape').catch(() => {
            console.log('Orientation lock not supported');
        });
    } else {
        exitMobileFullscreen();
    }
}

// 退出移动端全屏
function exitMobileFullscreen() {
    iframeContainer.classList.remove('mobile-fullscreen');
    gameFrame.classList.remove('mobile-fullscreen');
    exitFullscreenBtn.style.display = 'none';
    screen.orientation.unlock();
}

// 事件监听
fullscreenBtn.addEventListener('click', () => {
    if (isMobile) {
        handleMobileFullscreen();
    } else {
        handlePCFullscreen();
    }
});

exitFullscreenBtn.addEventListener('click', () => {
    if (isMobile) {
        exitMobileFullscreen();
    } else {
        document.exitFullscreen();
    }
});

// 监听PC端全屏变化
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        exitFullscreenBtn.style.display = 'none';
    } else {
        exitFullscreenBtn.style.display = 'block';
    }
});