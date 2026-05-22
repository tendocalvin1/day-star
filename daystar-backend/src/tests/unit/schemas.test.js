

const { loginSchema, createChildSchema, createBabysitterSchema } = require('../../config/schemas');

describe('loginSchema', () => {
  test('accepts valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'manager@daystar.ug',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  test('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  test('rejects missing password', () => {
    const result = loginSchema.safeParse({
      email: 'manager@daystar.ug',
    });
    expect(result.success).toBe(false);
  });
});

describe('createChildSchema', () => {
  test('accepts valid child data', () => {
    const result = createChildSchema.safeParse({
      full_name: 'Test Child',
      date_of_birth: '2022-01-15',
      parent_name: 'Test Parent',
      parent_phone: '0700000001',
      session_type: 'full_day',
    });
    expect(result.success).toBe(true);
  });

  test('rejects invalid session type', () => {
    const result = createChildSchema.safeParse({
      full_name: 'Test Child',
      date_of_birth: '2022-01-15',
      parent_name: 'Test Parent',
      parent_phone: '0700000001',
      session_type: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  test('rejects invalid phone number', () => {
    const result = createChildSchema.safeParse({
      full_name: 'Test Child',
      date_of_birth: '2022-01-15',
      parent_name: 'Test Parent',
      parent_phone: '12345',
      session_type: 'full_day',
    });
    expect(result.success).toBe(false);
  });

  test('rejects invalid date format', () => {
    const result = createChildSchema.safeParse({
      full_name: 'Test Child',
      date_of_birth: '15-01-2022',
      parent_name: 'Test Parent',
      parent_phone: '0700000001',
      session_type: 'full_day',
    });
    expect(result.success).toBe(false);
  });
});

describe('createBabysitterSchema', () => {
  test('accepts valid babysitter data', () => {
    const result = createBabysitterSchema.safeParse({
      first_name: 'Grace',
      last_name: 'Nakato',
      phone: '0772123456',
      nin: 'CM97100200001',
      date_of_birth: '1998-05-14',
      next_of_kin_name: 'Sarah Nakato',
      next_of_kin_phone: '0701234567',
    });
    expect(result.success).toBe(true);
  });

  test('rejects invalid phone number', () => {
    const result = createBabysitterSchema.safeParse({
      first_name: 'Grace',
      last_name: 'Nakato',
      phone: '12345',
      nin: 'CM97100200001',
      date_of_birth: '1998-05-14',
      next_of_kin_name: 'Sarah Nakato',
      next_of_kin_phone: '0701234567',
    });
    expect(result.success).toBe(false);
  });
});