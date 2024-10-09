const z = require('zod');

const signUpSchema = z.object({
  firstName: z.string({
    required_error: 'First Name is require',
  }),
  lastName: z.string({
    required_error: 'Last Name is require',
  }),
  email: z
    .string({
      required_error: 'Email is require',
    })
    .email({
      message: 'Invalid email',
    }),
  password: z.string({
    required_error: 'Password is require',
  }),
});

const signInSchema = z.object({
  email: z
    .string({
      required_error: 'Email is require',
    })
    .email({
      message: 'Invalid email',
    }),
  password: z.string({
    required_error: 'Password is require',
  }),
});

module.exports = { signUpSchema, signInSchema };
