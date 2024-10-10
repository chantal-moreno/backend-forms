const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json(error.errors.map((err) => err.message));
    }
    return res.status(400).json({ message: 'Invalid request', error });
  }
};

module.exports = validateSchema;
