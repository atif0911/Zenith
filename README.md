# AI-Driven Web3 Crypto Trading Platform

A full-stack web application for crypto trading with AI-driven predictions, built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication (signup, login, protected routes)
- Personalized cryptocurrency watchlist management
- AI-generated predictions for crypto assets
- Interactive dashboard with real-time updates
- Responsive design across all devices

## Tech Stack

### Frontend
- React.js (Functional components with hooks)
- React Router DOM for page navigation
- Chart.js for data visualization
- Context API for state management

### Backend
- Node.js with Express.js
- RESTful API architecture
- JWT authentication
- MongoDB for data storage
- Mongoose ODM

## Project Structure

```
root/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # React source files
│       ├── components/     # Reusable components
│       ├── context/        # Context providers
│       └── pages/          # Page components
│
├── config/                 # Config files
├── middleware/             # Express middleware
├── models/                 # Mongoose models
├── routes/                 # API routes
│   └── api/                # API endpoints
└── server.js               # Express server
```

## Getting Started

### Prerequisites
- Node.js 
- MongoDB

### Installation

1. Clone the repository
```
git clone <repository-url>
```

2. Install server dependencies
```
npm install
```

3. Install client dependencies
```
cd client
npm install
```

4. Create a `default.json` file in the `config` folder with the following:
```
{
  "mongoURI": "your_mongodb_connection_string",
  "jwtSecret": "your_secret_key"
}
```

### Running the application

To run both the server and client concurrently:
```
npm run dev
```

To run only the server:
```
npm run server
```

To run only the client:
```
npm run client
```

## API Endpoints

### Auth Routes
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate user and get token
- `GET /api/auth` - Get user data (protected)

### Watchlist Routes
- `GET /api/watchlist` - Get user's watchlist (protected)
- `POST /api/watchlist` - Add new coin to watchlist (protected)
- `DELETE /api/watchlist/:id` - Remove coin from watchlist (protected)

### Prediction Routes
- `GET /api/predictions/:coin` - Get prediction for specific coin (protected)
- `GET /api/predictions` - Get predictions for all coins in watchlist (protected)

## Future Enhancements
- Real-time WebSocket updates for price changes
- Integration with real trading APIs
- Enhanced AI prediction models
- Mobile application version 