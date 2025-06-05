import React, { useState, useEffect } from 'react';
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
  SimpleGrid,
  Image,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Stack,
  Badge,
  IconButton,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface MenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
}

interface CatererProfile {
  businessName: string;
  phone: string;
  description: string;
  specialties: string[];
  images: string[];
  menus: MenuItem[];
  experience: string;
  servingAreas: string[];
  certificates: string[];
}

const Profile = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<CatererProfile>({
    businessName: '',
    phone: '',
    description: '',
    specialties: [],
    images: [],
    menus: [],
    experience: '',
    servingAreas: [],
    certificates: [],
  });
  const [newMenuItem, setNewMenuItem] = useState<MenuItem>({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;

      try {
        const profileDoc = await getDoc(doc(db, 'catererProfiles', currentUser.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as CatererProfile);
        }
      } catch (error) {
        toast({
          title: 'Error fetching profile',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, toast]);

  const handleUpdateProfile = async () => {
    if (!currentUser) return;

    try {
      await setDoc(doc(db, 'catererProfiles', currentUser.uid), profile);
      toast({
        title: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating profile',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleAddMenuItem = () => {
    if (newMenuItem.name && newMenuItem.price) {
      setProfile(prev => ({
        ...prev,
        menus: [...prev.menus, newMenuItem],
      }));
      setNewMenuItem({ name: '', description: '', price: '', category: '' });
    }
  };

  const handleRemoveMenuItem = (index: number) => {
    setProfile(prev => ({
      ...prev,
      menus: prev.menus.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpecialty = () => {
    if (newSpecialty) {
      setProfile(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty],
      }));
      setNewSpecialty('');
    }
  };

  const handleAddArea = () => {
    if (newArea) {
      setProfile(prev => ({
        ...prev,
        servingAreas: [...prev.servingAreas, newArea],
      }));
      setNewArea('');
    }
  };

  const handleAddImage = () => {
    if (newImage) {
      setProfile(prev => ({
        ...prev,
        images: [...prev.images, newImage],
      }));
      setNewImage('');
    }
  };

  if (isLoading) {
    return <Box p={8}>Loading...</Box>;
  }

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch" maxW="1200px" mx="auto">
        <Heading>Caterer Profile</Heading>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Basic Info</Tab>
            <Tab>Portfolio</Tab>
            <Tab>Menu Items</Tab>
            <Tab>Coverage & Certifications</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Business Name</FormLabel>
                  <Input
                    value={profile.businessName}
                    onChange={(e) => setProfile(prev => ({ ...prev, businessName: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Business Description</FormLabel>
                  <Textarea
                    value={profile.description}
                    onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Years of Experience</FormLabel>
                  <Input
                    value={profile.experience}
                    onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                  />
                </FormControl>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel>Add Portfolio Image (URL)</FormLabel>
                  <HStack>
                    <Input
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="Enter image URL"
                    />
                    <Button onClick={handleAddImage} leftIcon={<AddIcon />}>
                      Add
                    </Button>
                  </HStack>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {profile.images.map((image, index) => (
                    <Box key={index} position="relative">
                      <Image
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        borderRadius="md"
                        objectFit="cover"
                        w="100%"
                        h="200px"
                      />
                      <IconButton
                        aria-label="Remove image"
                        icon={<DeleteIcon />}
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }));
                        }}
                      />
                    </Box>
                  ))}
                </SimpleGrid>

                <Divider />

                <FormControl>
                  <FormLabel>Specialties</FormLabel>
                  <HStack>
                    <Input
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="Add a specialty"
                    />
                    <Button onClick={handleAddSpecialty} leftIcon={<AddIcon />}>
                      Add
                    </Button>
                  </HStack>
                </FormControl>

                <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
                  {profile.specialties.map((specialty, index) => (
                    <Badge
                      key={index}
                      colorScheme="blue"
                      p={2}
                      borderRadius="md"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      {specialty}
                      <DeleteIcon
                        cursor="pointer"
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            specialties: prev.specialties.filter((_, i) => i !== index),
                          }));
                        }}
                      />
                    </Badge>
                  ))}
                </SimpleGrid>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={6}>
                <Card w="100%">
                  <CardBody>
                    <Stack spacing={4}>
                      <Heading size="md">Add Menu Item</Heading>
                      <FormControl>
                        <FormLabel>Item Name</FormLabel>
                        <Input
                          value={newMenuItem.name}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          value={newMenuItem.description}
                          onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </FormControl>
                      <HStack>
                        <FormControl>
                          <FormLabel>Price</FormLabel>
                          <Input
                            value={newMenuItem.price}
                            onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Category</FormLabel>
                          <Input
                            value={newMenuItem.category}
                            onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                          />
                        </FormControl>
                      </HStack>
                      <Button onClick={handleAddMenuItem} colorScheme="blue">
                        Add Menu Item
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {profile.menus.map((item, index) => (
                    <Card key={index}>
                      <CardBody>
                        <Stack spacing={2}>
                          <Heading size="sm">{item.name}</Heading>
                          <Text fontSize="sm">{item.description}</Text>
                          <HStack justify="space-between">
                            <Badge colorScheme="green">${item.price}</Badge>
                            <Badge colorScheme="purple">{item.category}</Badge>
                          </HStack>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleRemoveMenuItem(index)}
                          >
                            Remove
                          </Button>
                        </Stack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel>Add Serving Area</FormLabel>
                  <HStack>
                    <Input
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      placeholder="Add a location you serve"
                    />
                    <Button onClick={handleAddArea} leftIcon={<AddIcon />}>
                      Add
                    </Button>
                  </HStack>
                </FormControl>

                <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
                  {profile.servingAreas.map((area, index) => (
                    <Badge
                      key={index}
                      colorScheme="green"
                      p={2}
                      borderRadius="md"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      {area}
                      <DeleteIcon
                        cursor="pointer"
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            servingAreas: prev.servingAreas.filter((_, i) => i !== index),
                          }));
                        }}
                      />
                    </Badge>
                  ))}
                </SimpleGrid>

                <Divider />

                <FormControl>
                  <FormLabel>Certifications & Licenses</FormLabel>
                  <Input
                    placeholder="Add certification or license"
                    value={profile.certificates.join(', ')}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      certificates: e.target.value.split(',').map(cert => cert.trim()),
                    }))}
                  />
                </FormControl>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Button colorScheme="blue" size="lg" onClick={handleUpdateProfile}>
          Save Profile
        </Button>
      </VStack>
    </Box>
  );
};

export default Profile;