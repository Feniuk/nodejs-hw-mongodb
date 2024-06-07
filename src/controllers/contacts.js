import {
  getContacts,
  getContactsById,
  createContact,
  deleteContactById,
  upsertContact,
} from '../services/contacts.js';
import mongoose from 'mongoose';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { extractSortParams } from '../utils/extractSortParams.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = extractSortParams(req.query);

  const contacts = await getContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
  });
  res.status(200).json({
    status: res.statusCode,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactsByIdController = async (req, res, next) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(404).json({
      status: 404,
      message: 'Problem exists with contact id!',
      data: {
        message: 'Invalid contact ID',
      },
    });
  }

  try {
    const contact = await getContactsById(contactId);

    if (!contact) {
      return res.status(404).json({
        status: 404,
        message: 'Contact not found',
        data: {
          message: 'Contact not found',
        },
      });
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id: ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
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

  try {
    const contact = await getContactsById(id);

    if (!contact) {
      return res.status(404).json({
        status: 404,
        message: 'Contact cannot be deleted, invalid id!',
        data: {
          message: 'Contact not found',
        },
      });
    }

    await deleteContactById(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const patchSContactController = async (req, res, next) => {
  const { body } = req;
  const { contactId } = req.params;

  try {
    const existingContact = await getContactsById(contactId);

    if (!existingContact) {
      return res.status(404).json({
        status: 404,
        message: 'Contact not found',
        data: {
          message: 'Contact not found',
        },
      });
    }

    const { contact } = await upsertContact(contactId, body);

    res.status(200).json({
      status: 200,
      message: `Successfully patched contact!`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};
