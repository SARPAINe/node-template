import { validationResult } from "express-validator";
import { BadRequestError } from "../errors/index.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));
  throw new BadRequestError({
    message: "Received data is not valid",
    errors: extractedErrors,
  });
};
