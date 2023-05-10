import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SpellLookUp from './SpellLookUp';

function Hello() {
  return (
    <div>
      <h1>Simple Spell</h1>
      <div className="Hello">
        <SpellLookUp />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
