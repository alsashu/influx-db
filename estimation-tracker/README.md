# Estimation Tracker - Progressive Web App

A modern, offline-capable Progressive Web App for tracking project estimations and actual hours. Built with vanilla JavaScript, IndexedDB, and Bootstrap.

## Features

### 📊 Two Data Sheets
- **Historic Data**: Track actual hours spent on completed requirements
- **Result Sheet**: Calculate estimations using a proven formula

### 🧮 Smart Estimation Formula
```
Estimated Hours = Requirements × 4 × Complexity Factor × Risk Factor × Competency Factor
```

**Factors:**
- **Complexity**: Low (1.0), Medium (1.5), High (2.0)
- **Risk**: Low (1.0), Medium (1.2), High (1.5)
- **Competency**: Expert (0.8), Intermediate (1.0), Beginner (1.2)

### 💾 Offline Capability
- Full offline functionality using Service Workers
- Data stored locally in IndexedDB
- Works without internet connection

### 📈 Analytics Dashboard
- Summary statistics for both historic and estimation data
- Accuracy analysis comparing estimates vs actuals
- Grouped analysis by complexity level

### 🎨 Modern UI
- Responsive design using Bootstrap 5
- Clean and intuitive interface
- Color-coded badges for easy identification
- Mobile-friendly

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Storage**: IndexedDB
- **UI Framework**: Bootstrap 5.3.2
- **Icons**: Bootstrap Icons 1.11.2
- **PWA**: Service Worker for offline support

## Installation

### Option 1: Local Development

1. Clone or download the project
```bash
cd estimation-tracker
```

2. Serve the application using any web server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

3. Open browser and navigate to:
```
http://localhost:8000
```

### Option 2: Install as PWA

1. Open the app in a modern browser (Chrome, Edge, Firefox, Safari)
2. Look for the "Install" icon in the address bar
3. Click "Install" to add the app to your device
4. Launch from your app drawer or home screen

## File Structure

```
estimation-tracker/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline support
├── css/
│   └── styles.css         # Custom styles
├── js/
│   ├── db.js              # IndexedDB database manager
│   ├── app.js             # Main application logic
│   └── service-worker-register.js
├── icons/
│   ├── icon-192x192.png   # App icon (192x192)
│   └── icon-512x512.png   # App icon (512x512)
└── README.md              # This file
```

## Usage Guide

### Adding Historic Data

1. Go to the **Historic Data** tab
2. Click **"Add Entry"** button
3. Fill in the form:
   - Complexity: Low/Medium/High
   - Risk: Low/Medium/High
   - Number of Requirements: Integer value
   - Competency Level: Beginner/Intermediate/Expert
   - Actual Hours: Integer value (hours spent)
4. Click **"Save"**

### Creating Estimations

1. Go to the **Result** tab
2. Click **"Add Estimation"** button
3. Fill in the form:
   - Complexity: Low/Medium/High
   - Risk: Low/Medium/High
   - Number of Requirements: Integer value
   - Competency Level: Beginner/Intermediate/Expert
4. The **Estimated Hours** will be calculated automatically
5. Click **"Save"**

### Viewing Analytics

1. Go to the **Analytics** tab
2. View summary statistics including:
   - Total historic entries
   - Total estimations
   - Total actual hours
   - Total estimated hours
   - Average hours
3. View accuracy analysis comparing estimates vs actuals by complexity

### Data Management

- **Edit**: Click the pencil icon on any row to edit
- **Delete**: Click the trash icon on any row to delete
- **Clear All**: Use the "Clear All" button to remove all entries (confirmation required)

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Offline Features

The app works completely offline after the first visit:
- All data stored locally
- No server required
- Automatic updates when online
- Status indicator shows online/offline state

## Data Privacy

- All data is stored locally in your browser
- No data is sent to any server
- Data persists until you clear browser data
- Export/Import features coming soon

## Future Enhancements

- [ ] Data export to Excel/CSV
- [ ] Data import from Excel/CSV
- [ ] Advanced charts and visualizations
- [ ] Historical trend analysis
- [ ] Custom estimation formulas
- [ ] Team collaboration features
- [ ] Backup and restore functionality

## Development

### Prerequisites
- Modern web browser with developer tools
- Basic web server (Python, Node.js, or PHP)
- Text editor or IDE

### Making Changes

1. Edit files in your preferred editor
2. Refresh browser to see changes
3. Check browser console for any errors
4. Test offline functionality by toggling network in DevTools

### Testing PWA Features

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Check:
   - Service Workers status
   - IndexedDB data
   - Cache Storage
   - Manifest

## Troubleshooting

### App not installing as PWA
- Ensure you're using HTTPS or localhost
- Check manifest.json is accessible
- Verify service worker is registered
- Clear browser cache and try again

### Data not persisting
- Check if IndexedDB is enabled in browser
- Ensure you're not in Private/Incognito mode
- Check browser storage quota

### Offline mode not working
- Verify service worker is registered
- Check network tab in DevTools
- Clear service worker and re-register

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are loaded correctly
3. Test in different browser
4. Clear cache and reload

## Version History

### v1.0.0 (Current)
- Initial release
- Historic data tracking
- Estimation calculator
- Analytics dashboard
- Offline support
- PWA features

---

**Built with ❤️ for efficient project estimation tracking**
