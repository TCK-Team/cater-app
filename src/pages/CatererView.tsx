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
  Input,
  Textarea,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { collection, query, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
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
  ChatIcon,
} from '@chakra-ui/icons';
import { formatDistanceToNow } from 'date-fns';

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
  id: string;
  requestId: string;
  catererId: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

interface Message {
  id: string;
  requestId: string;
  senderId: string;
  senderEmail: string;
  content: string;
  createdAt: Date;
}

const CatererView = () => {
  const [requests, setRequests] = useState<CateringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CateringRequest | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch open requests
        const requestsRef = collection(db, 'requests');
        const q = query(requestsRef);
        const querySnapshot = await getDocs(q);
        
        const fetchedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CateringRequest[];

        setRequests(fetchedRequests);

        // Fetch bids
        const bidsRef = collection(db, 'bids');
        const bidsSnapshot = await getDocs(bidsRef);
        const fetchedBids = bidsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Bid[];
        setBids(fetchedBids);

      } catch (error) {
        toast({
          title: 'Error fetching data',
          description: 'There was an error loading the requests.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate, toast]);

  const handleSubmitBid = async () => {
    if (!selectedRequest || !currentUser) return;

    try {
      const newBid = {
        requestId: selectedRequest.id,
        catererId: currentUser.uid,
        amount: parseFloat(bidAmount),
        message: bidMessage,
        status: 'pending',
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'bids'), newBid);

      toast({
        title: 'Bid submitted successfully',
        status: 'success',
        duration: 3000,
      });

      setIsBidModalOpen(false);
      setBidAmount('');
      setBidMessage('');

      // Update local state
      setBids([...bids, { ...newBid, id: Date.now().toString() }]);
    } catch (error) {
      toast({
        title: 'Error submitting bid',
        description: 'There was an error submitting your bid. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedRequest || !currentUser || !chatMessage.trim()) return;

    try {
      const newMessage = {
        requestId: selectedRequest.id,
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        content: chatMessage,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'messages'), newMessage);

      // Update local state
      setMessages([...messages, { ...newMessage, id: Date.now().toString() }]);
      setChatMessage('');

      toast({
        title: 'Message sent',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error sending message',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchMessages = async (requestId: string) => {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef);
      const querySnapshot = await getDocs(q);
      
      const fetchedMessages = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(msg => msg.requestId === requestId) as Message[];

      setMessages(fetchedMessages);
    } catch (error) {
      toast({
        title: 'Error fetching messages',
        description: 'Failed to load chat messages.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'green';
      case 'booked':
        return 'blue';
      case 'completed':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const RequestCard = ({ request }: { request: CateringRequest }) => {
    const requestBids = bids.filter(bid => bid.requestId === request.id);
    
    return (
      <Card>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
              <Heading size="md">{request.eventType}</Heading>
              <Badge colorScheme={getStatusColor(request.status)}>
                {request.status.toUpperCase()}
              </Badge>
            </HStack>

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
              <HStack>
                <Button
                  size="sm"
                  leftIcon={<ChatIcon />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(request);
                    fetchMessages(request.id);
                    setIsChatModalOpen(true);
                  }}
                >
                  Chat
                </Button>
                {request.status === 'open' && (
                  <Button
                    size="sm"
                    leftIcon={<ViewIcon />}
                    colorScheme="green"
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsBidModalOpen(true);
                    }}
                  >
                    Place Bid
                  </Button>
                )}
              </HStack>
            </HStack>

            {requestBids.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={2}>Your Bids:</Text>
                {requestBids.map(bid => (
                  <HStack key={bid.id} p={2} bg="gray.50" borderRadius="md">
                    <Badge colorScheme={bid.status === 'accepted' ? 'green' : 'yellow'}>
                      ${bid.amount}
                    </Badge>
                    <Text fontSize="sm">{bid.message}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatDistanceToNow(bid.createdAt, { addSuffix: true })}
                    </Text>
                  </HStack>
                ))}
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading requests...</Text>
      </Container>
    );
  }

  const openRequests = requests.filter(r => r.status === 'open');
  const biddedRequests = requests.filter(r => bids.some(b => b.requestId === r.id && b.catererId === currentUser?.uid));
  const bookedRequests = requests.filter(r => r.status === 'booked');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Open Requests ({openRequests.length})</Tab>
            <Tab>My Bids ({biddedRequests.length})</Tab>
            <Tab>Booked ({bookedRequests.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {openRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </SimpleGrid>
              {openRequests.length === 0 && (
                <Text textAlign="center">No open requests available.</Text>
              )}
            </TabPanel>

            <TabPanel p={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {biddedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </SimpleGrid>
              {biddedRequests.length === 0 && (
                <Text textAlign="center">You haven't placed any bids yet.</Text>
              )}
            </TabPanel>

            <TabPanel p={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {bookedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </SimpleGrid>
              {bookedRequests.length === 0 && (
                <Text textAlign="center">No booked requests yet.</Text>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Bid Modal */}
      <Modal isOpen={isBidModalOpen} onClose={() => setIsBidModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Place a Bid</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Bid Amount ($)</FormLabel>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter your bid amount"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Describe your proposal"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsBidModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmitBid}>
              Submit Bid
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Chat Modal */}
      <Modal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} h="400px">
              <Box flex={1} w="100%" overflowY="auto" p={4} bg="gray.50" borderRadius="md">
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    bg={message.senderId === currentUser?.uid ? "blue.100" : "white"}
                    p={3}
                    borderRadius="md"
                    mb={2}
                    alignSelf={message.senderId === currentUser?.uid ? "flex-end" : "flex-start"}
                  >
                    <Text fontSize="xs" color="gray.500">{message.senderEmail}</Text>
                    <Text>{message.content}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                    </Text>
                  </Box>
                ))}
              </Box>
              <HStack w="100%">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button colorScheme="blue" onClick={handleSendMessage}>
                  Send
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default CatererView;