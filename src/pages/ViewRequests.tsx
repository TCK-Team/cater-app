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
} from '@chakra-ui/react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface CateringRequest {
  id: string;
  eventType: string;
  numberOfGuests: number;
  eventDate: string;
  location: string;
  budget: number;
  description: string;
  status: string;
  createdAt: string;
  userId: string;
  userEmail: string;
}

const ViewRequests = () => {
  const [requests, setRequests] = useState<CateringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requestsRef = collection(db, 'cateringRequests');
        const q = query(requestsRef);
        const querySnapshot = await getDocs(q);
        
        const fetchedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CateringRequest[];

        setRequests(fetchedRequests);
      } catch (error) {
        toast({
          title: 'Error fetching requests',
          description: 'There was an error loading the catering requests.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [toast]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading requests...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Catering Requests</Heading>
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
              <Badge colorScheme={request.status === 'pending' ? 'yellow' : 'green'}>
                {request.status}
              </Badge>
              <Text><strong>Date:</strong> {new Date(request.eventDate).toLocaleDateString()}</Text>
              <Text><strong>Guests:</strong> {request.numberOfGuests}</Text>
              <Text><strong>Location:</strong> {request.location}</Text>
              <Text><strong>Budget:</strong> ${request.budget}</Text>
              <Text><strong>Description:</strong> {request.description}</Text>
              <Text fontSize="sm" color="gray.500">
                Posted by: {request.userEmail}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
      
      {requests.length === 0 && (
        <Text textAlign="center" mt={8}>
          No catering requests found.
        </Text>
      )}
    </Container>
  );
};

export default ViewRequests;