import { Router } from 'express';
import {
  getContactsController,
  getContactsByIdController,
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

export default router;
