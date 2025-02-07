async function loadGames() {
    try {
        const response = await fetch('../data/games.json');
        const data = await response.json();
        
        const gameGrid = document.getElementById('gameGrid');
        
        data.games.forEach(game => {
            const gameCard = document.createElement('a');
            gameCard.href = game.path;
            gameCard.className = 'game-card';
            
            gameCard.innerHTML = `
                <img src="${game.image}" alt="${game.title}" loading="lazy">
                <span class="game-title">${game.title}</span>
            `;
            
            gameGrid.appendChild(gameCard);
        });
    } catch (error) {
        console.error('Error loading games:', error);
    }
}

// Load games when DOM is ready
document.addEventListener('DOMContentLoaded', loadGames);
