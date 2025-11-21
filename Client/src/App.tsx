import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ShowAll from './components/ShowAll'
import HomePage from "./components/HomePage";
import MovieDetails from './components/MovieDetails';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <Routes>
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/" element={<HomePage />} />

          <Route path="/:type/:id" element={<MovieDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
