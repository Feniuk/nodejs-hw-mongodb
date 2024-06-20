import { User } from '../db/user.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { Session } from '../db/session.js';
import { createSession } from '../utils/createSession.js';
import jwt from 'jsonwebtoken';
import { SMTP, TEMPLATE_DIR } from '../constants/index.js';
import { sendMail } from '../utils/sendMail.js';
import { env } from '../utils/env.js';
import Handlebars from 'handlebars';
import fs from 'node:fs/promises';
import path from 'node:path';

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

  const templateSource = await fs.readFile(
    path.join(TEMPLATE_DIR, 'reset-pwd-email.html'),
  );

  const template = Handlebars.compile(templateSource.toString());

  const html = template({
    name: user.name,
    link: `${env(SMTP.SMTP_HOST)}/reset-password/${token}`,
  });

  try {
    await sendMail({
      html,
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset password',
    });
  } catch (error) {
    console.log(error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async ({ token, password }) => {
  let tokenPayload;
  try {
    tokenPayload = jwt.verify(token, env(SMTP.JWT_SECRET));
  } catch (error) {
    console.log(error);
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { _id: tokenPayload.sub, email: tokenPayload.email },
    { password: hashedPassword },
  );
};
