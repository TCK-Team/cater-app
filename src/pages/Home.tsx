import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Select,
} from '@chakra-ui/react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';

const Home = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        if (!userType) {
          toast({ title: 'Error', description: 'Please select a user type', status: 'error' });
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          userType: userType,
          createdAt: new Date(),
        });
        toast({ title: 'Account created successfully!', status: 'success' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Signed in successfully!', status: 'success' });
      }
      navigate('/view-requests');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    }
  };

  return (
    <Box p={8}>
      <VStack spacing={8} maxW="md" mx="auto">
        <Heading>{isSignUp ? 'Create Account' : 'Sign In'}</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormControl>
            {isSignUp && (
              <FormControl>
                <FormLabel>I am a</FormLabel>
                <Select
                  placeholder="Select user type"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="caterer">Caterer</option>
                </Select>
              </FormControl>
            )}
            <Button type="submit" colorScheme="blue" width="100%">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default Home;