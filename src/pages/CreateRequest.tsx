import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  NumberInput,
  NumberInputField,
  Select,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const CreateRequest = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventType: '',
    guestCount: '',
    date: '',
    location: '',
    budget: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a request',
        status: 'error',
      });
      return;
    }

    try {
      const requestData = {
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'open',
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'requests'), requestData);
      
      toast({
        title: 'Success',
        description: 'Your catering request has been created',
        status: 'success',
      });
      
      navigate('/view-requests');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create request. Please try again.',
        status: 'error',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box p={8}>
      <VStack spacing={8} maxW="md" mx="auto">
        <Heading>Create Catering Request</Heading>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Event Type</FormLabel>
              <Select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                placeholder="Select event type"
              >
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate Event</option>
                <option value="birthday">Birthday Party</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Number of Guests</FormLabel>
              <NumberInput min={1}>
                <NumberInputField
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  placeholder="Enter number of guests"
                />
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Event Date</FormLabel>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Event location"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Budget</FormLabel>
              <NumberInput min={0}>
                <NumberInputField
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Enter your budget"
                />
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event and catering needs"
                rows={4}
              />
            </FormControl>

            <Button type="submit" colorScheme="blue" width="100%">
              Create Request
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default CreateRequest;