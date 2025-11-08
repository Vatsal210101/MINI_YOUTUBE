# VideoTube - YouTube Clone

A full-stack video streaming platform built with **Node.js**, **Express**, **MongoDB**, and **React**.

## 🚀 Features

- **User Authentication** - JWT-based access & refresh tokens
- **Video Management** - Upload, publish, and manage videos with Cloudinary integration
- **Engagement System** - Like/dislike videos, comments, and tweets
- **Subscriptions** - Subscribe to channels and manage subscriptions
- **Playlists** - Create and organize video playlists
- **Dashboard** - Channel analytics and video management
- **Watch History** - Track and view watch history
- **Search & Filter** - Search videos with advanced filtering
- **Community Posts** - Tweet-like community features

## 🛠️ Tech Stack

### Backend
- **Node.js** v23.10.0
- **Express** v5.1.0
- **MongoDB** (MongoDB Atlas)
- **JWT** for authentication
- **Cloudinary** for media storage
- **Multer** for file uploads
- **bcrypt** for password hashing

### Frontend
- **React** 19.2.0
- **React Router** v7.9.5
- **Material-UI** v6.x
- **Axios** for API calls
- **Context API** for state management

## 📦 Installation

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Start backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd forntend
npm install
```

Create `.env` file in forntend folder:
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

Start frontend:
```bash
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── middlewares/    # Custom middlewares
│   ├── utils/          # Utility functions
│   └── db/            # Database connection
forntend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── context/       # Context API
│   └── api/           # API configuration
```

## 🔑 Key Features Implementation

### Authentication
- JWT access tokens (1 day) + refresh tokens (10 days)
- Secure HTTP-only cookies
- Token refresh mechanism

### Video Upload
- Multi-part form data with Multer
- Cloudinary storage for videos and thumbnails
- Video metadata management

### User Engagement
- Like/dislike system
- Comment on videos
- Subscribe to channels
- Create and manage playlists

### Dashboard
- Video analytics
- Subscriber count
- Channel statistics
- Video management (toggle publish status)

## 🌐 API Endpoints

### User Routes
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh-token` - Refresh access token
- `GET /api/v1/users/current-user` - Get current user
- `GET /api/v1/users/history` - Get watch history

### Video Routes
- `GET /api/v1/videos` - Get all videos
- `POST /api/v1/videos` - Upload video
- `GET /api/v1/videos/:id` - Get video by ID
- `PATCH /api/v1/videos/:id` - Update video
- `DELETE /api/v1/videos/:id` - Delete video

### Subscription Routes
- `POST /api/v1/subscriptions/c/:channelId` - Toggle subscription
- `GET /api/v1/subscriptions/c/:channelId` - Get subscriptions

### Playlist Routes
- `POST /api/v1/playlist` - Create playlist
- `GET /api/v1/playlist/:id` - Get playlist
- `PATCH /api/v1/playlist/add/:videoId/:playlistId` - Add video to playlist

## 👨‍💻 Author

Built for interview preparation and portfolio showcase.

## 📄 License

MIT License
