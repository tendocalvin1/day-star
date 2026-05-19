
/**
 * Validation middleware factory
 * Wraps Zod schemas into Express middleware.
 * 
 * Usage:
 *   router.post('/children', validate(childSchema), childController.create)
 * 
 * On failure → passes ZodError to global error handler
 * On success → attaches validated data to req.validatedData
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      req.validatedData = schema.parse(req.body);
      next();
    } catch (error) {
      next(error); // ZodError → errorHandler.js handles it
    }
  };
}

/**
 * Validate query parameters
 */
function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { validate, validateQuery };