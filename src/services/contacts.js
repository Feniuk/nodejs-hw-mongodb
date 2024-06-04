import { Contact } from '../db/contact.js';
import createHttpError from 'http-errors';

export const getContacts = async () => {
  const contacts = await Contact.find({});
  return contacts;
};

export const getContactsById = async (contactId) => {
  const contact = await Contact.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await Contact.create(payload);
  return contact;
};

export const deleteContactById = async (contactId) => {
  await Contact.findByIdAndDelete(contactId);
};

export const upsertContact = async (contactId, payload, options = {}) => {
  const rawResult = await Contact.findByIdAndUpdate(contactId, payload, {
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
