# StarVault

StarVault is a modern, full-stack web application for discovering and tracking movies, TV shows, and anime. Users can explore trending content, read reviews, and manage their personal library with Watchlist, Favorites, and Watched History.

## Features

-   **Content Discovery**: Browse trending, popular, and top-rated Movies, TV Shows, and Anime.
-   **Detailed Information**: View comprehensive details including cast, crews, ratings, and release dates.
-   **User Accounts**: Secure authentication system (Login/Register).
-   **Personal Library**:
    -   **Watchlist**: Keep track of what you want to watch.
    -   **Favorites**: Save your most-loved content.
    -   **History**: Mark content as watched.
-   **Reviews**: Write and manage your own reviews for any media.
-   **Responsive Design**: Built with a mobile-first approach using Tailwind CSS.

## Tech Stack

### Client (Frontend)
-   **Framework**: React (Vite)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **State/Routing**: React Router DOM
-   **HTTP Client**: Axios
-   **Icons**: Lucide React
-   **Animations**: Framer Motion

### Server (Backend)
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Authentication**: JWT (JSON Web Tokens) & Bcrypt

## Prerequisites

-   Node.js (v18+ recommended)
-   npm or yarn
-   MongoDB (Local or Atlas)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/Brown-Sage/StarVault.git
cd StarVault
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd Server
npm install
```

Create a `.env` file in the `Server` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd Client
npm install
```

Create a `.env` file in the `Client` directory:
```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the development server:
```bash
npm run dev
```

## Usage

1.  Ensure both backend and frontend servers are running.
2.  Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).
3.  Register for a new account to start building your library!

## Project Structure

-   `Client/`: React frontend application.
-   `Server/`: Express backend API.

## Contributing

By the way, Contributions, issues, and feature requests are welcome!
Feel free to fork the repo, create a branch, and submit a pull request.

## License

[ISC](https://opensource.org/licenses/ISC)
