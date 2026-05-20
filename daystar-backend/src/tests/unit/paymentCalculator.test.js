

// tests/unit/paymentCalculator.test.js
const { calculatePayment, RATES } = require('../../src/services/paymentCalculator');

describe('calculatePayment', () => {
  test('calculates half day payment correctly', () => {
    const result = calculatePayment(3, 0);
    expect(result.amount_ugx).toBe(3 * RATES.half_day);
  });

  test('calculates full day payment correctly', () => {
    const result = calculatePayment(0, 2);
    expect(result.amount_ugx).toBe(2 * RATES.full_day);
  });

  test('calculates mixed session payment correctly', () => {
    const result = calculatePayment(2, 3);
    expect(result.amount_ugx).toBe(
      (2 * RATES.half_day) + (3 * RATES.full_day)
    );
  });

  test('returns zero for no children', () => {
    const result = calculatePayment(0, 0);
    expect(result.amount_ugx).toBe(0);
  });
});