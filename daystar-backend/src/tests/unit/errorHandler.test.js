const { errorHandler, AppError } = require('../../middleware/errorHandler');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  test('redacts unexpected errors in production responses', () => {
    process.env.NODE_ENV = 'production';
    const req = { method: 'GET', path: '/api/test', user: { id: 1 } };
    const res = mockResponse();
    const err = new Error('select * from users where password_hash failed');
    err.code = 'XX000';

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
    });
  });

  test('keeps operational messages in production responses', () => {
    process.env.NODE_ENV = 'production';
    const req = { method: 'GET', path: '/api/test' };
    const res = mockResponse();

    errorHandler(new AppError('Resource not found.', 404), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Resource not found.',
    });
  });

  test('includes debug details in development responses', () => {
    process.env.NODE_ENV = 'development';
    const req = { method: 'GET', path: '/api/test' };
    const res = mockResponse();
    const err = new Error('Detailed developer error');
    err.code = 'DEV_TEST';

    errorHandler(err, req, res, jest.fn());

    const body = res.json.mock.calls[0][0];
    expect(body.message).toBe('Detailed developer error');
    expect(body.error).toMatchObject({ name: 'Error', code: 'DEV_TEST' });
    expect(body.stack).toBeDefined();
  });
});
