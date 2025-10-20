export const ENUMS = {
  TENANTS: ["TENANT1", "TENANT2", "TENANT3", "TENANT4"],
  SOURCES: ["FIREWALL", "API", "CROWDSTRIKE", "AWS", "M365", "AD", "NETWORK"],
  ACTIONS: ["ALLOW", "DENY", "CREATE", "DELETE", "UPDATE", "ALERT", "LOGIN", "QUARANTINE", "BLOCK"],
  SEVERITIES: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
  TIMESTAMP_ORDERS: ["asc", "desc"],
};

export const validateEnum = (value, enumType, allowedSpecialValues = []) => {
  if (!value) return { isValid: true, error: null };
  
  const validValues = ENUMS[enumType];
  if (!validValues) {
    return { isValid: false, error: `Unknown enum type: ${enumType}` };
  }

  if (allowedSpecialValues.includes(value) || validValues.includes(value)) {
    return { isValid: true, error: null };
  }

  const allAllowed = [...validValues, ...allowedSpecialValues];
  return {
    isValid: false,
    error: `Invalid value. Must be one of: ${allAllowed.join(", ")}`,
  };
};

export const validateNumber = (value, min = 1, max = 500) => {
  if (!value) return { isValid: true, error: null, parsed: null };
  
  const parsed = parseInt(value);
  if (isNaN(parsed) || parsed < min || parsed > max) {
    return {
      isValid: false,
      error: `Must be a number between ${min} and ${max}`,
      parsed: null,
    };
  }

  return { isValid: true, error: null, parsed };
};

const validateDateFormat = (value) => {
  if (!value) return { isValid: true, error: null };
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { isValid: false, error: "Invalid format. Must be YYYY-MM-DD" };
  }

  return { isValid: true, error: null };
};

export const validateLogQuery = (query) => {
  const errors = [];
  const parsedValues = {};

  const limitValidation = validateNumber(query.limit, 1, 500);
  if (!limitValidation.isValid) {
    errors.push(`limit: ${limitValidation.error}`);
  } else {
    parsedValues.limit = limitValidation.parsed || 50;
  }

  const tenantValidation = validateEnum(query.tenant, "TENANTS", ["ALL_TENANTS"]);
  if (!tenantValidation.isValid) {
    errors.push(`tenant: ${tenantValidation.error}`);
  }

  const sourceValidation = validateEnum(query.source, "SOURCES", ["ALL"]);
  if (!sourceValidation.isValid) {
    errors.push(`source: ${sourceValidation.error}`);
  }

  const actionValidation = validateEnum(query.action, "ACTIONS", ["ALL"]);
  if (!actionValidation.isValid) {
    errors.push(`action: ${actionValidation.error}`);
  }

  const severityValidation = validateEnum(query.severity, "SEVERITIES", ["ALL"]);
  if (!severityValidation.isValid) {
    errors.push(`severity: ${severityValidation.error}`);
  }

  const tsValidation = validateEnum(query.ts, "TIMESTAMP_ORDERS");
  if (!tsValidation.isValid) {
    errors.push(`ts: ${tsValidation.error}`);
  } else {
    parsedValues.ts = query.ts || "desc";
  }

  const dateValidation = validateDateFormat(query.date);
  if (!dateValidation.isValid) {
    errors.push(`date: ${dateValidation.error}`);
  }

  const startDateValidation = validateDateFormat(query.startDate);
  if (!startDateValidation.isValid) {
    errors.push(`startDate: ${startDateValidation.error}`);
  }

  const endDateValidation = validateDateFormat(query.endDate);
  if (!endDateValidation.isValid) {
    errors.push(`endDate: ${endDateValidation.error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    parsedValues,
  };
};