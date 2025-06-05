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
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Avatar,
} from '@chakra-ui/react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, TimeIcon, CalendarIcon, StarIcon, ViewIcon } from '@chakra-ui/icons';

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
}

const CatererView = () => {
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
  }, [currentUser, navigate, toast]);

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

        <HStack spacing={4}>
          <Icon as={CalendarIcon} color="gray.500" />
          <Text>{new Date(request.date).toLocaleDateString()}</Text>
        </HStack>

        <HStack spacing={4}>
          <Icon as={TimeIcon} color="gray.500" />
          <Text>{request.guestCount} guests</Text>
        </HStack>

        <Text noOfLines={2}>{request.description}</Text>

        <Divider />

        <HStack justify="space-between" align="center">
          <Text fontWeight="bold" color="green.500">
            ${request.budget}
          </Text>
          <Button
            size="sm"
            rightIcon={<ViewIcon />}
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
        <Text>Loading requests...</Text>
      </Container>
    );
  }

  const newRequests = requests.filter(r => r.status === 'open');
  const activeRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <HStack spacing={6}>
            <Avatar size="xl" name={currentUser?.email || 'Caterer'} />
            <VStack align="start" spacing={2}>
              <Heading size="lg">{currentUser?.email}</Heading>
              <HStack>
                <Icon as={StarIcon} color="yellow.400" />
                <Text>4.8 (124 reviews)</Text>
              </HStack>
              <Badge colorScheme="green">Verified Caterer</Badge>
            </VStack>
          </HStack>
        </Box>

        <StatGroup bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Stat>
            <StatLabel>New Requests</StatLabel>
            <StatNumber>{newRequests.length}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Active Jobs</StatLabel>
            <StatNumber>{activeRequests.length}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Completed</StatLabel>
            <StatNumber>{completedRequests.length}</StatNumber>
          </Stat>
        </StatGroup>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>New Requests ({newRequests.length})</Tab>
            <Tab>Active ({activeRequests.length})</Tab>
            <Tab>Completed ({completedRequests.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {newRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </SimpleGrid>
              {newRequests.length === 0 && (
                <Text textAlign="center">No new requests available.</Text>
              )}
            </TabPanel>

            <TabPanel p={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {activeRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </SimpleGrid>
              {activeRequests.length === 0 && (
                <Text textAlign="center">No active requests.</Text>
              )}
            </TabPanel>

            <TabPanel p={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {completedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </SimpleGrid>
              {completedRequests.length === 0 && (
                <Text textAlign="center">No completed requests yet.</Text>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default CatererView;