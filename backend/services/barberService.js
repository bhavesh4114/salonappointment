import prisma from '../prisma/client.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { REGISTRATION_FEE_PAISE } from './paymentService.js';

// Allowed categories
const ALLOWED_CATEGORIES = [
  'Hair Salon',
  'Men Salon',
  'Women Salon',
  'Unisex Salon',
  'Spa',
  'Beauty Care Parlour'
];

/**
 * Validate categories
 * @param {string[]} categories - Array of category names
 * @returns {Object} - { valid: boolean, invalidCategories: string[] }
 */
const validateCategories = (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return { valid: false, invalidCategories: [], message: 'At least one category is required' };
  }

  const invalidCategories = categories.filter(
    cat => !ALLOWED_CATEGORIES.includes(cat)
  );

  if (invalidCategories.length > 0) {
    return {
      valid: false,
      invalidCategories,
      message: `Invalid categories: ${invalidCategories.join(', ')}`
    };
  }

  return { valid: true, invalidCategories: [] };
};

/**
 * Create or get category by name
 * @param {string} categoryName - Category name
 * @param {Object} tx - Prisma transaction client
 * @returns {Promise<Object>} - Category object
 */
const getOrCreateCategory = async (categoryName, tx) => {
  return await tx.category.upsert({
    where: { name: categoryName },
    update: {},
    create: { name: categoryName }
  });
};

/**
 * Register a new barber (with mandatory payment verification)
 * @param {Object} registrationData - Barber registration data
 * @param {string} registrationData.fullName - Full name
 * @param {string} registrationData.mobileNumber - Mobile number
 * @param {string} registrationData.email - Email (optional)
 * @param {string} registrationData.password - Password
 * @param {string} registrationData.shopName - Shop name
 * @param {string} registrationData.shopAddress - Shop address
 * @param {string[]} registrationData.categories - Array of category names
 * @param {string} registrationData.paymentId - Payment ID from payment gateway (REQUIRED)
 * @param {string} [registrationData.orderId] - Order ID from payment gateway (OPTIONAL)
 * @returns {Promise<Object>} - Created barber data
 */
export const registerBarber = async (registrationData) => {
  const {
    fullName,
    mobileNumber,
    email,
    password,
    shopName,
    shopAddress,
    categories,
    paymentId,
    orderId
  } = registrationData;

  // Validate payment ID (ONLY paymentId required)
  if (!paymentId || !paymentId.trim()) {
    throw new Error('Payment ID is required');
  }

  // Check if payment already used (prevent duplicate registrations)
  const existingPayment = await prisma.barberPayment.findFirst({
    where: {
      paymentId: paymentId.trim(),
      status: 'SUCCESS'
    }
  });

  if (existingPayment) {
    throw new Error('This payment has already been used for a registration.');
  }

  // Validate categories
  const categoryValidation = validateCategories(categories);
  if (!categoryValidation.valid) {
    throw new Error(categoryValidation.message);
  }

  // Check for duplicate mobile number or email in Barber table only
  const existingBarber = await prisma.barber.findFirst({
    where: {
      OR: [
        { mobileNumber },
        ...(email ? [{ email }] : [])
      ]
    }
  });

  if (existingBarber) {
    if (existingBarber.mobileNumber === mobileNumber) {
      throw new Error('Barber already exists with this mobile number');
    }
    if (email && existingBarber.email === email) {
      throw new Error('Barber already exists with this email');
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Use Prisma transaction to ensure atomicity - ALL or NOTHING




 // Use Prisma transaction to ensure atomicity - ALL or NOTHING
const result = await prisma.$transaction(async (tx) => {



  // 🔥 2️⃣ Create BARBER linked with USER
  const barber = await tx.barber.create({
    data: {
      
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email ? email.trim() : null,
      password: hashedPassword,
      shopName: shopName.trim(),
      shopAddress: shopAddress.trim()
    }
  });

  // 🔥 3️⃣ Create payment record
  await tx.barberPayment.create({
    data: {
      barberId: barber.id,
      amount: REGISTRATION_FEE_PAISE,
      status: 'SUCCESS',
      paymentId: paymentId.trim(),
      orderId: orderId ? orderId.trim() : null
    }
  });

  // 🔥 4️⃣ Categories
  const categoryRecords = await Promise.all(
    categories.map(name => getOrCreateCategory(name, tx))
  );

  await Promise.all(
    categoryRecords.map(cat =>
      tx.barberCategory.create({
        data: {
          barberId: barber.id,
          categoryId: cat.id
        }
      })
    )
  );

  // 🔥 5️⃣ Final response
  return tx.barber.findUnique({
    where: { id: barber.id },
    include: {
      categories: { include: { category: true } },
      payments: {
        where: { status: 'SUCCESS' },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });
});





  return result;
};

/**
 * Get allowed categories list
 * @returns {string[]} - Array of allowed category names
 */
export const getAllowedCategories = () => {
  return [...ALLOWED_CATEGORIES];
};

/**
 * Login a barber
 * @param {Object} loginData - Barber login data
 * @param {string} [loginData.mobileNumber] - Mobile number
 * @param {string} [loginData.email] - Email
 * @param {string} loginData.password - Password
 * @returns {Promise<Object>} - Barber data (without password)
 */
export const loginBarber = async (loginData) => {
  const { mobileNumber, email, password } = loginData;

  // Validate that at least one identifier is provided
  if (!mobileNumber && !email) {
    throw new Error('Please provide mobile number or email');
  }

  // Validate password
  if (!password || !password.trim()) {
    throw new Error('Password is required');
  }

  // Find barber by mobile number or email
  const barber = await prisma.barber.findFirst({
    where: mobileNumber ? { mobileNumber: mobileNumber.trim() } : { email: email.trim() },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  });

  if (!barber) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, barber.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Return barber data (without password)
  const { password: _, ...barberData } = barber;
  return barberData;
};
