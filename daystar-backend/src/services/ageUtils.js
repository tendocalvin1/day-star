

/**
 * Age Utilities
 * Age is always calculated from date_of_birth - never stored as a field.
 */

/**
 * Calculate age in years from a date of birth string
 * @param {string} dateOfBirth - ISO date string e.g. "1998-05-14"
 * @returns {number} age in full years
 */
function calculateAge(dateOfBirth) {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  // If birthday hasn't occurred yet this year, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Validate babysitter age is within allowed range (21-35)
 * @param {string} dateOfBirth
 * @returns {{ valid: boolean, age: number, message?: string }}
 */
function validateBabysitterAge(dateOfBirth) {
  const age = calculateAge(dateOfBirth);
  const MIN_AGE = 21;
  const MAX_AGE = 35;

  if (age < MIN_AGE) {
    return {
      valid: false,
      age,
      message: `Babysitter must be at least ${MIN_AGE} years old. Provided date of birth gives age ${age}.`,
    };
  }
  if (age > MAX_AGE) {
    return {
      valid: false,
      age,
      message: `Babysitter must be no older than ${MAX_AGE} years. Provided date of birth gives age ${age}.`,
    };
  }
  return { valid: true, age };
}

/**
 * Calculate age of a child in months and years (for display)
 * @param {string} dateOfBirth
 * @returns {{ years: number, months: number, display: string }}
 */
function calculateChildAge(dateOfBirth) {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let display;
  if (years === 0) {
    display = `${months} month${months !== 1 ? 's' : ''}`;
  } else if (months === 0) {
    display = `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    display = `${years}y ${months}m`;
  }

  return { years, months, display };
}

module.exports = { calculateAge, validateBabysitterAge, calculateChildAge };