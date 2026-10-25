# Recipe-Book-Backend API 🍲

REST API for **Matbakhy** ("مطبخي", Arabic for "my kitchen"), a recipe-sharing app. Built with Node.js, Express and MySQL. Supports authentication, recipe management, categories, favorites and ratings, with image uploads through Cloudinary.

## Features

- **Authentication**: JWT signup/login, passwords hashed with bcrypt
- **Recipes**: create, read, update, delete
- **Categories**: organize recipes by category
- **Favorites**: save recipes you like
- **Ratings**: rate recipes
- **Image uploads**: Multer + Cloudinary
- **Code quality**: ESLint configuration included

## Tech Stack

| Layer        | Technology                      |
| ------------ | ------------------------------- |
| Runtime      | Node.js                         |
| Framework    | Express.js                      |
| Database     | MySQL (`mysql2`)                |
| Auth         | `jsonwebtoken`, `bcryptjs`      |
| File storage | Cloudinary, Multer              |
| Tooling      | Nodemon, ESLint                 |

## Project Structure

```
├── config/        # DB connection and Cloudinary config
├── controllers/   # Request handlers / business logic
├── database/      # SQL schema
├── middleware/    # Auth guards, error handling, uploads
├── routes/        # Route definitions
└── server.js      # Entry point
```

## API Routes

Base path: `/api`

| Route             | Description               |
| ----------------- | ------------------------- |
| `/api/auth`       | Registration and login    |
| `/api/recipes`    | Recipe CRUD               |
| `/api/categories` | Recipe categories         |
| `/api/favorites`  | User's favorite recipes   |
| `/api/ratings`    | Recipe ratings            |
| `/api/users`      | User profile management   |

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL server
- A Cloudinary account

### Installation

```bash
git clone https://github.com/ikhlasaswad/Recipe-Book-Backend.git
cd Recipe-Book-Backend
npm install
```

### Database

Import the schema from the `database/` folder into your MySQL server:

```bash
mysql -u <user> -p <db_name> < database/<schema-file>.sql
```

### Environment variables

Create a `.env` file in the project root:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:3000

DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=matbakhy

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Run

```bash
npm run dev    # development with auto-reload
npm start      # production
```

The API runs at `http://localhost:5000`.

## Author

**Ikhlas Alaswad**: [GitHub](https://github.com/ikhlasaswad)

## License

MIT
