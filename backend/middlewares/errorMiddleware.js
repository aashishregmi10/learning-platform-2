import { env } from "../config/env.config.js";

export const NOT_FOUND_HANDLER = (req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const ERROR_HANDLER = (error, req, res, next) => {
  let message = error?.message || "Something went wrong";
  let errors;

  // Mongo duplicate key
  if (error?.code === 11000 && error?.keyValue) {
    const fields = Object.keys(error.keyValue).join(", ");
    message = `Field(s) already exist. Duplicate ${fields}.`;
    errors = error.keyValue;
    res.status(409);
  }

  // Mongoose validation (required / cast)
  if (error?.name === "ValidationError" && error?.errors) {
    const fieldErrors = {};
    Object.keys(error.errors).forEach((key) => {
      fieldErrors[key] = error.errors[key]?.message;
    });
    const required = Object.keys(error.errors).filter(
      (k) => error.errors[k]?.kind === "required"
    );
    message = required.length
      ? `Missing required fields: ${required.join(", ")}`
      : "Validation failed";
    errors = fieldErrors;
    res.status(422);
  }

  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    message,
    ...(errors && { errors }),
    ...(env.nodeEnv !== "production" && { stack: error.stack }),
  });
};
