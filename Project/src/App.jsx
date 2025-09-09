import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import MeetingRoom from './pages/MeetingRoom';

function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Landing />} />
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
