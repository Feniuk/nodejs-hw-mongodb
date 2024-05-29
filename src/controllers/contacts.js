import { getContacts, getContactsById } from '../services/contacts';
import mongoose from 'mongoose';

export const getContactsController = async (req, res) => {
  try {
    const contacts = await getContacts();
    res.status(200).json({
      status: res.statusCode,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

export const getContactsByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    res.status(404).json({
      message: 'Problem exists with contact id!',
    });
    return;
  }
  const contact = await getContactsById(contactId);

  if (!contact) {
    return res.status(404).json({
      status: 404,
      message: `Contact with id ${contactId} not found!`,
    });
  }

  res.status(200).json({
    status: res.statusCode,
    message: `Successfully found contact with id: ${contactId}!`,
    data: contact,
  });
};
