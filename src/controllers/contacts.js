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
import { saveToCloudinary } from '../utils/saveToCloudinary.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = extractSortParams(req.query);
  const userId = req.user._id;

  try {
    const contacts = await getContacts({
      userId,
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
  } catch (error) {
    const httpError = createHttpError(500, 'Internal Server Error');
    res.status(httpError.statusCode).json({
      status: httpError.statusCode,
      message: httpError.message,
    });
  }
};

const constructAuthContactObject = (req) => {
  let authContactId = {};
  const { contactId } = req.params;
  const userId = req.user._id;
  if (contactId) {
    authContactId = { _id: contactId };
  }
  if (userId) {
    authContactId = { ...authContactId, userId: userId };
  }

  return authContactId;
};

export const getContactsByIdController = async (req, res, next) => {
  const authContactId = constructAuthContactObject(req);
  const contactId = authContactId._id;

  if (contactId && !mongoose.Types.ObjectId.isValid(contactId)) {
    const httpError = createHttpError(404, 'Invalid contact ID');
    return next(httpError);
  }

  try {
    const contact = await getContactsById(authContactId);

    if (!contact) {
      const httpError = createHttpError(404, 'Contact not found');
      return next(httpError);
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
  try {
    const photo = req.file;
    let photoUrl = null;

    if (photo) {
      photoUrl = await saveToCloudinary(photo);
    }

    const contactData = {
      userId: req.user._id,
      ...req.body,
    };

    if (photoUrl) {
      contactData.photo = photoUrl;
    }

    const contact = await createContact(contactData);

    res.status(201).json({
      status: 201,
      message: 'Successfully created contact!',
      data: contact,
    });
  } catch (error) {
    const httpError = createHttpError(500, 'Internal Server Error');
    res.status(httpError.statusCode).json({
      status: httpError.statusCode,
      message: httpError.message,
    });
  }
};

export const deleteContactByIdController = async (req, res, next) => {
  const authContactId = constructAuthContactObject(req);

  try {
    const contact = await getContactsById(authContactId);

    if (!contact) {
      const httpError = createHttpError(404, 'Contact not found');
      return next(httpError);
    }

    await deleteContactById(authContactId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const patchContactController = async (req, res, next) => {
  const { body } = req;
  const authContactId = constructAuthContactObject(req);
  const photo = req.file;

  try {
    const existingContact = await getContactsById(authContactId);

    if (!existingContact) {
      const httpError = createHttpError(404, 'Contact not found');
      return next(httpError);
    }

    let photoUrl = null;
    if (photo) {
      photoUrl = await saveToCloudinary(photo);
    }

    const updatedContactData = {
      ...body,
    };

    if (photoUrl) {
      updatedContactData.photo = photoUrl;
    }

    const { contact } = await upsertContact(authContactId, updatedContactData);

    res.status(200).json({
      status: 200,
      message: 'Successfully patched contact!',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};
