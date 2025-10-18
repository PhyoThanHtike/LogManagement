// utils/helpers.js
import { Action, Tenant } from "@prisma/client";

export function toAction(input) {
  if (!input) return undefined;
  
  const actionMap = {
    'allow': Action.ALLOW,
    'deny': Action.DENY,
    'create': Action.CREATE,
    'delete': Action.DELETE,
    'update': Action.UPDATE,
    'alert': Action.ALERT,
    'login': Action.LOGIN,
    'quarantine': Action.QUARANTINE,
    'block': Action.BLOCK,
  };
  
  return actionMap[String(input).toLowerCase()];
}

export function toTenant(input) {
    if(!input) return undefined;
    const tenantMap = {
        'tenant1': Tenant.TENANT1,
        'tenant2': Tenant.TENANT2,
        'tenant3': Tenant.TENANT3,
        'tenant4': Tenant.TENANT4
    };

    return tenantMap[String(input).toLowerCase()];
}

export function to0to10(input) {
  if (input === undefined || input === null) return undefined;
  
  const num = Number(input);
  if (isNaN(num)) return undefined;
  
  // Map common severity scales to 0-10
  if (num >= 0 && num <= 10) return num;
  if (num >= 0 && num <= 100) return Math.round(num / 10);
  if (num >= 0 && num <= 5) return num * 2; // 0-5 scale to 0-10
  
  return Math.min(10, Math.max(0, Math.round(num / 10)));
}

export function num(input) {
  if (input === undefined || input === null) return undefined;
  const num = Number(input);
  return isNaN(num) ? undefined : num;
}

export function parseTimestamp(timestamp) {
  if (!timestamp) return new Date();
  
  try {
    // Handle ISO strings, Unix timestamps, and various date formats
    if (typeof timestamp === 'number') {
      return new Date(timestamp * (timestamp < 10000000000 ? 1000 : 1)); // Handle seconds vs milliseconds
    }
    
    if (typeof timestamp === 'string') {
      // Try ISO format first
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) return date;
      
      // Try common log formats
      const formats = [
        /^(\w{3}) (\d{1,2}) (\d{2}:\d{2}:\d{2})$/,
        /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})/,
      ];
      
      for (const format of formats) {
        const match = timestamp.match(format);
        if (match) {
          const parsed = new Date(match[1]);
          if (!isNaN(parsed.getTime())) return parsed;
        }
      }
    }
    
    return new Date();
  } catch {
    return new Date();
  }
}

