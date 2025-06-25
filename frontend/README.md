# Gotify Frontend - Modern Music Streaming Interface

A beautiful, modern React frontend for the Gotify music streaming platform built with cutting-edge technologies.

## 🚀 Features

### 🎵 Music Experience
- **Immersive Dashboard** - Beautiful hero section with gradient backgrounds and animations
- **Advanced Music Player** - Full-featured player with volume control, seeking, and playback controls
- **Smart Search** - Real-time search with instant results and beautiful result cards
- **Library Management** - Grid and list views with filtering and sorting options
- **Artist Management** - Comprehensive artist profiles with song collections

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Stunning glass-like effects with backdrop blur
- **Responsive Layout** - Perfect experience on desktop, tablet, and mobile
- **Smooth Animations** - Fluid transitions and micro-interactions
- **Dark Mode Ready** - Beautiful color schemes with gradient accents
- **Accessibility** - WCAG compliant with keyboard navigation support

### ⚡ Performance
- **Lightning Fast** - Built with Vite for instant hot reloading
- **Code Splitting** - Automatic route-based code splitting
- **Optimized Assets** - Compressed images and efficient bundling
- **Progressive Loading** - Skeleton screens and loading states

## 🛠️ Tech Stack

### Core Framework
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **TanStack Router** - File-based routing with type safety
- **Vite** - Next-generation build tool

### Styling & UI
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Custom Animations** - Smooth CSS animations and transitions
- **Responsive Design** - Mobile-first approach

### Data Management
- **Axios** - HTTP client for API calls
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation

### Development Tools
- **Vitest** - Fast unit testing
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Go backend server running on port 8080

### Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/         # Reusable components
│   │   └── MusicPlayer.tsx
│   ├── routes/            # File-based routing
│   │   ├── __root.tsx     # Root layout
│   │   ├── index.tsx      # Dashboard
│   │   ├── songs.tsx      # Songs library
│   │   ├── users.tsx      # Artist management
│   │   └── songs/
│   │       └── create.tsx # Add new song
│   ├── services/          # API services
│   │   └── api.ts
│   ├── styles.css         # Global styles
│   └── main.tsx          # App entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎵 Key Features

### Dashboard
- **Hero Section** - Welcome message with animated gradients
- **Statistics Cards** - Real-time music library stats
- **Quick Search** - Instant song search with results
- **Recent Songs** - Beautiful cards showing latest additions
- **Quick Actions** - Easy access to common tasks

### Songs Library
- **Dual View Modes** - Grid and list views
- **Advanced Filtering** - Search by title, filter by artist
- **Music Player Integration** - Inline play controls
- **Like System** - Heart songs to create favorites
- **Responsive Design** - Perfect on all screen sizes

### Artist Management
- **Artist Profiles** - Detailed artist information
- **Song Collections** - View all songs by artist
- **Create Artists** - Add new artists with forms
- **Search & Filter** - Find artists quickly

### Music Player
- **Full Controls** - Play, pause, seek, volume control
- **Beautiful UI** - Gradient designs with animations
- **Progress Tracking** - Visual progress bars
- **Responsive** - Works on all devices

## 🎨 Design System

### Colors
- **Primary**: Indigo to Purple gradients
- **Success**: Green accents
- **Warning**: Orange/Yellow accents
- **Error**: Red accents
- **Neutral**: Gray scale

### Typography
- **Font**: Inter - Modern, readable typeface
- **Scale**: Responsive type scale
- **Weight**: 300-800 font weights

### Spacing
- **Base Unit**: 4px (0.25rem)
- **Scale**: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64

### Animations
- **Duration**: 200ms for micro-interactions, 300ms for transitions
- **Easing**: Custom cubic-bezier functions
- **Hover Effects**: Scale, color, and shadow transitions

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 0-767px
- **Tablet**: 768-1023px
- **Desktop**: 1024px+

### Mobile Features
- **Bottom Navigation** - Easy thumb navigation
- **Touch Gestures** - Swipe and tap interactions
- **Optimized Layouts** - Single-column layouts
- **Large Touch Targets** - 44px minimum

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Gotify
```

### Vite Configuration
The `vite.config.ts` includes:
- React plugin
- TypeScript support
- TailwindCSS
- TanStack Router
- Path aliases

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Test coverage:
```bash
npm run test:coverage
```

## 🚀 Deployment

### Build Optimization
- **Tree Shaking** - Remove unused code
- **Code Splitting** - Route-based chunks
- **Asset Optimization** - Compressed images and fonts
- **Caching** - Long-term asset caching

### Deployment Options
- **Vercel** - Zero-config deployment
- **Netlify** - JAMstack deployment
- **AWS S3** - Static site hosting
- **Docker** - Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **TanStack** - For the amazing router
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icons
- **Vite** - For the lightning-fast build tool

---

**Built with ❤️ for music lovers everywhere** 🎵
