export const isValidPhoneNumber = (value: string): boolean => /^0\d{9}$/.test(value);

export const isValidCitizenId = (value: string): boolean => /^\d{12}$/.test(value);

export const sanitizeDigits = (value: string, maxLength: number): string =>
  value.replace(/\D/g, '').slice(0, maxLength);

export const sanitizeFullName = (value: string): string =>
  value.replace(/\d/g, '');
