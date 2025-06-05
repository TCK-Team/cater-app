import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Badge,
  Divider,
  Card,
  CardBody,
  Stack,
  HStack,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Icon,
  Button,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { StarIcon, CheckIcon, PhoneIcon, EmailIcon } from '@chakra-ui/icons';

interface CatererProfile {
  businessName: string;
  phone: string;
  description: string;
  specialties: string[];
  images: string[];
  menus: {
    name: string;
    description: string;
    price: string;
    category: string;
  }[];
  experience: string;
  servingAreas: string[];
  certificates: string[];
}

const CatererPublicProfile = () => {
  const [profile, setProfile] = useState<CatererProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setError('No caterer ID provided');
        setLoading(false);
        return;
      }

      try {
        const profileDoc = await getDoc(doc(db, 'catererProfiles', id));
        if (!profileDoc.exists()) {
          setError('Caterer profile not found');
          setLoading(false);
          return;
        }

        setProfile(profileDoc.data() as CatererProfile);
      } catch (error) {
        setError('Failed to load caterer profile');
        toast({
          title: 'Error',
          description: 'Failed to load caterer profile',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, toast]);

  if (loading) {
    return (
      <Box height="100vh\" display="flex\" alignItems="center\" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Heading size="lg" color="red.500">
            {error || 'Profile not found'}
          </Heading>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <HStack spacing={6}>
            <Avatar 
              size="xl"
              name={profile.businessName}
              src={profile.images[0] || "https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg"}
            />
            <Stack spacing={3} flex={1}>
              <Heading size="lg">{profile.businessName}</Heading>
              <HStack>
                <Icon as={StarIcon} color="yellow.400" />
                <Text fontWeight="bold">4.8</Text>
                <Text color="gray.500">(124 reviews)</Text>
              </HStack>
              <HStack spacing={4}>
                <Badge colorScheme="green">Verified Caterer</Badge>
                <Badge colorScheme="purple">{profile.experience} Years Experience</Badge>
              </HStack>
            </Stack>
            <Button
              leftIcon={<EmailIcon />}
              colorScheme="blue"
              onClick={() => window.location.href = `mailto:${profile.phone}`}
            >
              Contact
            </Button>
          </HStack>
        </Box>

        {/* Stats Section */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <StatGroup bg="white" p={6} borderRadius="lg" shadow="md">
            <Stat>
              <StatLabel>Events Catered</StatLabel>
              <StatNumber>150+</StatNumber>
            </Stat>
          </StatGroup>
          <StatGroup bg="white" p={6} borderRadius="lg" shadow="md">
            <Stat>
              <StatLabel>Satisfaction Rate</StatLabel>
              <StatNumber>98%</StatNumber>
            </Stat>
          </StatGroup>
          <StatGroup bg="white" p={6} borderRadius="lg" shadow="md">
            <Stat>
              <StatLabel>Response Time</StatLabel>
              <StatNumber>{'< 2 hrs'}</StatNumber>
            </Stat>
          </StatGroup>
        </SimpleGrid>

        {/* About Section */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4}>About Us</Heading>
          <Text>{profile.description}</Text>
        </Box>

        {/* Portfolio Images */}
        {profile.images.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Portfolio</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {profile.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Portfolio ${index + 1}`}
                  borderRadius="lg"
                  objectFit="cover"
                  height="200px"
                  width="100%"
                />
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Specialties */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4}>Specialties</Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            {profile.specialties.map((specialty, index) => (
              <HStack
                key={index}
                bg="blue.50"
                p={3}
                borderRadius="md"
              >
                <Icon as={CheckIcon} color="blue.500" />
                <Text>{specialty}</Text>
              </HStack>
            ))}
          </SimpleGrid>
        </Box>

        {/* Menu Items */}
        {profile.menus.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Sample Menu Items</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
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
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Service Areas */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4}>Service Areas</Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            {profile.servingAreas.map((area, index) => (
              <Badge
                key={index}
                colorScheme="green"
                p={2}
                borderRadius="md"
                textAlign="center"
              >
                {area}
              </Badge>
            ))}
          </SimpleGrid>
        </Box>

        {/* Contact Section */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4}>Contact Information</Heading>
          <VStack align="start" spacing={3}>
            <HStack>
              <Icon as={PhoneIcon} color="blue.500" />
              <Text>{profile.phone}</Text>
            </HStack>
            <Button
              leftIcon={<EmailIcon />}
              colorScheme="blue"
              size="lg"
              width="full"
              onClick={() => window.location.href = `mailto:${profile.phone}`}
            >
              Contact This Caterer
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CatererPublicProfile;