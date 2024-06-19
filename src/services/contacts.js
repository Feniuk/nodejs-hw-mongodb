import { Contact } from '../db/contact.js';
import createHttpError from 'http-errors';
import { createPaginationInformation } from '../utils/createPaginationInformation.js';
import { SORT_ORDER } from '../constants/index.js';

export const getContacts = async ({
  userId,
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;
  const contactQuery = Contact.find({ userId });

  const [contactsCount, contacts] = await Promise.all([
    Contact.find({ userId }).merge(contactQuery).countDocuments(),
    contactQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationInfo = createPaginationInformation(
    page,
    perPage,
    contactsCount,
  );

  return { contacts, ...paginationInfo };
};

export const getContactsById = async (authContactId) => {
  const contact = await Contact.findOne(authContactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await Contact.create(payload);
  return contact;
};

export const deleteContactById = async (authContactId) => {
  await Contact.findOneAndDelete(authContactId);
};

export const upsertContact = async (authContactId, payload, options = {}) => {
  const rawResult = await Contact.findOneAndUpdate(authContactId, payload, {
    new: true,
    includeResultMetadata: true,
    ...options,
  });

  if (!rawResult || !rawResult.value) {
    throw createHttpError(404, 'Contact cannot be updated, invalid id!');
  }

  return {
    contact: rawResult.value,
    isNew: !rawResult?.lastErrorObject?.updatedExisting,
  };
};
