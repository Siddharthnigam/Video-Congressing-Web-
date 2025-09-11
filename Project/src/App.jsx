import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Lobby from './pages/Lobby';
import MeetingRoom from './pages/MeetingRoom';

function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/meeting" element={<MeetingRoom />} />
            </Routes>
          </div>
        </Router>
      </RoomProvider>
    </AuthProvider>
  );
}

export default App;
