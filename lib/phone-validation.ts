/**
 * Phone number validation helper
 * Contains functions for validating phone numbers across the application
 */

/**
 * Validates if a phone number is correctly formatted
 * Currently checks if:
 * - The phone number is at least 8 digits long
 * - The phone number contains only digits, possibly with a leading +
 * 
 * @param phone The phone number to validate
 * @returns A boolean indicating if the phone number is valid
 */
export const isValidPhone = (phone: string): boolean => {
  return phone.length >= 8 && /^\+?\d+$/.test(phone);
};

/**
 * Formats a phone number for display
 * Currently just returns the phone number as is
 * 
 * @param phone The phone number to format
 * @returns The formatted phone number
 */
export const formatPhone = (phone: string): string => {
  return phone;
};

export default {
  isValidPhone,
  formatPhone
};
