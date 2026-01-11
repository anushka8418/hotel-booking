import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUserData, storeRecentSearchCities } from '../controller/userController.js';

    const userRouter = express.Router();

    
    userRouter.get('/get-user', protect, getUserData);
    userRouter.post('/store-recent-search', protect, storeRecentSearchCities);

  export default userRouter;

