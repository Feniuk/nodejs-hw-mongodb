import { User } from '../db/user.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { Session } from '../db/session.js';
import { createSession } from '../utils/createSession.js';

export const createUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  return await User.create({ ...payload, password: hashedPassword });
};

export const loginUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const areEqual = await bcrypt.compare(payload.password, user.password);

  if (!areEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  await Session.deleteOne({ userId: user._id });

  return await Session.create({
    userId: user._id,
    ...createSession(),
  });
};

export const logoutUser = async (payload) => {
  const session = await Session.deleteOne({
    _id: payload.sessionId,
    refreshToken: payload.refreshToken,
  });
};

export const refreshSession = async (payload) => {
  const session = await Session.findOne({
    _id: payload.sessionId,
    refreshToken: payload.refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found!');
  }

  if (Date.now() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh token expired!');
  }

  const user = await User.findById(session.userId);
  console.log('my user', user);
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  await Session.deleteOne({
    _id: session._id,
  });

  return await Session.create({
    userId: user._id,
    ...createSession(),
  });
};
