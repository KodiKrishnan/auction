import { isRequired } from './rules';  // ← only if you use rules inside validate.js

export const validate = (data = {}, schema = {}) => {
  const errors = {};

  Object.keys(schema).forEach((field) => {
    const rules = schema[field];
    const value = data[field];

    for (let rule of rules) {
      const { test, message } = rule;
      if (!test(value, data)) {
        errors[field] = message;
        break;
      }
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const firstError = (errors = {}) =>
  Object.values(errors)[0] || null;