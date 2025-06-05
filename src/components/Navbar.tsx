import React from 'react';
import { Box, Flex, Button, useColorModeValue } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const { currentUser } = useAuth();
  const bg = useColorModeValue('white', 'gray.800');
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserType = () => {
    if (currentUser?.email === 'natalya@thecitykitch.com') return 'admin';
    return localStorage.getItem('userType') || 'customer';
  };

  // Hide navigation on the home page (sign in/sign up)
  if (location.pathname === '/') {
    return (
      <Box bg={bg} px={4} shadow="md">
        <Flex h={16} alignItems="center" justifyContent="flex-end">
          {currentUser && (
            <Button onClick={handleSignOut}>Sign Out</Button>
          )}
        </Flex>
      </Box>
    );
  }

  return (
    <Box bg={bg} px={4} shadow="md">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex gap={4}>
          <Link to="/">Home</Link>
          {getUserType() === 'admin' ? (
            <>
              <Link to="/view-requests">Browse Requests</Link>
              <Link to="/admin">Admin</Link>
            </>
          ) : getUserType() === 'caterer' ? (
            <Link to="/caterer">Dashboard</Link>
          ) : (
            <>
              <Link to="/customer">My Requests</Link>
              <Link to="/create-request">Create Request</Link>
            </>
          )}
        </Flex>
        <Flex gap={4}>
          {currentUser ? (
            <>
              <Link to="/profile">Profile</Link>
              <Button onClick={handleSignOut}>Sign Out</Button>
            </>
          ) : (
            <Link to="/">Sign In</Link>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;