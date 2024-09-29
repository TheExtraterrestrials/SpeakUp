import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Landing from '../pages/Landing';
import ChatPage from '../pages/ChatPage.jsx';

function App() {
  return (
    <Router basename="/SpeakUp">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
