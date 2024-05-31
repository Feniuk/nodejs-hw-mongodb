import { Router } from 'express';
import {
  getContactsController,
  getContactsByIdController,
  createContactController,
  deleteContactByIdController,
  patchSContactController,
} from '../controllers/contacts.js';

const router = Router();

const ctrlWrapper = (controller) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    next(error);
  }
};

router.get('/contacts', ctrlWrapper(getContactsController));
router.get('/contacts/:contactId', getContactsByIdController);
router.post('/contacts', ctrlWrapper(createContactController));
router.delete('/contacts/:contactId', ctrlWrapper(deleteContactByIdController));
router.patch('/contacts/:contactId', ctrlWrapper(patchSContactController));

export default router;
