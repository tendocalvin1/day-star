const jwt = require('jsonwebtoken');
const { AppError } = require('../../middleware/errorHandler');

jest.mock('../../models', () => ({
  UserModel: {
    findByIdSafe: jest.fn(),
  },
}));

const { UserModel } = require('../../models');
const { requireAuth, requireManager, requireBabysitter } = require('../../middleware/auth');

function mockRequest(headers = {}) {
  return { headers };
}

describe('auth middleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    UserModel.findByIdSafe.mockReset();
  });

  test('rejects request without Authorization header', async () => {
    const req = mockRequest();
    const next = jest.fn();

    await requireAuth(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Access denied. No token provided.');
    expect(err.statusCode).toBe(401);
  });

  test('rejects request with malformed Authorization header', async () => {
    const req = mockRequest({ authorization: 'Basic abc123' });
    const next = jest.fn();

    await requireAuth(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('Access denied. No token provided.');
    expect(err.statusCode).toBe(401);
  });

  test('rejects invalid JWT token through AppError', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new jwt.JsonWebTokenError('invalid token');
    });

    const req = mockRequest({ authorization: 'Bearer invalidtoken' });
    const next = jest.fn();

    await requireAuth(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Invalid token.');
    expect(err.statusCode).toBe(401);
  });

  test('rejects expired JWT token through AppError', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new jwt.TokenExpiredError('jwt expired', new Date(0));
    });

    const req = mockRequest({ authorization: 'Bearer expiredtoken' });
    const next = jest.fn();

    await requireAuth(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Token expired. Please log in again.');
    expect(err.statusCode).toBe(401);
  });

  test('rejects when user record is not found', async () => {
    jest.spyOn(jwt, 'verify').mockReturnValue({ userId: '1' });
    UserModel.findByIdSafe.mockResolvedValue(null);

    const req = mockRequest({ authorization: 'Bearer validtoken' });
    const next = jest.fn();

    await requireAuth(req, {}, next);

    expect(UserModel.findByIdSafe).toHaveBeenCalledWith('1');
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('User not found.');
    expect(err.statusCode).toBe(401);
  });

  test('rejects when user account is deactivated', async () => {
    jest.spyOn(jwt, 'verify').mockReturnValue({ userId: '2' });
    UserModel.findByIdSafe.mockResolvedValue({ id: 2, is_active: false });

    const req = mockRequest({ authorization: 'Bearer validtoken' });
    const next = jest.fn();

    await requireAuth(req, {}, next);

    expect(UserModel.findByIdSafe).toHaveBeenCalledWith('2');
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('Account is deactivated.');
    expect(err.statusCode).toBe(401);
  });

  test('attaches user to request and continues on valid token', async () => {
    const user = { id: 3, is_active: true };
    jest.spyOn(jwt, 'verify').mockReturnValue({ userId: '3' });
    UserModel.findByIdSafe.mockResolvedValue(user);

    const req = mockRequest({ authorization: 'Bearer validtoken' });
    const next = jest.fn();

    await requireAuth(req, {}, next);

    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledWith();
  });

  test('rejects non-manager users in requireManager', () => {
    const next = jest.fn();
    requireManager({ user: { role: 'babysitter' } }, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Access denied. Manager role required.');
    expect(err.statusCode).toBe(403);
  });

  test('rejects non-babysitter users in requireBabysitter', () => {
    const next = jest.fn();
    requireBabysitter({ user: { role: 'manager' } }, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Access denied. Babysitter role required.');
    expect(err.statusCode).toBe(403);
  });
});
