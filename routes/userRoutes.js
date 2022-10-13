import express from 'express';
import checkUserAuth from '../middlewares/auth-middleware.js';
import UserController from '../controllers/userController.js';

const router = express.Router();

// Route Level Middleware - To protect route
router.use('/changepassword', checkUserAuth);
router.use('/loggeduser', checkUserAuth);

// Public Routes
router.post('/register', UserController.userRegistration);
router.post('/login', UserController.userLogin);
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);

// Protected Routes(all function and servies available after login)
router.post('/changepassword', UserController.changeUserPassword);
router.get('/loggeduser', UserController.loggedUser);


export default router;