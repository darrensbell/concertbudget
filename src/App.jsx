import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Shows from './pages/Shows';
import Budget from './pages/Budget';
import CreateShow from './pages/CreateShow';
import EditShow from './pages/EditShow';
import CreateBudget from './pages/CreateBudget';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Shows />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/create-show" element={<CreateShow />} />
          <Route path="/edit-show/:id" element={<EditShow />} />
          <Route path="/create-budget/:showId/:dateIndex" element={<CreateBudget />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
