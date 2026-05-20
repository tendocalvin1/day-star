

// tests/unit/ageUtils.test.js
const { validateBabysitterAge, calculateAge, calculateChildAge } = require('../../services/ageUtils');

describe('validateBabysitterAge', () => {
  test('accepts babysitter aged 25', () => {
    const dob = '2000-01-01';
    const result = validateBabysitterAge(dob);
    expect(result.valid).toBe(true);
  });

  test('rejects babysitter aged 18', () => {
    const dob = '2007-01-01';
    const result = validateBabysitterAge(dob);
    expect(result.valid).toBe(false);
  });

  test('rejects babysitter aged 40', () => {
    const dob = '1985-01-01';
    const result = validateBabysitterAge(dob);
    expect(result.valid).toBe(false);
  });
});