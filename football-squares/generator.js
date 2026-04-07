// Global state
let masterGrid = null;
let groupGrids = [];
let team1Name = '';
let team2Name = '';
let team1Numbers = [];
let team2Numbers = [];
let numGroups = 0;
let groupNames = [];

// Colors for different groups
const groupColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#FF8FA3', '#6C5CE7', '#00B894', '#FDCB6E', '#E17055',
    '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E', '#55EFC4'
];

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    // Initialize group name inputs on page load
    updateGroupNameInputs();
});

function setupEventListeners() {
    document.getElementById('generator-form').addEventListener('submit', (e) => {
        e.preventDefault();
        generateGrids();
    });

    // Listen for changes to number of groups
    document.getElementById('num-groups').addEventListener('input', updateGroupNameInputs);

    document.getElementById('download-master-csv').addEventListener('click', downloadMasterCSV);
    document.getElementById('download-all-csv').addEventListener('click', downloadAllCSVs);
    document.getElementById('print-all').addEventListener('click', printAllTickets);
    document.getElementById('view-master').addEventListener('click', viewMasterGrid);
    document.getElementById('reset').addEventListener('click', reset);
}

function updateGroupNameInputs() {
    const numGroups = parseInt(document.getElementById('num-groups').value);
    const container = document.getElementById('group-names-container');
    const inputsDiv = document.getElementById('group-names-inputs');
    
    if (numGroups >= 2 && numGroups <= 100) {
        container.style.display = 'block';
        inputsDiv.innerHTML = '';
        
        for (let i = 1; i <= numGroups; i++) {
            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'group-name-input';
            
            const label = document.createElement('label');
            label.textContent = `Group ${i}:`;
            label.setAttribute('for', `group-name-${i}`);
            
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `group-name-${i}`;
            input.placeholder = `e.g., John, Team A, etc.`;
            
            inputWrapper.appendChild(label);
            inputWrapper.appendChild(input);
            inputsDiv.appendChild(inputWrapper);
        }
    } else {
        container.style.display = 'none';
    }
}

function generateGrids() {
    // Get form values
    team1Name = document.getElementById('team1-name').value.trim();
    team2Name = document.getElementById('team2-name').value.trim();
    numGroups = parseInt(document.getElementById('num-groups').value);
    const assignNumbers = document.getElementById('assign-numbers').checked;

    // Collect group names
    groupNames = [];
    for (let i = 1; i <= numGroups; i++) {
        const input = document.getElementById(`group-name-${i}`);
        const name = input ? input.value.trim() : '';
        groupNames.push(name || `Group ${i}`);
    }

    // Assign numbers if checkbox is checked
    if (assignNumbers) {
        team1Numbers = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        team2Numbers = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    } else {
        team1Numbers = [];
        team2Numbers = [];
    }

    // Initialize master grid (10x10)
    masterGrid = Array(10).fill(null).map(() => Array(10).fill(null));

    // Create array of all squares
    const allSquares = [];
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            allSquares.push({ row, col });
        }
    }

    // Shuffle squares
    const shuffledSquares = shuffleArray(allSquares);

    // Calculate squares per group
    const squaresPerGroup = Math.floor(100 / numGroups);
    const extraSquares = 100 % numGroups;

    // Assign squares to groups
    let squareIndex = 0;
    groupGrids = [];

    for (let g = 0; g < numGroups; g++) {
        const groupNumber = g + 1;
        const groupColor = groupColors[g % groupColors.length];
        const groupName = groupNames[g];
        
        // Calculate how many squares this group gets
        let numSquaresForGroup = squaresPerGroup;
        if (g < extraSquares) {
            numSquaresForGroup++; // Distribute extra squares to first groups
        }

        const groupSquares = [];

        // Assign squares to this group
        for (let i = 0; i < numSquaresForGroup; i++) {
            const square = shuffledSquares[squareIndex++];
            masterGrid[square.row][square.col] = groupNumber;
            groupSquares.push(square);
        }

        groupGrids.push({
            groupNumber,
            groupName,
            color: groupColor,
            squares: groupSquares
        });
    }

    // Show results
    showResults();
}

function showResults() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    document.getElementById('group-count').textContent = numGroups;

    // Generate tickets
    generateTickets();
}

function generateTickets() {
    const container = document.getElementById('tickets-container');
    container.innerHTML = '';

    // Add master grid ticket first
    const masterTicket = createMasterTicket();
    container.appendChild(masterTicket);

    // Add individual group tickets
    groupGrids.forEach(group => {
        const ticket = createTicket(group);
        container.appendChild(ticket);
    });
}

function createMasterTicket() {
    const ticketDiv = document.createElement('div');
    ticketDiv.className = 'card';
    ticketDiv.style.pageBreakAfter = 'always';

    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '20px';
    header.innerHTML = `
        <h2 style="color: #333;">Master Grid - All Groups</h2>
        <p style="color: #666;">${team1Name} vs ${team2Name}</p>
        <p style="color: #666; font-weight: bold;">Reference Sheet</p>
    `;
    ticketDiv.appendChild(header);

    // Create grid
    const gridDiv = document.createElement('div');
    gridDiv.className = 'grid-preview';
    
    // Add team name label above grid
    const teamLabelTop = document.createElement('div');
    teamLabelTop.style.textAlign = 'center';
    teamLabelTop.style.fontWeight = 'bold';
    teamLabelTop.style.marginBottom = '2px';
    teamLabelTop.style.color = '#333';
    teamLabelTop.textContent = team1Name;
    gridDiv.appendChild(teamLabelTop);
    
    const table = document.createElement('table');
    table.className = 'grid-table';

    // Header row
    const headerRow = document.createElement('tr');
    
    // Corner cell
    const cornerCell = document.createElement('td');
    cornerCell.className = 'corner';
    headerRow.appendChild(cornerCell);

    // Team 1 header (columns)
    for (let i = 0; i < 10; i++) {
        const cell = document.createElement('td');
        cell.className = 'header';
        cell.textContent = team1Numbers.length > 0 ? team1Numbers[i] : '';
        headerRow.appendChild(cell);
    }
    table.appendChild(headerRow);

    // Grid rows
    for (let row = 0; row < 10; row++) {
        const tr = document.createElement('tr');

        // Team 2 number (row header)
        const rowHeader = document.createElement('td');
        rowHeader.className = 'header';
        rowHeader.textContent = team2Numbers.length > 0 ? team2Numbers[row] : '';
        tr.appendChild(rowHeader);

        // Grid cells - show all groups without color
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('td');
            const groupNum = masterGrid[row][col];
            const group = groupGrids[groupNum - 1];
            
            cell.style.backgroundColor = 'white';
            cell.style.color = '#333';
            cell.textContent = group.groupName;
            cell.style.fontSize = '10px';
            cell.style.fontWeight = 'bold';
            cell.style.padding = '2px';
            cell.style.lineHeight = '1.2';
            cell.style.overflow = 'hidden';
            cell.style.textOverflow = 'ellipsis';
            cell.style.whiteSpace = 'nowrap';

            tr.appendChild(cell);
        }

        table.appendChild(tr);
    }

    // Add team name label on the left side
    const teamLabelLeft = document.createElement('div');
    teamLabelLeft.style.position = 'absolute';
    teamLabelLeft.style.left = '-5px';
    teamLabelLeft.style.top = '50%';
    teamLabelLeft.style.transform = 'rotate(-90deg) translateY(-50%)';
    teamLabelLeft.style.transformOrigin = 'center center';
    teamLabelLeft.style.fontWeight = 'bold';
    teamLabelLeft.style.color = '#333';
    teamLabelLeft.style.whiteSpace = 'nowrap';
    teamLabelLeft.style.fontSize = '14px';
    teamLabelLeft.textContent = team2Name;
    
    const gridWrapper = document.createElement('div');
    gridWrapper.style.position = 'relative';
    gridWrapper.style.paddingLeft = '80px';
    gridWrapper.style.margin = '0 auto';
    gridWrapper.style.display = 'table';
    gridWrapper.appendChild(teamLabelLeft);
    gridWrapper.appendChild(table);
    
    gridDiv.appendChild(gridWrapper);
    ticketDiv.appendChild(gridDiv);

    // Add group reference
    const legend = document.createElement('div');
    legend.style.marginTop = '20px';
    legend.style.padding = '10px';
    legend.style.border = '2px solid #333';
    legend.style.borderRadius = '8px';
    legend.innerHTML = '<h4 style="text-align: center; margin-bottom: 8px; font-size: 14px;">Group Reference</h4>';
    
    const legendGrid = document.createElement('div');
    legendGrid.style.display = 'grid';
    legendGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
    legendGrid.style.gap = '8px';
    
    groupGrids.forEach(group => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '6px';
        item.style.border = '1px solid #333';
        item.style.borderRadius = '4px';
        item.style.fontSize = '12px';
        
        const groupLabel = document.createElement('span');
        groupLabel.style.fontWeight = 'bold';
        groupLabel.style.marginRight = '8px';
        groupLabel.style.flex = '1';
        groupLabel.textContent = `G${group.groupNumber}: ${group.groupName}`;
        
        const squareCount = document.createElement('span');
        squareCount.style.fontSize = '10px';
        squareCount.style.color = '#666';
        squareCount.style.marginLeft = '5px';
        squareCount.textContent = `(${group.squares.length})`;
        
        item.appendChild(groupLabel);
        item.appendChild(squareCount);
        legendGrid.appendChild(item);
    });
    
    legend.appendChild(legendGrid);
    ticketDiv.appendChild(legend);

    return ticketDiv;
}

function createTicket(group) {
    const ticketDiv = document.createElement('div');
    ticketDiv.className = 'card';
    ticketDiv.style.pageBreakAfter = 'always';

    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '20px';
    header.innerHTML = `
        <h2 style="color: ${group.color};">${group.groupName}</h2>
        <p style="color: #666;">${team1Name} vs ${team2Name}</p>
        <p style="color: #666; font-weight: bold;">${group.squares.length} Squares</p>
    `;
    ticketDiv.appendChild(header);

    // Create grid
    const gridDiv = document.createElement('div');
    gridDiv.className = 'grid-preview';
    
    // Add team name label above grid
    const teamLabelTop = document.createElement('div');
    teamLabelTop.style.textAlign = 'center';
    teamLabelTop.style.fontWeight = 'bold';
    teamLabelTop.style.marginBottom = '2px';
    teamLabelTop.style.color = '#333';
    teamLabelTop.textContent = team1Name;
    gridDiv.appendChild(teamLabelTop);
    
    const table = document.createElement('table');
    table.className = 'grid-table';

    // Header row with team name
    const headerRow = document.createElement('tr');
    
    // Corner cell
    const cornerCell = document.createElement('td');
    cornerCell.className = 'corner';
    headerRow.appendChild(cornerCell);

    // Team 1 header (columns)
    for (let i = 0; i < 10; i++) {
        const cell = document.createElement('td');
        cell.className = 'header';
        cell.textContent = team1Numbers.length > 0 ? team1Numbers[i] : '';
        headerRow.appendChild(cell);
    }
    table.appendChild(headerRow);

    // Grid rows
    for (let row = 0; row < 10; row++) {
        const tr = document.createElement('tr');

        // Team 2 number (row header)
        const rowHeader = document.createElement('td');
        rowHeader.className = 'header';
        rowHeader.textContent = team2Numbers.length > 0 ? team2Numbers[row] : '';
        tr.appendChild(rowHeader);

        // Grid cells
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('td');
            
            // Check if this square belongs to this group
            const belongsToGroup = group.squares.some(s => s.row === row && s.col === col);
            
            if (belongsToGroup) {
                cell.style.backgroundColor = group.color;
                cell.style.color = 'white';
                cell.textContent = `G${group.groupNumber}`;
            } else {
                // Leave blank for other groups' squares
                cell.style.backgroundColor = 'white';
            }

            tr.appendChild(cell);
        }

        table.appendChild(tr);
    }

    // Add team name label on the left side
    const teamLabelLeft = document.createElement('div');
    teamLabelLeft.style.position = 'absolute';
    teamLabelLeft.style.left = '-5px';
    teamLabelLeft.style.top = '50%';
    teamLabelLeft.style.transform = 'rotate(-90deg) translateY(-50%)';
    teamLabelLeft.style.transformOrigin = 'center center';
    teamLabelLeft.style.fontWeight = 'bold';
    teamLabelLeft.style.color = '#333';
    teamLabelLeft.style.whiteSpace = 'nowrap';
    teamLabelLeft.style.fontSize = '14px';
    teamLabelLeft.textContent = team2Name;
    
    const gridWrapper = document.createElement('div');
    gridWrapper.style.position = 'relative';
    gridWrapper.style.paddingLeft = '80px';
    gridWrapper.style.margin = '0 auto';
    gridWrapper.style.display = 'table';
    gridWrapper.appendChild(teamLabelLeft);
    gridWrapper.appendChild(table);
    
    gridDiv.appendChild(gridWrapper);
    ticketDiv.appendChild(gridDiv);

    // Add square count info
    const squareInfo = document.createElement('div');
    squareInfo.style.marginTop = '20px';
    squareInfo.style.textAlign = 'center';
    squareInfo.style.padding = '15px';
    squareInfo.style.background = '#f8f9fa';
    squareInfo.style.borderRadius = '8px';
    squareInfo.innerHTML = `
        <p style="font-size: 18px; font-weight: bold; color: #333;">
            You have <span style="color: ${group.color};">${group.squares.length} squares</span> in this grid
        </p>
        <p style="font-size: 14px; color: #666; margin-top: 5px;">
            Numbers will be randomly assigned on game day
        </p>
    `;
    ticketDiv.appendChild(squareInfo);

    return ticketDiv;
}

function downloadMasterCSV() {
    let csv = 'Football Squares Master Grid\n\n';
    csv += `${team1Name} vs ${team2Name}\n`;
    csv += 'Numbers will be assigned on game day\n\n';
    
    // Header row with team name
    csv += `${team1Name},`;
    for (let i = 0; i < 10; i++) {
        csv += ',';
    }
    csv += '\n';
    
    // Second header row (blank for numbers)
    csv += `${team2Name},`;
    for (let i = 0; i < 10; i++) {
        csv += ',';
    }
    csv += '\n';

    // Grid rows
    for (let row = 0; row < 10; row++) {
        csv += ','; // Blank for team2 numbers
        for (let col = 0; col < 10; col++) {
            const groupNum = masterGrid[row][col];
            const group = groupGrids[groupNum - 1];
            csv += `${group.groupName},`;
        }
        csv += '\n';
    }

    csv += '\n\nGroup Assignments:\n';
    csv += 'Group,Name,Squares,Percentage\n';
    groupGrids.forEach(group => {
        csv += `G${group.groupNumber},${group.groupName},${group.squares.length},${(group.squares.length)}%\n`;
    });

    downloadCSV(csv, 'football-squares-master.csv');
}

function downloadAllCSVs() {
    // For simplicity, we'll download individual CSVs
    // In a real app, you'd use JSZip library to create a ZIP
    
    groupGrids.forEach(group => {
        let csv = `${group.groupName} Ticket\n`;
        csv += `${team1Name} vs ${team2Name}\n`;
        csv += 'Numbers will be assigned on game day\n\n';
        
        // Header row with team name
        csv += `${team1Name},`;
        for (let i = 0; i < 10; i++) {
            csv += ',';
        }
        csv += '\n';
        
        // Second header row (blank)
        csv += `${team2Name},`;
        for (let i = 0; i < 10; i++) {
            csv += ',';
        }
        csv += '\n';

        // Grid rows
        for (let row = 0; row < 10; row++) {
            csv += ','; // Blank for team2 numbers
            for (let col = 0; col < 10; col++) {
                const belongsToGroup = group.squares.some(s => s.row === row && s.col === col);
                csv += belongsToGroup ? `G${group.groupNumber},` : ',';
            }
            csv += '\n';
        }

        csv += `\n\nYou have ${group.squares.length} squares in this grid\n`;
        csv += 'Your squares are marked with G' + group.groupNumber + '\n';

        // Sanitize filename
        const sanitizedName = group.groupName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        downloadCSV(csv, `football-squares-${sanitizedName}.csv`);
    });

    alert(`Downloaded ${numGroups} group CSV files!`);
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function printAllTickets() {
    window.print();
}

function viewMasterGrid() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        overflow: auto;
        padding: 20px;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
    `;

    content.innerHTML = `
        <h2 style="text-align: center; margin-bottom: 10px;">Master Grid</h2>
        <p style="text-align: center; color: #666; margin-bottom: 5px;">${team1Name} vs ${team2Name}</p>
        <p style="text-align: center; color: #999; font-size: 14px; margin-bottom: 20px;">Numbers will be assigned on game day</p>
    `;

    // Team name label above
    const teamLabelTop = document.createElement('div');
    teamLabelTop.style.textAlign = 'center';
    teamLabelTop.style.fontWeight = 'bold';
    teamLabelTop.style.marginBottom = '2px';
    teamLabelTop.textContent = team1Name;
    content.appendChild(teamLabelTop);

    const gridWrapper = document.createElement('div');
    gridWrapper.style.position = 'relative';
    gridWrapper.style.paddingLeft = '80px';
    gridWrapper.style.display = 'inline-block';

    // Team name label on left
    const teamLabelLeft = document.createElement('div');
    teamLabelLeft.style.position = 'absolute';
    teamLabelLeft.style.left = '-5px';
    teamLabelLeft.style.top = '50%';
    teamLabelLeft.style.transform = 'rotate(-90deg) translateY(-50%)';
    teamLabelLeft.style.transformOrigin = 'center center';
    teamLabelLeft.style.fontWeight = 'bold';
    teamLabelLeft.style.whiteSpace = 'nowrap';
    teamLabelLeft.style.fontSize = '14px';
    teamLabelLeft.textContent = team2Name;
    gridWrapper.appendChild(teamLabelLeft);

    const table = document.createElement('table');
    table.className = 'grid-table';

    // Header row (blank)
    const headerRow = document.createElement('tr');
    const cornerCell = document.createElement('td');
    cornerCell.className = 'corner';
    headerRow.appendChild(cornerCell);

    for (let i = 0; i < 10; i++) {
        const cell = document.createElement('td');
        cell.className = 'header';
        cell.textContent = ''; // Blank for game day
        headerRow.appendChild(cell);
    }
    table.appendChild(headerRow);

    // Grid rows
    for (let row = 0; row < 10; row++) {
        const tr = document.createElement('tr');

        const rowHeader = document.createElement('td');
        rowHeader.className = 'header';
        rowHeader.textContent = ''; // Blank for game day
        tr.appendChild(rowHeader);

        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('td');
            const groupNum = masterGrid[row][col];
            const group = groupGrids[groupNum - 1];
            
            cell.style.backgroundColor = group.color;
            cell.style.color = 'white';
            cell.textContent = group.groupName;
            cell.style.fontSize = '10px';
            cell.style.padding = '2px';
            cell.style.lineHeight = '1.2';
            cell.style.overflow = 'hidden';
            cell.style.textOverflow = 'ellipsis';
            cell.style.whiteSpace = 'nowrap';

            tr.appendChild(cell);
        }

        table.appendChild(tr);
    }

    gridWrapper.appendChild(table);
    content.appendChild(gridWrapper);

    // Add legend
    const legend = document.createElement('div');
    legend.style.marginTop = '20px';
    legend.innerHTML = '<h3 style="text-align: center; margin-bottom: 10px;">Groups</h3>';
    
    const legendGrid = document.createElement('div');
    legendGrid.style.display = 'grid';
    legendGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
    legendGrid.style.gap = '10px';
    
    groupGrids.forEach(group => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '8px';
        item.style.background = '#f8f9fa';
        item.style.borderRadius = '4px';
        
        const colorBox = document.createElement('div');
        colorBox.style.width = '30px';
        colorBox.style.height = '30px';
        colorBox.style.backgroundColor = group.color;
        colorBox.style.borderRadius = '4px';
        colorBox.style.marginRight = '10px';
        
        const text = document.createElement('span');
        text.textContent = `G${group.groupNumber}: ${group.groupName} (${group.squares.length} squares)`;
        
        item.appendChild(colorBox);
        item.appendChild(text);
        legendGrid.appendChild(item);
    });
    
    legend.appendChild(legendGrid);
    content.appendChild(legend);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'btn btn-secondary';
    closeBtn.style.display = 'block';
    closeBtn.style.margin = '20px auto 0';
    closeBtn.onclick = () => modal.remove();
    content.appendChild(closeBtn);

    modal.appendChild(content);
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
}

function reset() {
    document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('tickets-container').innerHTML = '';
    masterGrid = null;
    groupGrids = [];
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
