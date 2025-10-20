import { validateLogQuery, validateNumber, validateEnum } from "../utils/queryValidator.js";

export const validateLogQueryMiddleware = (req, res, next) => {
  const validation = validateLogQuery(req.query);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors: validation.errors,
    });
  }

  req.parsedQuery = validation.parsedValues;
  next();
};

export const validateTenantQueryMiddleware = (req, res, next) => {
  const errors = [];

  const limitValidation = validateNumber(req.query.limit, 1, 500);
  if (!limitValidation.isValid) {
    errors.push(`limit: ${limitValidation.error}`);
  } else {
    req.parsedQuery = { limit: limitValidation.parsed || 50 };
  }

  const tenantValidation = validateEnum(req.query.tenant, "TENANTS", ["ALL_TENANTS"]);
  if (!tenantValidation.isValid) {
    errors.push(`tenant: ${tenantValidation.error}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors,
    });
  }

  next();
};