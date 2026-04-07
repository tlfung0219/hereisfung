# Football Squares Ticket Generator

Generate pre-assigned football squares tickets for groups. Perfect for selling or distributing squares to friends!

## What It Does

This tool generates a master football squares grid and divides it into **X groups** with randomly assigned squares. Each group gets a printable ticket showing:
- Their assigned squares on the full grid
- A list of their square coordinates
- Team names and numbers (0-9) for both teams

## Features

- **Random Assignment** - Squares are randomly distributed to groups
- **Master Grid** - See all groups on one grid with color coding
- **Printable Tickets** - Each group gets a professional ticket
- **CSV Export** - Download master grid and individual group CSVs
- **Fair Distribution** - Automatically divides 100 squares evenly
- **Color Coded** - Each group has a unique color

## How to Use

### 1. Open the Generator
```bash
cd football-squares-generator
open generator.html
```

Or just double-click `generator.html`

### 2. Enter Details
- **Team 1 Name**: Home team (e.g., "Chiefs")
- **Team 2 Name**: Away team (e.g., "49ers")
- **Number of Groups**: How many tickets to create (e.g., 2 = 50 squares each)

### 3. Generate
Click **"Generate Grids"** and the tool will:
- Randomly assign numbers 0-9 to both teams
- Randomly distribute all 100 squares to groups
- Create printable tickets for each group

### 4. Export & Share

**Option 1: Print Tickets**
- Click **"🖨️ Print All Tickets"**
- Each group gets their own page
- Share physical tickets with friends

**Option 2: Download CSVs**
- **Master CSV**: Shows all groups on one grid
- **Individual CSVs**: One file per group with their squares

**Option 3: View Master Grid**
- Click **"👁️ View Master Grid"**
- See all groups color-coded on one grid

## Example Use Cases

### Example 1: Split with a Friend (2 Groups)
- You and a friend each get 50 squares
- Generate 2 groups
- Each person gets a ticket showing their 50 squares

### Example 2: Office Pool (10 Groups)
- 10 coworkers each get 10 squares
- Generate 10 groups
- Print and distribute tickets

### Example 3: Fundraiser (20 Groups)
- Sell 20 tickets with 5 squares each
- Generate 20 groups
- Each ticket buyer gets their squares

## Output Format

### Master CSV
```csv
Football Squares Master Grid

Chiefs vs 49ers

,3,7,1,9,0,5,2,8,4,6
2,G1,G2,G1,G2,G1,G2,G1,G2,G1,G2
5,G2,G1,G2,G1,G2,G1,G2,G1,G2,G1
...

Group Assignments:
Group,Squares,Percentage
Group 1,50,50%
Group 2,50,50%
```

### Individual Group CSV
```csv
Group 1 Ticket
Chiefs vs 49ers

,3,7,1,9,0,5,2,8,4,6
2,G1,,G1,,G1,,G1,,G1,
5,,G1,,G1,,G1,,G1,,G1
...

Your Squares:
Chiefs,49ers
3,2
1,2
0,2
...
```

## Printable Tickets

Each ticket includes:
- **Group Number** with unique color
- **Full Grid** showing all 100 squares (your squares highlighted)
- **Your Squares List** with team number combinations
- **Team Names** and assigned numbers

Perfect for:
- Printing and handing out
- Emailing as PDF
- Sharing on social media

## How It Works

1. **Initialize**: Creates a 10×10 grid (100 squares)
2. **Random Numbers**: Assigns 0-9 randomly to each team
3. **Shuffle Squares**: Randomizes all 100 square positions
4. **Distribute**: Divides squares evenly among groups
   - Example: 100 squares ÷ 2 groups = 50 each
   - Example: 100 squares ÷ 3 groups = 33, 33, 34
5. **Generate**: Creates master grid and individual tickets

## Technical Details

- **Pure JavaScript** - No dependencies needed
- **Client-Side Only** - Everything runs in your browser
- **No Server Required** - Just open the HTML file
- **Print Optimized** - CSS designed for clean printing
- **Responsive** - Works on desktop and mobile

## Files

- `generator.html` - Main application
- `generator.js` - Grid generation logic
- `README.md` - This file

## Randomization

- Uses Fisher-Yates shuffle algorithm
- Cryptographically secure random (Math.random)
- Each generation is completely unique
- Fair distribution guaranteed

## Advanced Tips

### Custom Colors
Edit the `groupColors` array in `generator.js` to use your own colors:
```javascript
const groupColors = [
    '#FF6B6B',  // Red
    '#4ECDC4',  // Teal
    '#45B7D1',  // Blue
    // Add more colors...
];
```

### More Groups
The generator supports up to 100 groups (1 square each)!

### Save Your Setup
Bookmark the page after generating to keep your grids

## Enjoy!

Generate your tickets and have fun with your football squares!
