import { SORT_ORDER } from '../constants/index.js';

const getValidatedSortOrder = (order) => {
  return [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(order)
    ? order
    : SORT_ORDER.ASC;
};

const getValidatedSortBy = (field) => {
  const validFields = [
    '_id',
    'name',
    'phoneNumber',
    'email',
    'isFavourite',
    'contactType',
  ];

  return validFields.includes(field) ? field : '_id';
};

export const extractSortParams = (queryParams) => {
  const { sortOrder: inputOrder, sortBy: inputField } = queryParams;

  const validatedOrder = getValidatedSortOrder(inputOrder);
  const validatedField = getValidatedSortBy(inputField);

  return {
    sortOrder: validatedOrder,
    sortBy: validatedField,
  };
};
