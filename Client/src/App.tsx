import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import BrowseAll from './components/BrowseAll';
import HomePage from "./components/HomePage";
import MovieDetails from './components/MovieDetails';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse/:category" element={<BrowseAll />} />
          <Route path="/:type/:id" element={<MovieDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

