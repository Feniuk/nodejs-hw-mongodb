import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from './utils/env.js';
import { getContacts, getContactsById } from './services/contacts.js';
import mongoose from 'mongoose';

const PORT = Number(env('PORT', '3000'));

export const setupServer = () => {
  const app = express();
  const logger = pino({
    transport: {
      target: 'pino-pretty',
    },
  });

  app.use(express.json());
  app.use(cors());
  app.use(pinoHttp({ logger }));

  // app.get('/contacts', async (req, res) => {
  //   const contacts = await getContacts();
  //   res.status(200).json({
  //     status: res.statusCode,
  //     message: 'Successfully found contacts!',
  //     data: contacts,
  //   });
  // });

  // app.get('/contacts/:contactId', async (req, res) => {
  //   const { contactId } = req.params;
  //   if (!mongoose.Types.ObjectId.isValid(contactId)) {
  //     res.status(404).json({
  //       message: 'Problem exists with contact id!',
  //     });
  //     return;
  //   }
  //   const contact = await getContactsById(contactId);

  //   if (!contact) {
  //     return res.status(404).json({
  //       status: 404,
  //       message: `Contact with id ${contactId} not found!`,
  //     });
  //   }

  //   res.status(200).json({
  //     status: res.statusCode,
  //     message: `Successfully found contact with id: ${contactId}!`,
  //     data: contact,
  //   });
  // });

  app.use('*', (req, res) => {
    res.status(404).json({
      message: 'Not found',
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
