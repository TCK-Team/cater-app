import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import CreateRequest from './pages/CreateRequest';
import ViewRequests from './pages/ViewRequests';
import ClientView from './pages/ClientView';
import CatererView from './pages/CatererView';
import Admin from './pages/Admin';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-request" element={<CreateRequest />} />
            <Route path="/view-requests" element={<ViewRequests />} />
            <Route path="/client" element={<ClientView />} />
            <Route path="/caterer" element={<CatererView />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;