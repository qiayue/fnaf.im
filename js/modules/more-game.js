function renderMoreGames() {
    const container = document.querySelector('#more-game');
    const currentDomain = window.location.hostname;
    console.log('currentDomain', currentDomain)
    const isLocalEnvironment = ['localhost', '127.0.0.1', '192.168.50.66', '192.168.50.63'].includes(currentDomain);
    let hasRendered = false;

    // 如果已经渲染过或者容器不存在，则直接返回
    if (hasRendered || !container) return;

    const exploreJson =  'https://sprunkigame.com/js/explore.json';

    fetch(exploreJson)
        .then(response => response.json())
        .then(data => {
            const filteredGames = data.games.filter(game => {
                // 如果 includedDomain 数组为空或不存在，则不渲染
                if (!Array.isArray(game.includedDomain) || game.includedDomain.length === 0) {
                    return false;
                }

                // 然后检查 excludeDomains
                if (!Array.isArray(game.excludeDomains)) return true;
                return !game.excludeDomains.some(domain =>
                    currentDomain.toLowerCase().includes(domain.toLowerCase())
                );
            });

            const html = filteredGames.map(game => {
                // 根据环境选择协议
                const protocol = isLocalEnvironment ? 'http' : 'https';
                const gameUrl = game.redirectTo || `${protocol}://${currentDomain}${window.location.port ? ':' + window.location.port : ''}${game.gamePath}`;
                return `
                    <a href="${gameUrl}" >
                        <div class="imgContainer">
                            <img src="${game.imgSrc}"alt="${game.alt}">
                            <p>
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                ${game.onlineDate || 'Coming Soon'}
                            </p>
                        </div>
                        <div class="content">
                            <div title="${game.title}">${game.title}</div>
                            <p title="${game.description}">${game.description}</p>
                        </div>
                    </a>
                `;
            }).join('');

            container.insertAdjacentHTML('beforeend', html);
            hasRendered = true;
        })
        .catch(error => {
            console.error('Error fetching game data:', error);
            container.innerHTML = '<p class="text-red-500">Failed to load recommended games</p>';
        });
}
renderMoreGames()
// 页面加载完成后执行渲染 
// document.addEventListener('DOMContentLoaded', renderMoreGames);