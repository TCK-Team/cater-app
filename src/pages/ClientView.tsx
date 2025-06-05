import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Badge,
  VStack,
  useToast,
  Button,
} from '@chakra-ui/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CateringRequest {
  id: string;
  eventType: string;
  guestCount: number;
  date: string;
  location: string;
  budget: number;
  description: string;
  status: string;
  userId: string;
  userEmail: string;
}

const ClientView = () => {
  const [requests, setRequests] = useState<CateringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchRequests = async () => {
      try {
        const requestsRef = collection(db, 'requests');
        const q = query(requestsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CateringRequest[];

        setRequests(fetchedRequests);
      } catch (error) {
        toast({
          title: 'Error fetching requests',
          description: 'There was an error loading your catering requests.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentUser, navigate, toast]);

  const handleCreateRequest = () => {
    navigate('/create-request');
  };

  if (loading) {
    return (
      <Container maxW="container.xl\" py={8}>
        <Text>Loading your requests...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading>My Catering Requests</Heading>
        <Button colorScheme="blue" onClick={handleCreateRequest}>
          Create New Request
        </Button>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {requests.map((request) => (
          <Box
            key={request.id}
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="sm"
          >
            <VStack align="start" spacing={3}>
              <Heading size="md">{request.eventType}</Heading>
              <Badge colorScheme={request.status === 'open' ? 'green' : 'yellow'}>
                {request.status}
              </Badge>
              <Text><strong>Date:</strong> {new Date(request.date).toLocaleDateString()}</Text>
              <Text><strong>Guests:</strong> {request.guestCount}</Text>
              <Text><strong>Location:</strong> {request.location}</Text>
              <Text><strong>Budget:</strong> ${request.budget}</Text>
              <Text><strong>Description:</strong> {request.description}</Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
      
      {requests.length === 0 && (
        <VStack spacing={4} mt={8}>
          <Text textAlign="center">
            You haven't created any catering requests yet.
          </Text>
          <Button colorScheme="blue" onClick={handleCreateRequest}>
            Create Your First Request
          </Button>
        </VStack>
      )}
    </Container>
  );
};

export default ClientView;