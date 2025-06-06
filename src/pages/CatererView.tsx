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
  NumberInput,
  NumberInputField,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
} from '@chakra-ui/react';
import { collection, query, getDocs, addDoc, serverTimestamp, where, orderBy, onSnapshot } from 'firebase/firestore';
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
  DollarSignIcon,
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
  catererEmail: string;
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
  const [submittingBid, setSubmittingBid] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  
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
        // Fetch all open requests
        const requestsRef = collection(db, 'requests');
        const requestsQuery = query(requestsRef, where('status', '==', 'open'));
        const querySnapshot = await getDocs(requestsQuery);
        
        const fetchedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CateringRequest[];

        setRequests(fetchedRequests);

        // Fetch all bids
        const bidsRef = collection(db, 'bids');
        const bidsSnapshot = await getDocs(bidsRef);
        const fetchedBids = bidsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Bid[];
        setBids(fetchedBids);

      } catch (error) {
        console.error('Error fetching data:', error);
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
    if (!selectedRequest || !currentUser || !bidAmount || !bidMessage) {
      toast({
        title: 'Missing information',
        description: 'Please fill in both bid amount and message.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Check if caterer already has a bid for this request
    const existingBid = bids.find(bid => 
      bid.requestId === selectedRequest.id && bid.catererId === currentUser.uid
    );

    if (existingBid) {
      toast({
        title: 'Bid already submitted',
        description: 'You have already submitted a bid for this request.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setSubmittingBid(true);

    try {
      const newBid = {
        requestId: selectedRequest.id,
        catererId: currentUser.uid,
        catererEmail: currentUser.email,
        amount: parseFloat(bidAmount),
        message: bidMessage,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'bids'), newBid);

      toast({
        title: 'Bid submitted successfully',
        description: 'Your bid has been sent to the customer.',
        status: 'success',
        duration: 3000,
      });

      setIsBidModalOpen(false);
      setBidAmount('');
      setBidMessage('');

      // Update local state
      setBids([...bids, { 
        ...newBid, 
        id: docRef.id,
        createdAt: new Date()
      } as Bid]);
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        title: 'Error submitting bid',
        description: 'There was an error submitting your bid. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedRequest || !currentUser || !chatMessage.trim()) return;

    setSendingMessage(true);

    try {
      const newMessage = {
        requestId: selectedRequest.id,
        senderId: currentUser.uid,
        senderEmail: currentUser.email || 'Unknown',
        content: chatMessage.trim(),
        createdAt: serverTimestamp(),
      };

      console.log('Sending message:', newMessage);
      const docRef = await addDoc(collection(db, 'messages'), newMessage);
      console.log('Message sent with ID:', docRef.id);

      setChatMessage('');

      toast({
        title: 'Message sent',
        status: 'success',
        duration: 2000,
      });

      // Refresh messages
      await fetchMessages(selectedRequest.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const fetchMessages = async (requestId: string) => {
    setLoadingMessages(true);
    try {
      console.log('Fetching messages for request:', requestId);
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef, 
        where('requestId', '==', requestId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      console.log('Found messages:', querySnapshot.docs.length);
      
      const fetchedMessages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Message data:', data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }) as Message[];

      console.log('Processed messages:', fetchedMessages);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error fetching messages',
        description: 'Failed to load chat messages.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  // Set up real-time listener for messages when chat modal is open
  useEffect(() => {
    if (!isChatModalOpen || !selectedRequest) return;

    console.log('Setting up real-time listener for request:', selectedRequest.id);
    
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('requestId', '==', selectedRequest.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Real-time update - messages changed:', snapshot.docs.length);
      const fetchedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }) as Message[];
      
      setMessages(fetchedMessages);
    }, (error) => {
      console.error('Error in real-time listener:', error);
    });

    return () => unsubscribe();
  }, [isChatModalOpen, selectedRequest]);

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

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'accepted':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const RequestCard = ({ request }: { request: CateringRequest }) => {
    const requestBids = bids.filter(bid => bid.requestId === request.id);
    const myBid = requestBids.find(bid => bid.catererId === currentUser?.uid);
    const totalBids = requestBids.length;
    
    return (
      <Card>
        <CardBody>
          <VStack align="stretch\" spacing={4}>
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

              <Text noOfLines={3} color="gray.600">
                {request.description}
              </Text>
            </Stack>

            <Divider />

            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" color="green.500">
                  Budget: ${request.budget}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {totalBids} bid{totalBids !== 1 ? 's' : ''} received
                </Text>
              </VStack>
              
              <HStack>
                <Button
                  size="sm"
                  leftIcon={<ChatIcon />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => {
                    console.log('Opening chat for request:', request.id);
                    setSelectedRequest(request);
                    setIsChatModalOpen(true);
                  }}
                >
                  Chat
                </Button>
                {!myBid ? (
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
                ) : (
                  <Badge colorScheme={getBidStatusColor(myBid.status)} p={2}>
                    Bid: ${myBid.amount} ({myBid.status})
                  </Badge>
                )}
              </HStack>
            </HStack>

            {myBid && (
              <Box bg="blue.50" p={3} borderRadius="md">
                <Text fontWeight="bold" fontSize="sm" mb={1}>Your Bid:</Text>
                <Text fontSize="sm">{myBid.message}</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Submitted {formatDistanceToNow(myBid.createdAt, { addSuffix: true })}
                </Text>
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
        <Text>Loading available requests...</Text>
      </Container>
    );
  }

  const availableRequests = requests.filter(r => 
    !bids.some(b => b.requestId === r.id && b.catererId === currentUser?.uid)
  );
  const biddedRequests = requests.filter(r => 
    bids.some(b => b.requestId === r.id && b.catererId === currentUser?.uid)
  );

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={2}>Catering Job Board</Heading>
          <Text color="gray.600">
            Browse available catering requests and submit your bids to win new business.
          </Text>
        </Box>

        {/* Stats Overview */}
        <StatGroup bg="white" p={6} borderRadius="lg" shadow="md">
          <Stat>
            <StatLabel>Available Requests</StatLabel>
            <StatNumber>{availableRequests.length}</StatNumber>
            <StatHelpText>Ready for bidding</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>My Active Bids</StatLabel>
            <StatNumber>{biddedRequests.length}</StatNumber>
            <StatHelpText>Awaiting response</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Success Rate</StatLabel>
            <StatNumber>85%</StatNumber>
            <StatHelpText>Based on past bids</StatHelpText>
          </Stat>
        </StatGroup>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Available Requests ({availableRequests.length})</Tab>
            <Tab>My Bids ({biddedRequests.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={4}>
              {availableRequests.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  <AlertTitle>No new requests available</AlertTitle>
                  <AlertDescription>
                    Check back later for new catering opportunities.
                  </AlertDescription>
                </Alert>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {availableRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            <TabPanel p={4}>
              {biddedRequests.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  <AlertTitle>No active bids</AlertTitle>
                  <AlertDescription>
                    Start bidding on available requests to grow your business.
                  </AlertDescription>
                  </Alert>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {biddedRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Bid Modal */}
      <Modal isOpen={isBidModalOpen} onClose={() => setIsBidModalOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit Your Bid</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <VStack spacing={4}>
                <Box w="100%" p={4} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold">{selectedRequest.eventType}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {selectedRequest.guestCount} guests • {new Date(selectedRequest.date).toLocaleDateString()}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Budget: ${selectedRequest.budget}
                  </Text>
                </Box>
                
                <FormControl isRequired>
                  <FormLabel>Your Bid Amount ($)</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter your competitive bid"
                    />
                  </NumberInput>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Customer's budget: ${selectedRequest.budget}
                  </Text>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Proposal Message</FormLabel>
                  <Textarea
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    placeholder="Describe your catering proposal, experience, and what makes you the best choice for this event..."
                    rows={4}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsBidModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmitBid}
              isLoading={submittingBid}
              loadingText="Submitting..."
            >
              Submit Bid
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Chat Modal */}
      <Modal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Chat with Customer
            {selectedRequest && (
              <Text fontSize="sm\" fontWeight="normal\" color="gray.600">
                {selectedRequest.eventType} • {selectedRequest.userEmail}
              </Text>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} h="400px">
              <Box flex={1} w="100%" overflowY="auto" p={4} bg="gray.50" borderRadius="md" position="relative">
                {loadingMessages ? (
                  <Flex justify="center\" align="center\" h="100%">
                    <Spinner />
                  </Flex>
                ) : messages.length === 0 ? (
                  <Flex justify="center" align="center" h="100%" direction="column">
                    <Text color="gray.500" textAlign="center" mb={2}>
                      No messages yet. Start the conversation!
                    </Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                      Introduce yourself and discuss the catering details.
                    </Text>
                  </Flex>
                ) : (
                  messages.map((message) => (
                    <Box
                      key={message.id}
                      bg={message.senderId === currentUser?.uid ? "blue.100" : "white"}
                      p={3}
                      borderRadius="md"
                      mb={2}
                      ml={message.senderId === currentUser?.uid ? "auto" : "0"}
                      mr={message.senderId === currentUser?.uid ? "0" : "auto"}
                      maxW="80%"
                      boxShadow="sm"
                    >
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        {message.senderId === currentUser?.uid ? 'You' : message.senderEmail}
                      </Text>
                      <Text>{message.content}</Text>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                      </Text>
                    </Box>
                  ))
                )}
              </Box>
              <HStack w="100%">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sendingMessage}
                />
                <Button 
                  colorScheme="blue" 
                  onClick={handleSendMessage}
                  isLoading={sendingMessage}
                  disabled={!chatMessage.trim()}
                >
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