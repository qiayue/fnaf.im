const menuBtn = document.getElementById('menuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn.addEventListener('click', function() {
    mobileMenu.style.transform = 'translateX(0)';
});

closeMenuBtn.addEventListener('click', function() {
    mobileMenu.style.transform = 'translateX(100%)';
});