import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Badge,
  VStack,
  HStack,
  useToast,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Icon,
  Progress,
} from '@chakra-ui/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, TimeIcon, CalendarIcon, ChatIcon } from '@chakra-ui/icons';

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
  createdAt: string;
  quotes: number;
}

const CustomerView = () => {
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
          ...doc.data(),
          quotes: Math.floor(Math.random() * 5), // Simulated quotes count
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'completed':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'open':
        return 33;
      case 'pending':
        return 66;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  const RequestCard = ({ request }: { request: CateringRequest }) => (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="sm"
      bg="white"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Heading size="md">{request.eventType}</Heading>
          <Badge colorScheme={getStatusColor(request.status)}>
            {request.status.toUpperCase()}
          </Badge>
        </HStack>

        <Progress
          value={getProgressValue(request.status)}
          size="sm"
          colorScheme={getStatusColor(request.status)}
          borderRadius="full"
        />

        <HStack spacing={4}>
          <Icon as={CalendarIcon} color="gray.500" />
          <Text>{new Date(request.date).toLocaleDateString()}</Text>
        </HStack>

        <HStack spacing={4}>
          <Icon as={TimeIcon} color="gray.500" />
          <Text>{request.guestCount} guests</Text>
        </HStack>

        <Divider />

        <HStack justify="space-between">
          <Text color="gray.600">
            <Icon as={ChatIcon} mr={2} />
            {request.quotes} quotes received
          </Text>
          <Button
            size="sm"
            rightIcon={<CheckCircleIcon />}
            colorScheme="blue"
            variant="outline"
          >
            View Details
          </Button>
        </HStack>
      </VStack>
    </Box>
  );

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading your requests...</Text>
      </Container>
    );
  }

  const activeRequests = requests.filter(r => r.status !== 'completed');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <Container maxW="container.xl" py={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading>My Catering Requests</Heading>
        <Button
          colorScheme="blue"
          onClick={handleCreateRequest}
          leftIcon={<Icon as={CalendarIcon} />}
        >
          Create New Request
        </Button>
      </Box>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList mb={4}>
          <Tab>Active Requests ({activeRequests.length})</Tab>
          <Tab>Completed ({completedRequests.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {activeRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </SimpleGrid>
            
            {activeRequests.length === 0 && (
              <VStack spacing={4} mt={8}>
                <Text textAlign="center">
                  You don't have any active catering requests.
                </Text>
                <Button colorScheme="blue" onClick={handleCreateRequest}>
                  Create Your First Request
                </Button>
              </VStack>
            )}
          </TabPanel>

          <TabPanel p={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {completedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </SimpleGrid>
            
            {completedRequests.length === 0 && (
              <Text textAlign="center" mt={8}>
                You don't have any completed requests yet.
              </Text>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default CustomerView;