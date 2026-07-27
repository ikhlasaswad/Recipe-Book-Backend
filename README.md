# Recipe-Book-Backend API 🍲

A RESTful backend API for a recipe-sharing application ("Matbakhy" — Arabic for "my kitchen"). Built with Node.js, Express, and MySQL, it supports user authentication, recipe management, categories, favorites, and ratings, with image uploads handled via Cloudinary.

## Features

- **User Authentication** — JWT-based signup/login with hashed passwords (bcrypt)
- **Recipes** — Create, read, update, and delete recipes
- **Categories** — Organize recipes by category
- **Favorites** — Users can save recipes they like
- **Ratings** — Users can rate recipes
- **Image Uploads** — Recipe/profile images stored via Cloudinary (Multer + multer-storage-cloudinary)

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MySQL (mysql2) |
| Auth | JSON Web Tokens (jsonwebtoken), bcryptjs |
| File Storage | Cloudinary, Multer |
| Dev Tools | Nodemon |

## Project Structure

```
├── config/          # DB connection & third-party service configs (Cloudinary, etc.)
├── controllers/      # Request handlers / business logic
├── database/          # SQL schema / migrations
├── middleware/        # Auth guards, error handling, upload middleware
├── routes/            # API route definitions
├── uploads/            # Local upload staging (if used)
├── server.js           # App entry point
└── package.json
```

## API Endpoints

Base URL: `/api`

| Route | Description |
|---|---|
| `/api/auth` | User registration & login |
| `/api/recipes` | Recipe CRUD operations |
| `/api/categories` | Recipe categories |
| `/api/favorites` | User's favorite recipes |
| `/api/ratings` | Recipe ratings |
| `/api/users` | User profile management |

> Detailed endpoint documentation (methods, request/response bodies) — *to be added.*

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MySQL server
- A Cloudinary account (for image uploads)

### Installation

```bash
git clone https://github.com/ikhlasaswad/Recipe-Book-Backend
.git
cd Recipe-Book-Backend

npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:3000

# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=matbakhy

# Auth
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> ⚠️ Adjust variable names above to match what's actually read in `config/` — see note below.

### Run the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`.

## License

This project is currently unlicensed. Consider adding an [MIT License](https://choosealicense.com/licenses/mit/) if you intend this to be open source.
