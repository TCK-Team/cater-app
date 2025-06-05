import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Not implemented',
      description: 'Profile update functionality will be added soon',
      status: 'info',
    });
  };

  return (
    <Box p={8}>
      <VStack spacing={8} maxW="md" mx="auto">
        <Heading>Profile</Heading>
        <Text>Email: {currentUser?.email}</Text>
        
        <form onSubmit={handleUpdateProfile} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Business Name</FormLabel>
              <Input placeholder="Your business name" />
            </FormControl>
            
            <FormControl>
              <FormLabel>Phone Number</FormLabel>
              <Input type="tel" placeholder="Your phone number" />
            </FormControl>
            
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input placeholder="Tell us about your catering business" />
            </FormControl>
            
            <Button type="submit" colorScheme="blue" width="100%">
              Update Profile
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default Profile;