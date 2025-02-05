document.querySelectorAll('.faq .content > div').forEach(item => {
    item.addEventListener('click', () => {
        // 关闭其他打开的FAQ
        document.querySelectorAll('.faq .content > div.active').forEach(activeItem => {
            if (activeItem !== item) {
                activeItem.classList.remove('active');
            }
        });
        item.classList.toggle('active');
    });
});