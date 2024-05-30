import { Contact } from '../db/contact.js';

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
  // await Contact.deleteOne(contact);
};
