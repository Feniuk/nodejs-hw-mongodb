import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  loginUserController,
  logoutUserController,
  refreshTokenController,
  registerUserController,
} from '../controllers/auth.js';
import { validateBody } from '../middleware/validateBody.js';
import { registerUserSchema } from '../validation/registerUserSchema.js';
import { loginSchema } from '../validation/loginSchema.js';
import { authenticate } from '../middleware/authenticate.js';

const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);
authRouter.post(
  '/login',
  validateBody(loginSchema),
  ctrlWrapper(loginUserController),
);
authRouter.post('/refresh', authenticate, ctrlWrapper(refreshTokenController));
authRouter.post('/logout', authenticate, ctrlWrapper(logoutUserController));

export default authRouter;
