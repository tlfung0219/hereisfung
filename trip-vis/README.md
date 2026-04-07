# Trip Activity Visualizer

A web-based application that visualizes trip activities in a GitHub-style activity grid. Upload your trip data as CSV files or explore pre-built examples to see activity patterns over time.

## Features

- **GitHub-style Activity Grid**: Visualize activities across 24 hours for each day of your trip
- **CSV Upload**: Upload your own trip data in CSV format (Date, Time, Activity columns)
- **Pre-built Examples**: Load and explore sample trips (Disneyland, Hawaii, Italy, Mexico, Redding, Utah)
- **Interactive Tooltips**: Hover over grid cells to see detailed activity information
- **Trip Statistics**: View comprehensive stats including total activities, busiest days/hours, and averages
- **Download Examples**: Download CSV templates to understand the expected format
- **No Server Required**: Works entirely offline once loaded (examples are embedded)

## Quick Start

1. **Download the project** or clone this repository
2. **Open `trip-visualizer.html`** in your web browser
3. **Choose an option**:
   - Upload your own CSV file with trip data
   - Select from pre-built examples in the dropdown
   - Download example CSV files to see the format

## CSV Format

Your CSV file should have these columns:
```csv
date,time,activity
2023-12-25,14:30,Christmas shopping
2023-12-25,16:00,Family dinner
2023-12-26,09:00,Beach walk
```

### Requirements
- **Date**: Any date format (YYYY-MM-DD recommended)
- **Time**: 12-hour (e.g., "2:30 PM") or 24-hour (e.g., "14:30") format
- **Activity**: Free text description of the activity

## File Structure

```
trip-summary/
├── trip-visualizer.html    # Main web application
├── style.css              # CSS styling (GitHub-inspired theme)
├── script.js              # JavaScript functionality
├── global_vars.js         # Embedded example data (auto-generated)
├── convert_csv_to_json.py # Python script to convert CSV to JSON
├── generated_csv/         # Original example CSV files
│   ├── disneyland_trip.csv
│   ├── hawaii_trip.csv
│   ├── italy_trip.csv
│   ├── mexico_trip.csv
│   ├── redding_trip.csv
│   └── utah_trip.csv
└── generated_json/        # Converted JSON files (auto-generated)
    ├── disneyland_trip.json
    ├── hawaii_trip.json
    ├── italy_trip.json
    ├── mexico_trip.json
    ├── redding_trip.json
    └── utah_trip.json
```

## Adding New Examples

1. **Create your CSV file** in `generated_csv/` following the format above
2. **Run the converter**:
   ```bash
   python3 convert_csv_to_json.py
   ```
3. **Update the HTML dropdown** in `trip-visualizer.html`:
   ```html
   <option value="your_trip">Your Trip Name</option>
   ```
4. **Refresh the page** - your new example will be available

## How It Works

### Activity Grid and Statistics
- Each row represents a day of the trip
- Each cell represents an hour (0-23)
- Cell color intensity indicates activity level:
  - Gray: No activities
  - Light green: 1 activity
  - Medium green: 2 activities
  - Dark green: 3-4 activities
  - Bright green: 5+ activities
- The app calculates and displays:
  - Total number of activities
  - Trip duration in days
  - Average activities per day
  - Average active hours per day
  - Busiest day and hour
  - Total active hours
