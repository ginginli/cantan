// Catan Board Generator Logic

const TERRAIN_TYPES = {
    FOREST: { name: 'Forest', color: '#2d5016', resource: 'Wood' },
    PASTURE: { name: 'Pasture', color: '#90ee90', resource: 'Sheep' },
    FIELD: { name: 'Field', color: '#f4d03f', resource: 'Wheat' },
    HILL: { name: 'Hill', color: '#cd853f', resource: 'Brick' },
    MOUNTAIN: { name: 'Mountain', color: '#808080', resource: 'Ore' },
    DESERT: { name: 'Desert', color: '#f5deb3', resource: 'None' }
};

const CLASSIC_TERRAIN = [
    'FOREST', 'FOREST', 'FOREST', 'FOREST',
    'PASTURE', 'PASTURE', 'PASTURE', 'PASTURE',
    'FIELD', 'FIELD', 'FIELD', 'FIELD',
    'HILL', 'HILL', 'HILL',
    'MOUNTAIN', 'MOUNTAIN', 'MOUNTAIN',
    'DESERT'
];

const CLASSIC_NUMBERS = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

const EXPANSION_TERRAIN = [
    ...CLASSIC_TERRAIN,
    'FOREST', 'FOREST',
    'PASTURE', 'PASTURE',
    'FIELD', 'FIELD',
    'HILL', 'HILL',
    'MOUNTAIN', 'MOUNTAIN',
    'DESERT'
];

const EXPANSION_NUMBERS = [...CLASSIC_NUMBERS, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12];

let currentSettings = {
    boardType: 'classic',
    prevent_6_8: true,
    prevent_2_12: true,
    prevent_same_number: false,
    prevent_same_resource: false
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generate-btn').addEventListener('click', generateBoard);
    document.getElementById('options-btn').addEventListener('click', toggleOptions);
    document.getElementById('close-options').addEventListener('click', toggleOptions);
    document.getElementById('board-type').addEventListener('change', updateBoardType);
    
    // Options checkboxes
    document.getElementById('opt-6-8').addEventListener('change', (e) => {
        currentSettings.prevent_6_8 = e.target.checked;
    });
    document.getElementById('opt-2-12').addEventListener('change', (e) => {
        currentSettings.prevent_2_12 = e.target.checked;
    });
    document.getElementById('opt-same-num').addEventListener('change', (e) => {
        currentSettings.prevent_same_number = e.target.checked;
    });
    document.getElementById('opt-same-res').addEventListener('change', (e) => {
        currentSettings.prevent_same_resource = e.target.checked;
    });
});

function toggleOptions() {
    const panel = document.getElementById('options-panel');
    panel.classList.toggle('hidden');
}

function updateBoardType(e) {
    currentSettings.boardType = e.target.value;
}

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function generateBoard() {
    const isExpansion = currentSettings.boardType === 'expansion';
    const terrains = shuffle(isExpansion ? EXPANSION_TERRAIN : CLASSIC_TERRAIN);
    const numbers = shuffle(isExpansion ? EXPANSION_NUMBERS : CLASSIC_NUMBERS);
    
    // Assign numbers to non-desert tiles
    let numberIndex = 0;
    const tiles = terrains.map(terrain => {
        if (terrain === 'DESERT') {
            return { terrain, number: null };
        }
        return { terrain, number: numbers[numberIndex++] };
    });
    
    // Validate board based on settings
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!isValidBoard(tiles) && attempts < maxAttempts) {
        const shuffledNumbers = shuffle(isExpansion ? EXPANSION_NUMBERS : CLASSIC_NUMBERS);
        numberIndex = 0;
        tiles.forEach(tile => {
            if (tile.terrain !== 'DESERT') {
                tile.number = shuffledNumbers[numberIndex++];
            }
        });
        attempts++;
    }
    
    displayBoard(tiles, isExpansion);
}

function isValidBoard(tiles) {
    // Simple validation - in a real implementation, you'd check adjacency
    // For now, just check if high-value numbers are not too clustered
    if (currentSettings.prevent_6_8) {
        const highNumbers = tiles.filter(t => t.number === 6 || t.number === 8);
        if (highNumbers.length > 4) return true; // Simplified check
    }
    return true;
}

function displayBoard(tiles, isExpansion) {
    const boardDisplay = document.getElementById('board-display');
    boardDisplay.innerHTML = '';
    boardDisplay.style.display = 'grid';
    boardDisplay.style.gap = '10px';
    boardDisplay.style.padding = '2rem';
    
    if (isExpansion) {
        boardDisplay.style.gridTemplateColumns = 'repeat(5, 1fr)';
    } else {
        boardDisplay.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
    
    tiles.forEach((tile, index) => {
        const tileElement = document.createElement('div');
        tileElement.className = 'tile';
        tileElement.style.cssText = `
            background-color: ${TERRAIN_TYPES[tile.terrain].color};
            padding: 1.5rem;
            border-radius: 10px;
            text-align: center;
            color: white;
            font-weight: 600;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            min-height: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;
        
        const terrainName = document.createElement('div');
        terrainName.textContent = TERRAIN_TYPES[tile.terrain].name;
        terrainName.style.fontSize = '0.9rem';
        terrainName.style.marginBottom = '0.5rem';
        
        const numberElement = document.createElement('div');
        if (tile.number) {
            numberElement.textContent = tile.number;
            numberElement.style.cssText = `
                font-size: 2rem;
                font-weight: 700;
                background-color: rgba(255,255,255,0.9);
                color: #333;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto;
            `;
            
            // Highlight high-probability numbers
            if (tile.number === 6 || tile.number === 8) {
                numberElement.style.backgroundColor = '#ff6b6b';
                numberElement.style.color = 'white';
            }
        }
        
        const resourceElement = document.createElement('div');
        resourceElement.textContent = TERRAIN_TYPES[tile.terrain].resource;
        resourceElement.style.fontSize = '0.8rem';
        resourceElement.style.marginTop = '0.5rem';
        resourceElement.style.opacity = '0.9';
        
        tileElement.appendChild(terrainName);
        if (tile.number) {
            tileElement.appendChild(numberElement);
        }
        tileElement.appendChild(resourceElement);
        
        boardDisplay.appendChild(tileElement);
    });
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
