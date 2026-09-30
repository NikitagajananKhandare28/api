function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(value) {
  return isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateRegister(body) {
  const errors = [];
  if (!isValidEmail(body.email)) errors.push('A valid email is required.');
  if (!isNonEmptyString(body.password) || body.password.length < 6) {
    errors.push('Password is required and must be at least 6 characters.');
  }
  return errors;
}

function validateLogin(body) {
  const errors = [];
  if (!isValidEmail(body.email)) errors.push('A valid email is required.');
  if (!isNonEmptyString(body.password)) errors.push('Password is required.');
  return errors;
}

function validateTaskCreate(body) {
  const errors = [];
  if (!isNonEmptyString(body.title)) errors.push('Title is required and cannot be empty.');
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('Description must be a string.');
  }
  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    errors.push('Completed must be a boolean.');
  }
  return errors;
}

function validateTaskUpdate(body) {
  const errors = [];
  if (body.title !== undefined && !isNonEmptyString(body.title)) {
    errors.push('Title cannot be empty.');
  }
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('Description must be a string.');
  }
  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    errors.push('Completed must be a boolean.');
  }
  if (Object.keys(body).length === 0) {
    errors.push('Provide at least one field to update.');
  }
  return errors;
}

module.exports = { validateRegister, validateLogin, validateTaskCreate, validateTaskUpdate };
