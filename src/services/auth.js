import { User } from '../db/user.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { Session } from '../db/session.js';
import { createSession } from '../utils/createSession.js';
import jwt from 'jsonwebtoken';
import { SMTP } from '../constants/index.js';
import { sendMail } from '../utils/sendMail.js';
import { env } from '../utils/env.js';

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

export const sendResetPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const token = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env(SMTP.JWT_SECRET),
    {
      expiresIn: '5m',
    },
  );

  try {
    await sendMail({
      html: `
      <h1>Helo!</h1>
      <p>Here is your reset password link:
      <a href="${env(SMTP.SMTP_HOST)}/reset-password/${token}">Link</a>
      </p>`,
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset password',
    });
    console.log('Email seems to have been sent successfully!');
  } catch (error) {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
