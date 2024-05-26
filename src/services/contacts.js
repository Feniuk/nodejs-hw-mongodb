import Contact from '../db/contact.js';

export const getContacts = async () => {
  const contacts = await Contact.find({});
  return contacts;
};

export const getContactsById = async (contactId) => {
  const contact = await Contact.findById(contactId);
  return contact;
};
