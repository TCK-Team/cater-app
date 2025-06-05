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
  StatHelpText,
  StatGroup,
  Avatar,
  Progress,
  Flex,
  Card,
  CardBody,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { collection, query, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  TimeIcon,
  CalendarIcon,
  StarIcon,
  ViewIcon,
  EmailIcon,
  PhoneIcon,
  CheckIcon,
} from '@chakra-ui/icons';

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

interface Bid {
  amount: number;
  message: string;
  proposedMenu: string;
  estimatedDuration: string;
}

const CatererView = () => {
  const [requests, setRequests] = useState<CateringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CateringRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidData, setBidData] = useState<Bid>({
    amount: 0,
    message: '',
    proposedMenu: '',
    estimatedDuration: '',
  });
  
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

  const handleBidSubmit = async () => {
    if (!selectedRequest || !currentUser) return;

    try {
      // Create a new bid document
      await addDoc(collection(db, 'bids'), {
        requestId: selectedRequest.id,
        catererId: currentUser.uid,
        catererEmail: currentUser.email,
        ...bidData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // Update the request status
      const requestRef = doc(db, 'requests', selectedRequest.id);
      await updateDoc(requestRef, {
        status: 'pending',
      });

      toast({
        title: 'Bid submitted successfully',
        status: 'success',
        duration: 3000,
      });

      setIsModalOpen(false);
      setBidData({
        amount: 0,
        message: '',
        proposedMenu: '',
        estimatedDuration: '',
      });

      // Refresh the requests list
      const updatedRequests = requests.map(req =>
        req.id === selectedRequest.id ? { ...req, status: 'pending' } : req
      );
      setRequests(updatedRequests);
    } catch (error) {
      toast({
        title: 'Error submitting bid',
        description: 'There was an error submitting your bid. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }
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

  const RequestCard = ({ request }: { request: CateringRequest }) => (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <Heading size="md">{request.eventType}</Heading>
            <Badge colorScheme={getStatusColor(request.status)}>
              {request.status.toUpperCase()}
            </Badge>
          </HStack>

          <Progress
            value={request.status === 'completed' ? 100 : request.status === 'pending' ? 50 : 25}
            size="sm"
            colorScheme={getStatusColor(request.status)}
            borderRadius="full"
          />

          <Stack spacing={3}>
            <HStack>
              <Icon as={CalendarIcon} color="blue.500" />
              <Text>{new Date(request.date).toLocaleDateString()}</Text>
            </HStack>

            <HStack>
              <Icon as={TimeIcon} color="blue.500" />
              <Text>{request.guestCount} guests</Text>
            </HStack>

            <HStack>
              <Icon as={EmailIcon} color="blue.500" />
              <Text>{request.userEmail}</Text>
            </HStack>

            <HStack>
              <Icon as={PhoneIcon} color="blue.500" />
              <Text>Location: {request.location}</Text>
            </HStack>

            <Text noOfLines={2} color="gray.600">
              {request.description}
            </Text>
          </Stack>

          <Divider />

          <HStack justify="space-between" align="center">
            <Text fontWeight="bold" color="green.500">
              Budget: ${request.budget}
            </Text>
            {request.status === 'open' && (
              <Button
                size="sm"
                rightIcon={<ViewIcon />}
                colorScheme="blue"
                variant="solid"
                onClick={() => {
                  setSelectedRequest(request);
                  setIsModalOpen(true);
                }}
              >
                Submit Bid
              </Button>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
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

  const responseRate = 95;
  const completionRate = 98;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Card>
          <CardBody>
            <HStack spacing={6}>
              <Avatar 
                size="xl" 
                name={currentUser?.email || 'Caterer'} 
                src="https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg"
              />
              <VStack align="start" spacing={2} flex={1}>
                <Heading size="lg">{currentUser?.email}</Heading>
                <HStack>
                  <Icon as={StarIcon} color="yellow.400" />
                  <Text fontWeight="bold">4.8</Text>
                  <Text color="gray.500">(124 reviews)</Text>
                </HStack>
                <HStack spacing={4}>
                  <Badge colorScheme="green">Verified Caterer</Badge>
                  <Badge colorScheme="purple">Premium Member</Badge>
                  <Badge colorScheme="blue">Top Rated</Badge>
                </HStack>
              </VStack>
              <Button leftIcon={<CheckIcon />} colorScheme="green" variant="outline">
                Update Profile
              </Button>
            </HStack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Response Rate</StatLabel>
                <StatNumber>{responseRate}%</StatNumber>
                <StatHelpText>
                  <Icon as={CheckCircleIcon} color="green.500" mr={1} />
                  Above Average
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Completion Rate</StatLabel>
                <StatNumber>{completionRate}%</StatNumber>
                <StatHelpText>
                  <Icon as={CheckCircleIcon} color="green.500" mr={1} />
                  Excellent
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Active Jobs</StatLabel>
                <StatNumber>{activeRequests.length}</StatNumber>
                <StatHelpText>
                  Current Projects
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Completed</StatLabel>
                <StatNumber>{completedRequests.length}</StatNumber>
                <StatHelpText>
                  Lifetime Jobs
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>New Leads ({newRequests.length})</Tab>
            <Tab>Active Jobs ({activeRequests.length})</Tab>
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
                <Text textAlign="center">No new leads available at the moment.</Text>
              )}
            </TabPanel>

            <TabPanel p={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {activeRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </SimpleGrid>
              {activeRequests.length === 0 && (
                <Text textAlign="center">No active jobs at the moment.</Text>
              )}
            </TabPanel>

            <TabPanel p={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {completedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </SimpleGrid>
              {completedRequests.length === 0 && (
                <Text textAlign="center">No completed jobs yet.</Text>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit Bid for {selectedRequest?.eventType}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Bid Amount ($)</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField
                    value={bidData.amount}
                    onChange={(e) => setBidData({ ...bidData, amount: Number(e.target.value) })}
                  />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Proposed Menu</FormLabel>
                <Textarea
                  value={bidData.proposedMenu}
                  onChange={(e) => setBidData({ ...bidData, proposedMenu: e.target.value })}
                  placeholder="Describe your proposed menu..."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Estimated Duration</FormLabel>
                <Input
                  value={bidData.estimatedDuration}
                  onChange={(e) => setBidData({ ...bidData, estimatedDuration: e.target.value })}
                  placeholder="e.g., 4 hours"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Message to Customer</FormLabel>
                <Textarea
                  value={bidData.message}
                  onChange={(e) => setBidData({ ...bidData, message: e.target.value })}
                  placeholder="Include any additional information or special offers..."
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleBidSubmit}>
              Submit Bid
            </Button>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default CatererView;