import { Router, Request, Response} from 'express';
import { User } from '../models/user.js';  // Import the User model
import jwt from 'jsonwebtoken';  // Import the JSON Web Token library
import bcrypt from 'bcrypt';  // Import the bcrypt library for password hashing
// Login function to authenticate a user

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;  // Extract username and password from request body
  // Find the user in the database by username
  const user = await User.findOne({
    where: { username },
  });

  // If user is not found, send an authentication failed response
  if (!user) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  // Compare the provided password with the stored hashed password
  const passwordIsValid = await bcrypt.compare(password, user.password);
  
  // If password is invalid, send an authentication failed response
  if (!passwordIsValid) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  // Get the secret key from environment variables
  const secretKey = process.env.JWT_SECRET_KEY || 'secret';
  // Generate a JWT token for the authenticated user
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
  return res.json({ token });  // Send the token as a JSON response
};

export const Signup = async (req: Request, res: Response) => {
  const {username, password } = req.body;

  // Check if username already exists
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = await User.create({ username, password: hashedPassword });

  // Generate a token
  const secretKey = process.env.JWT_SECRET_KEY || 'secret';
  const token = jwt.sign({ username: newUser.username }, secretKey, { expiresIn: '1h' });

  // Send a success response
  return res.json({ token });  ;
};


// Create a new router instance
const router = Router();
// Add the Signup route
router.post('/signup', Signup);
// POST /login - Login a user
router.post('/login', login);  // Define the login route
export default router;  // Export the router instance