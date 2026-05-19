

const { z } = require('zod');

// ── Shared primitives ──────────────────────────────────────────────────────

const ugxAmount = z
  .number({ required_error: 'Amount is required' })
  .int('Amount must be a whole number (UGX has no decimal)')
  .positive('Amount must be greater than 0');

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const sessionType = z.enum(['half_day', 'full_day'], {
  errorMap: () => ({ message: "Session type must be 'half_day' or 'full_day'" }),
});

const ugandaPhone = z
  .string()
  .regex(/^(0|\+256)[0-9]{9}$/, 'Enter a valid Uganda phone number (e.g. 0712345678)');

// ── Auth ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Babysitters ────────────────────────────────────────────────────────────

const createBabysitterSchema = z.object({
  first_name: z.string().min(2).max(100).trim(),
  last_name: z.string().min(2).max(100).trim(),
  email: z.string().email().optional().nullable(),
  phone: ugandaPhone,
  nin: z.string().min(8).max(20).trim().toUpperCase(),
  date_of_birth: isoDate,
  next_of_kin_name: z.string().min(2).max(200).trim(),
  next_of_kin_phone: ugandaPhone,
  // Optional: create a user account for this babysitter
  create_account: z.boolean().optional().default(false),
  account_email: z.string().email().optional(),
  account_password: z.string().min(8).optional(),
});

const updateBabysitterSchema = createBabysitterSchema.partial();

// ── Children ───────────────────────────────────────────────────────────────

const createChildSchema = z.object({
  full_name: z.string().min(2).max(200).trim(),
  date_of_birth: isoDate,
  parent_name: z.string().min(2).max(200).trim(),
  parent_phone: ugandaPhone,
  parent_email: z.string().email().optional().nullable(),
  session_type: sessionType,
  special_needs: z.string().max(1000).optional().nullable(),
});

const updateChildSchema = createChildSchema.partial();

// ── Attendance ─────────────────────────────────────────────────────────────

const checkInSchema = z.object({
  child_id: z.number().int().positive(),
  babysitter_id: z.number().int().positive().optional().nullable(),
  date: isoDate,
  session_type: sessionType,
  check_in_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be in HH:MM or HH:MM:SS format')
    .optional(),
});

const checkOutSchema = z.object({
  check_out_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be in HH:MM or HH:MM:SS format')
    .optional(),
});

// ── Income ─────────────────────────────────────────────────────────────────

const createIncomeSchema = z.object({
  child_id: z.number().int().positive().optional().nullable(),
  amount_ugx: ugxAmount,
  session_type: sessionType,
  payment_date: isoDate,
  payment_method: z.enum(['cash', 'mobile_money']).default('cash'),
  notes: z.string().max(500).optional().nullable(),
});

// ── Expenses ───────────────────────────────────────────────────────────────

const expenseCategories = ['babysitter_salary', 'toys_materials', 'maintenance', 'utilities', 'other'];

const createExpenseSchema = z.object({
  category: z.enum(expenseCategories, {
    errorMap: () => ({ message: `Category must be one of: ${expenseCategories.join(', ')}` }),
  }),
  description: z.string().min(3).max(500).trim(),
  amount_ugx: ugxAmount,
  expense_date: isoDate,
});

const updateExpenseSchema = createExpenseSchema.partial();

// ── Budgets ────────────────────────────────────────────────────────────────

const createBudgetSchema = z.object({
  category: z.enum(expenseCategories),
  period: z.enum(['monthly', 'weekly']).default('monthly'),
  amount_ugx: ugxAmount,
  start_date: isoDate,
  end_date: isoDate,
}).refine((data) => data.end_date >= data.start_date, {
  message: 'end_date must be after or equal to start_date',
  path: ['end_date'],
});

// ── Incidents ──────────────────────────────────────────────────────────────

const createIncidentSchema = z.object({
  child_id: z.number().int().positive(),
  description: z.string().min(10).max(2000).trim(),
  severity: z.enum(['low', 'medium', 'high']).default('low'),
});

const resolveIncidentSchema = z.object({
  resolution_notes: z.string().min(5).max(1000).trim(),
});

// ── Date range query ───────────────────────────────────────────────────────

const dateRangeSchema = z.object({
  start: isoDate,
  end: isoDate,
});


const dateQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
});

const dateRangeQuerySchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
});


module.exports = {
  loginSchema,
  createBabysitterSchema,
  updateBabysitterSchema,
  createChildSchema,
  updateChildSchema,
  checkInSchema,
  checkOutSchema,
  createIncomeSchema,
  createExpenseSchema,
  updateExpenseSchema,
  createBudgetSchema,
  createIncidentSchema,
  resolveIncidentSchema,
  dateRangeSchema,
  dateQuerySchema,
  dateRangeQuerySchema,
};