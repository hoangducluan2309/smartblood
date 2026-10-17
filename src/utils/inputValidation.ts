export const isValidPhoneNumber = (value: string): boolean => /^\d{10}$/.test(value);

export const isValidCitizenId = (value: string): boolean => /^\d{12}$/.test(value);

export const sanitizeDigits = (value: string, maxLength: number): string =>
  value.replace(/\D/g, '').slice(0, maxLength);
