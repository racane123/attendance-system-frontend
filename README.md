# Attendance Checker Frontend

A modern React-based frontend for the Attendance Checker system with QR code scanning capabilities.

## Features

- 🎯 **Dashboard** - Overview with statistics and quick actions
- 👥 **Student Management** - Add, edit, delete students with QR code generation
- 📚 **Subject Management** - Manage course subjects and descriptions
- 📱 **QR Scanner** - Real-time QR code scanning for attendance
- 📊 **Attendance Records** - View and manage daily attendance
- 📈 **Reports** - Generate attendance analytics and reports

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API communication
- **React Toastify** - Toast notifications
- **Lucide React** - Beautiful icons
- **QRCode** - QR code generation library

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Navbar.js          # Navigation component
│   ├── pages/
│   │   ├── Dashboard.js       # Main dashboard
│   │   ├── Students.js        # Student management
│   │   ├── Subjects.js        # Subject management
│   │   ├── Scanner.js         # QR code scanner
│   │   ├── Attendance.js      # Attendance records
│   │   └── Reports.js         # Analytics and reports
│   ├── services/
│   │   └── api.js            # API service layer
│   ├── App.js                # Main app component
│   ├── index.js              # React entry point
│   └── index.css             # Global styles
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## API Integration

The frontend communicates with the backend through the API service layer:

- **Students API** - CRUD operations for student management
- **Subjects API** - CRUD operations for subject management
- **Scanner API** - QR scanning and session management
- **Health API** - Server health checks

## Key Features

### Dashboard
- Real-time statistics (students, subjects, active sessions)
- Quick action buttons
- Active session management

### Student Management
- Add new students with first, middle, and last names
- Generate unique QR codes for each student
- View and download QR codes
- Search and filter students

### QR Scanner
- Start/stop scanning sessions
- Manual QR code input for testing
- Real-time attendance recording
- Session management

### Attendance Records
- View daily attendance by subject
- Update attendance status (present/absent/late)
- Export attendance data to CSV
- Search and filter records

### Reports
- Attendance analytics over date ranges
- Visual attendance trends
- Export detailed reports
- Average attendance calculations

## Styling

The application uses Tailwind CSS with custom components:

- **Cards** - `.card` class for consistent card styling
- **Buttons** - `.btn`, `.btn-primary`, `.btn-secondary`, etc.
- **Inputs** - `.input` class for form inputs
- **Labels** - `.label` class for form labels

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Proxy Configuration

The app is configured to proxy API requests to the backend:

```json
{
  "proxy": "http://localhost:5000"
}
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## QR Code Scanning

The scanner supports:
- Camera-based QR code scanning (requires HTTPS in production)
- Manual QR code input for testing
- Real-time feedback on scan results

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify/Vercel

1. Build the project
2. Deploy the `build` folder
3. Set environment variables in your hosting platform

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend server is running on port 5000
   - Check CORS configuration in backend

2. **QR Scanner Not Working**
   - Ensure HTTPS in production (camera access requirement)
   - Check browser permissions for camera access

3. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check for version conflicts in package.json

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Attendance Checker system. 