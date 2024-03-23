import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "./CustomAPIError.js";

export class BadRequestError extends CustomAPIError {
  constructor({
    statusCode = StatusCodes.BAD_REQUEST,
    message = "Bad Request",
    errors = [],
  }) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
