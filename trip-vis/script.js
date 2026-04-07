let currentTripData = null;

// Initialize the page
function init() {
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('csvFile').addEventListener('change', handleFileUpload);
    document.getElementById('loadExample').addEventListener('click', loadExample);
    document.getElementById('downloadExample').addEventListener('click', downloadExample);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        hideVisualization();
        return;
    }

    // Update upload text to show selected file name
    document.getElementById('uploadText').textContent = file.name;

    // Read the file
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvData = e.target.result;
            currentTripData = parseCSVData(csvData);
            displayVisualization();
        } catch (error) {
            console.error('Error parsing CSV data:', error);
            alert('Error parsing CSV file. Please make sure it has the correct format (Date, Time, Activity).');
        }
    };
    reader.readAsText(file);
}

function parseCSVData(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    const activities = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 3) {
            activities.push({
                date: values[0],
                time: values[1],
                activity: values.slice(2).join(',').replace(/"/g, '')
            });
        }
    }

    return processActivities(activities);
}

function parseJSONData(jsonData) {
    if (!Array.isArray(jsonData)) {
        throw new Error('Example JSON must be an array of records.');
    }

    const activities = jsonData.map(record => ({
        date: String(record.date || '').trim(),
        time: String(record.time || '').trim(),
        activity: String(record.activity || '').trim()
    }));

    return processActivities(activities);
}

function parseTime(timeStr) {
    // Handle both 12-hour and 24-hour formats
    if (timeStr.includes(':')) {
        const [time, period] = timeStr.split(/\s+/);
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period && period.toLowerCase() === 'pm' && hours !== 12) {
            hours += 12;
        } else if (period && period.toLowerCase() === 'am' && hours === 12) {
            hours = 0;
        }
        
        return { hours, minutes };
    }
    return { hours: 0, minutes: 0 };
}

function processActivities(activities) {
    const activityMap = new Map();
    const dates = new Set();
    
    activities.forEach(activity => {
        const date = activity.date;
        const { hours } = parseTime(activity.time);
        const key = `${date}-${hours}`;
        
        dates.add(date);
        
        if (!activityMap.has(key)) {
            activityMap.set(key, {
                date,
                hour: hours,
                count: 0,
                activities: []
            });
        }
        
        const entry = activityMap.get(key);
        entry.count++;
        entry.activities.push(activity.activity);
    });

    const sortedDates = Array.from(dates).sort();
    return {
        activities: activityMap,
        dates: sortedDates,
        totalActivities: activities.length
    };
}

function displayVisualization() {
    if (!currentTripData) return;

    showVisualization();
    updateTripInfo();
    createActivityGrid();
    updateStats();
}

function showVisualization() {
    document.getElementById('tripInfo').style.display = 'block';
    document.getElementById('visualizationContainer').style.display = 'block';
    document.getElementById('stats').style.display = 'grid';
}

function hideVisualization() {
    document.getElementById('tripInfo').style.display = 'none';
    document.getElementById('visualizationContainer').style.display = 'none';
    document.getElementById('stats').style.display = 'none';
}

function updateTripInfo() {
    const { dates, totalActivities } = currentTripData;
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    const duration = dates.length;

    document.getElementById('tripInfo').innerHTML = 
        `${totalActivities} activities from ${startDate} to ${endDate} (${duration} days)`;
}

function createActivityGrid() {
    const grid = document.getElementById('activityGrid');
    
    grid.innerHTML = '';

    // Set CSS custom property for number of days
    document.documentElement.style.setProperty('--day-count', currentTripData.dates.length);

    // Create day rows
    currentTripData.dates.forEach(date => {
        const dayRow = document.createElement('div');
        dayRow.className = 'day-row';

        // Day label
        const dayLabel = document.createElement('div');
        dayLabel.className = 'day-label';
        dayLabel.textContent = new Date(date).toLocaleDateString('en', { 
            month: 'short', 
            day: 'numeric' 
        });
        dayRow.appendChild(dayLabel);

        // Hour cells for this day
        for (let hour = 0; hour < 24; hour++) {
            const key = `${date}-${hour}`;
            const activityData = currentTripData.activities.get(key);
            
            const cell = document.createElement('div');
            cell.className = 'hour-cell';
            
            if (activityData) {
                const level = getActivityLevel(activityData.count);
                cell.classList.add(`level-${level}`);
                cell.dataset.count = activityData.count;
                cell.dataset.activities = JSON.stringify(activityData.activities);
            } else {
                cell.classList.add('level-0');
                cell.dataset.count = 0;
                cell.dataset.activities = '[]';
            }
            
            cell.dataset.date = date;
            cell.dataset.hour = hour;
            
            cell.addEventListener('mouseenter', showTooltip);
            cell.addEventListener('mouseleave', hideTooltip);
            
            dayRow.appendChild(cell);
        }

        grid.appendChild(dayRow);
    });
}

function getActivityLevel(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 2) return 2;
    if (count <= 4) return 3;
    return 4;
}

function showTooltip(event) {
    const cell = event.target;
    const tooltip = document.getElementById('tooltip');
    const count = parseInt(cell.dataset.count);
    const date = cell.dataset.date;
    const hour = cell.dataset.hour;
    const activities = JSON.parse(cell.dataset.activities);

    let content = `${date} ${hour}:00<br>`;
    if (count === 0) {
        content += 'No activities';
    } else {
        content += `${count} ${count === 1 ? 'activity' : 'activities'}`;
        if (activities.length > 0) {
            content += '<br><br>';
            content += activities.slice(0, 3).map(activity => 
                `• ${activity.length > 30 ? activity.substring(0, 30) + '...' : activity}`
            ).join('<br>');
            if (activities.length > 3) {
                content += `<br>...and ${activities.length - 3} more`;
            }
        }
    }

    tooltip.innerHTML = content;
    tooltip.classList.add('show');

    // Position tooltip
    const rect = cell.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
}

function hideTooltip() {
    document.getElementById('tooltip').classList.remove('show');
}

function updateStats() {
    const { activities, dates, totalActivities } = currentTripData;
    
    // Calculate stats
    const activeDays = dates.length;
    const activeHours = activities.size;
    const avgActivitiesPerDay = (totalActivities / activeDays).toFixed(1);
    const avgActiveHoursPerDay = (activeHours / activeDays).toFixed(1);
    
    // Find busiest day
    const dailyActivities = new Map();
    activities.forEach((data, key) => {
        const date = data.date;
        dailyActivities.set(date, (dailyActivities.get(date) || 0) + data.count);
    });
    
    const busiestDay = Array.from(dailyActivities.entries())
        .sort((a, b) => b[1] - a[1])[0];

    // Find busiest hour
    const hourlyActivities = new Map();
    activities.forEach((data) => {
        const hour = data.hour;
        hourlyActivities.set(hour, (hourlyActivities.get(hour) || 0) + data.count);
    });
    
    const busiestHour = Array.from(hourlyActivities.entries())
        .sort((a, b) => b[1] - a[1])[0];

    const statsContainer = document.getElementById('stats');
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-title">Total Activities</div>
            <div class="stat-value">${totalActivities}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Trip Duration</div>
            <div class="stat-value">${activeDays} days</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Avg Activities/Day</div>
            <div class="stat-value">${avgActivitiesPerDay}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Active Hours/Day</div>
            <div class="stat-value">${avgActiveHoursPerDay}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Busiest Day</div>
            <div class="stat-value">${new Date(busiestDay[0]).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
            <div class="stat-title">${busiestDay[1]} activities</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Busiest Hour</div>
            <div class="stat-value">${busiestHour[0]}:00</div>
            <div class="stat-title">${busiestHour[1]} activities</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Total Active Hours</div>
            <div class="stat-value">${activeHours}</div>
        </div>
    `;
}

// Load example function
function loadExample() {
    const select = document.getElementById('exampleSelect');
    const filename = select.value;
    if (!filename) {
        alert('Please select an example first.');
        return;
    }

    // console.log('Loading example:', examples);

    if (typeof examples === 'undefined') {
        alert('Example data is not loaded. Please make sure global_vars.js is included before script.js.');
        return;
    }

    const jsonData = examples[filename];
    if (!jsonData) {
        alert(`Example data not found for ${filename}.`);
        return;
    }

    currentTripData = parseJSONData(jsonData);
    displayVisualization();
    document.getElementById('uploadText').textContent = filename;
}

// Download example function
function downloadExample() {
    const select = document.getElementById('exampleSelect');
    const filename = select.value;
    if (!filename) {
        alert('Please select an example first.');
        return;
    }

    const link = document.createElement('a');
    link.href = `generated_csv/${filename}.csv`;
    link.download = `${filename}.csv`;
    link.click();
}

// Initialize when page loads
init();