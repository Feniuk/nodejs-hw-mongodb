import {
  getContacts,
  getContactsById,
  createContact,
  deleteContactById,
} from '../services/contacts.js';
import mongoose from 'mongoose';
import createHttpError from 'http-errors';

export const getContactsController = async (req, res) => {
  const contacts = await getContacts();
  res.status(200).json({
    status: res.statusCode,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactsByIdController = async (req, res) => {
  const { contactId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    res.status(404).json({
      message: 'Problem exists with contact id!',
    });
    return;
  }
  const contact = await getContactsById(contactId);

  if (!contact) {
    return next(createHttpError(404, 'Contact not found'));
  }

  res.status(200).json({
    status: res.statusCode,
    message: `Successfully found contact with id: ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const { body } = req;
  const contact = await createContact(body);

  res.status(201).json({
    status: 201,
    message: `Successfully created student!`,
    data: contact,
  });
};

export const deleteContactByIdController = async (req, res, next) => {
  const id = req.params.contactId;

  const contact = await getContactsById(id);

  if (!contact) {
    return next(createHttpError(404, 'Contact cannot be deleted, invalid id!'));
  }
  await deleteContactById(id);

  // if (!contact) {
  //   return next(createHttpError(404, 'Contact cannot be deleted'));
  // }

  res.status(204).send();
};
