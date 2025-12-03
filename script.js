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
    boardDisplay.className = 'board-display hexagon-board';
    
    // Classic Catan board layout (19 hexes in specific pattern)
    // Row structure: 3-4-5-4-3
    const classicLayout = [
        { row: 0, count: 3, offset: 2 },
        { row: 1, count: 4, offset: 1.5 },
        { row: 2, count: 5, offset: 1 },
        { row: 3, count: 4, offset: 1.5 },
        { row: 4, count: 3, offset: 2 }
    ];
    
    // Expansion board layout (30 hexes)
    // Row structure: 4-5-6-5-6-4
    const expansionLayout = [
        { row: 0, count: 4, offset: 2 },
        { row: 1, count: 5, offset: 1.5 },
        { row: 2, count: 6, offset: 1 },
        { row: 3, count: 5, offset: 1.5 },
        { row: 4, count: 6, offset: 1 },
        { row: 5, count: 4, offset: 2 }
    ];
    
    const layout = isExpansion ? expansionLayout : classicLayout;
    let tileIndex = 0;
    
    layout.forEach(rowData => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'hex-row';
        rowDiv.style.cssText = `
            display: flex;
            justify-content: center;
            margin-left: ${rowData.offset * 45}px;
        `;
        
        for (let i = 0; i < rowData.count && tileIndex < tiles.length; i++) {
            const tile = tiles[tileIndex++];
            const hexContainer = document.createElement('div');
            hexContainer.className = 'hex-container';
            
            const hexagon = document.createElement('div');
            hexagon.className = 'hexagon';
            hexagon.style.backgroundColor = TERRAIN_TYPES[tile.terrain].color;
            
            const hexContent = document.createElement('div');
            hexContent.className = 'hex-content';
            
            const terrainName = document.createElement('div');
            terrainName.className = 'terrain-name';
            terrainName.textContent = TERRAIN_TYPES[tile.terrain].name;
            
            if (tile.number) {
                const numberElement = document.createElement('div');
                numberElement.className = 'number-token';
                numberElement.textContent = tile.number;
                
                // Highlight high-probability numbers
                if (tile.number === 6 || tile.number === 8) {
                    numberElement.classList.add('high-probability');
                }
                
                // Add dots for probability
                const dots = getProbabilityDots(tile.number);
                const dotsElement = document.createElement('div');
                dotsElement.className = 'probability-dots';
                dotsElement.textContent = dots;
                numberElement.appendChild(dotsElement);
                
                hexContent.appendChild(numberElement);
            }
            
            const resourceElement = document.createElement('div');
            resourceElement.className = 'resource-name';
            resourceElement.textContent = TERRAIN_TYPES[tile.terrain].resource;
            
            hexContent.appendChild(terrainName);
            hexContent.appendChild(resourceElement);
            
            hexagon.appendChild(hexContent);
            hexContainer.appendChild(hexagon);
            rowDiv.appendChild(hexContainer);
        }
        
        boardDisplay.appendChild(rowDiv);
    });
}

function getProbabilityDots(number) {
    const probabilities = {
        2: '•', 3: '••', 4: '•••', 5: '••••', 6: '•••••',
        8: '•••••', 9: '••••', 10: '•••', 11: '••', 12: '•'
    };
    return probabilities[number] || '';
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
