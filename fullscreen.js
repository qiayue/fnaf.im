// 配置对象，提供默认值
const DEFAULT_OPTIONS = {
    zIndex: 9999,
    backgroundColor: '#000',
    lockOrientation: true,
    onEnterFullscreen: () => {},
    onExitFullscreen: () => {}
};

// 检查全屏 API 支持
const fullscreenAPI = (() => {
    const apis = {
        requestFullscreen: ['requestFullscreen', 'mozRequestFullScreen', 'webkitRequestFullscreen', 'msRequestFullscreen'],
        exitFullscreen: ['exitFullscreen', 'mozCancelFullScreen', 'webkitExitFullscreen', 'msExitFullscreen'],
        fullscreenElement: ['fullscreenElement', 'mozFullScreenElement', 'webkitFullscreenElement', 'msFullscreenElement'],
        fullscreenchange: ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
    };

    const result = {};
    
    for (const [key, values] of Object.entries(apis)) {
        if (key === 'fullscreenchange') {
            result[key] = values.find(api => `on${api.toLowerCase()}` in document);
            continue;
        }
        result[key] = values.find(api => 
            key === 'exitFullscreen' ? document[api] : 
            key === 'fullscreenElement' ? api in document : 
            HTMLElement.prototype[api]
        );
    }
    
    return result;
})();

// 工具函数
const utils = {
    isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isLandscape: () => window.innerWidth > window.innerHeight,
    
    // 应用样式的辅助函数
    applyStyles: (element, styles) => {
        Object.assign(element.style, styles);
    }
};

class Fullscreen {
    constructor(element, options = {}) {
        this.element = element;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.isFullscreen = false;
        this.exitButton = null;
        this.fullscreenButton = document.getElementById('fullscreenBtn');
        
        // 绑定方法到实例
        this.handleExitFullscreen = this.handleExitFullscreen.bind(this);
        
        // 添加全屏变化事件监听
        const eventName = fullscreenAPI.fullscreenchange;
        document.addEventListener(eventName || 'fullscreenchange', () => {
            const isFullscreenElement = document[fullscreenAPI.fullscreenElement] === this.element;
            if (!isFullscreenElement && this.isFullscreen) {
                this.handleExitFullscreen();
            }
        });
    }

    async enter() {
        if (this.isFullscreen) return;

        if (utils.isMobile()) {
            // 移动端处理逻辑
            this.saveOriginalStyles();
            this.createExitButton();
            if (this.fullscreenButton) {
                this.fullscreenButton.style.display = 'none';
            }
            await this.handleMobileFullscreen();
        } else {
            // PC端只请求全屏，不处理按钮
            const enterMethod = this.element[fullscreenAPI.requestFullscreen];
            if (enterMethod) await enterMethod.call(this.element);
        }

        this.isFullscreen = true;
        this.options.onEnterFullscreen();
    }

    handleExitFullscreen() {
        if (!this.isFullscreen) return;

        if (utils.isMobile()) {
            // 移动端退出处理
            this.removeExitButton();
            this.restoreOriginalStyles();
            if (this.fullscreenButton) {
                this.fullscreenButton.style.display = '';
            }
            // 解锁屏幕方向
            if (screen.orientation?.unlock) {
                screen.orientation.unlock();
            }
        } else {
            // PC端退出全屏
            const exitMethod = document[fullscreenAPI.exitFullscreen];
            if (exitMethod) exitMethod.call(document);
        }
        
        this.isFullscreen = false;
        this.options.onExitFullscreen();
    }

    // 如果有 exit 方法，确保它也遵循同样的逻辑
    async exit() {
        if (!this.isFullscreen) return;

        if (utils.isMobile()) {
            this.removeExitButton();
            this.restoreOriginalStyles();
            if (this.fullscreenButton) {
                this.fullscreenButton.style.display = '';
            }
            if (screen.orientation?.unlock) {
                screen.orientation.unlock();
            }
        } else {
            // PC端只退出全屏，不处理按钮
            const exitMethod = document[fullscreenAPI.exitFullscreen];
            if (exitMethod) await exitMethod.call(document);
        }

        this.isFullscreen = false;
        this.options.onExitFullscreen();
    }

    createExitButton() {
        const button = document.createElement('button');
        button.innerHTML = 'Exit';
        
        const baseStyles = {
            position: 'fixed',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 77, 79, 0.8)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s'
        };

        // 根据是否横屏和锁定方向设置不同的样式
        if (!utils.isLandscape() && this.options.lockOrientation) {
            Object.assign(baseStyles, {
                top: '10px',
                right: '10px',
                transform: 'rotate(90deg)',  // 反向旋转按钮
                transformOrigin: 'center center',
                zIndex: (parseInt(this.options.zIndex) + 2).toString(), // 确保按钮在最上层
            });
        } else {
            Object.assign(baseStyles, {
                top: '10px',
                right: '10px',
                zIndex: (parseInt(this.options.zIndex) + 1).toString(),
            });
        }

        utils.applyStyles(button, baseStyles);
        
        // 添加触摸反馈
        button.addEventListener('touchstart', () => {
            button.style.backgroundColor = 'rgba(255, 77, 79, 1)';
        });
        
        button.addEventListener('touchend', () => {
            button.style.backgroundColor = 'rgba(255, 77, 79, 0.8)';
        });

        // 使用 touchend 事件代替 click 事件，以提高移动端响应速度
        button.addEventListener('touchend', (e) => {
            e.preventDefault(); // 防止触发点击事件
            this.handleExitFullscreen();
        });

        document.body.appendChild(button);
        this.exitButton = button;
    }

    removeExitButton() {
        if (this.exitButton) {
            this.exitButton.remove();
            this.exitButton = null;
        }
    }

    async handleMobileFullscreen() {
        const styles = {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            zIndex: this.options.zIndex.toString(),
            backgroundColor: this.options.backgroundColor,
            margin: '0',
            padding: '0',
            maxWidth: 'none',
            maxHeight: 'none'
        };

        if (!utils.isLandscape() && this.options.lockOrientation) {
            Object.assign(styles, {
                width: '100vh',
                height: '100vw',
                transform: 'rotate(90deg) translateY(-100%)',
                transformOrigin: 'top left',
                top: '0',
                left: '0'
            });
        }

        utils.applyStyles(this.element, styles);

        if (this.options.lockOrientation && screen.orientation?.lock) {
            try {
                await screen.orientation.lock('landscape');
            } catch (error) {
                console.warn('Orientation lock failed:', error);
            }
        }
    }

    saveOriginalStyles() {
        // 保存所有关键样式属性，确保包含 z-index
        const stylesToSave = [
            'position', 'top', 'left', 'width', 'height',
            'transform', 'transformOrigin', 'zIndex', 'backgroundColor',
            'display', 'visibility'  // 添加这些属性以确保完全恢复
        ];
        
        this.originalStyles = stylesToSave.reduce((styles, prop) => {
            // 获取计算后的样式，如果没有设置则使用空字符串
            styles[prop] = this.element.style[prop] || '';
            return styles;
        }, {});
    }

    restoreOriginalStyles() {
        // 确保完全重置所有样式
        utils.applyStyles(this.element, {
            ...this.originalStyles,
            zIndex: this.originalStyles.zIndex || 'auto'  // 如果原来没有 z-index，则设为 auto
        });
    }

    destroy() {
        if (this.isFullscreen) {
            this.exit();
        }
        
        this.removeExitButton();
    }
}

export default Fullscreen;
