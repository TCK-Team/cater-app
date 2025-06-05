import React from 'react';
import { Box, Flex, Button, useColorModeValue } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const { currentUser } = useAuth();
  const bg = useColorModeValue('white', 'gray.800');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box bg={bg} px={4} shadow="md">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex gap={4}>
          <Link to="/">Home</Link>
          {currentUser?.email === 'natalya@thecitykitch.com' ? (
            <>
              <Link to="/view-requests">Browse Requests</Link>
              <Link to="/admin">Admin</Link>
            </>
          ) : (
            <>
              <Link to="/client">My Requests</Link>
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