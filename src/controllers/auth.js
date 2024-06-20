import {
  createUser,
  loginUser,
  logoutUser,
  refreshSession,
  resetPassword,
  sendResetPassword,
} from '../services/auth.js';
import { setupSessionCookie } from '../utils/setupSessionCookie.js';

export const registerUserController = async (req, res, next) => {
  const user = await createUser(req.body);

  res.json({
    status: 200,
    message: 'Successfully registered a user!',
    data: { user },
  });
};

export const loginUserController = async (req, res, next) => {
  const session = await loginUser(req.body);

  setupSessionCookie(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

export const logoutUserController = async (req, res, next) => {
  await logoutUser({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const refreshTokenController = async (req, res, next) => {
  const { sessionId, refreshToken } = req.cookies;
  const session = await refreshSession({
    sessionId,
    refreshToken,
  });

  setupSessionCookie(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: session.accessToken },
  });
};

export const sendResetPasswordEmailController = async (req, res) => {
  await sendResetPassword(req.body.email);

  res.json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);

  res.json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
