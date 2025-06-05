import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  userType: string;
  createdAt: string;
}

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

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<CateringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        navigate('/');
        return;
      }
      // In a real app, you'd check if the user has admin rights here
    };

    const fetchData = async () => {
      try {
        // Fetch Users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        setUsers(usersData);

        // Fetch Requests
        const requestsSnapshot = await getDocs(collection(db, 'requests'));
        const requestsData = requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CateringRequest[];
        setRequests(requestsData);
      } catch (error) {
        toast({
          title: 'Error fetching data',
          description: 'There was an error loading the admin data.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
    fetchData();
  }, [currentUser, navigate, toast]);

  if (loading) {
    return <Box p={8}>Loading...</Box>;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Admin Dashboard</Heading>
      
      <Tabs>
        <TabList>
          <Tab>Users</Tab>
          <Tab>Catering Requests</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>User Type</Th>
                  <Th>Created At</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.id}>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge colorScheme={user.userType === 'caterer' ? 'green' : 'blue'}>
                        {user.userType}
                      </Badge>
                    </Td>
                    <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>

          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Event Type</Th>
                  <Th>User</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Budget</Th>
                </Tr>
              </Thead>
              <Tbody>
                {requests.map((request) => (
                  <Tr key={request.id}>
                    <Td>{request.eventType}</Td>
                    <Td>{request.userEmail}</Td>
                    <Td>{new Date(request.date).toLocaleDateString()}</Td>
                    <Td>
                      <Badge colorScheme={request.status === 'open' ? 'green' : 'yellow'}>
                        {request.status}
                      </Badge>
                    </Td>
                    <Td>${request.budget}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default Admin;