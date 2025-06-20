import { Request, Response } from 'express';
import axios from 'axios';
import Verification from '../models/data';

export const handleBankAccount = async (req: Request, res: Response) => {
  const { bankAccount, ifsc, phone, userId } = req.body;

  try {
    // Step 1: Check if record already exists in DB
    const existing = await Verification.findOne({ bankAccount, ifsc });

    if (existing) {
      return res.status(200).json({
        message: 'Account already exists',
        data: {
          phone: existing.phone,
        },
      });
    }

    // Step 2: Call Cashfree for verification
const tokenResponse = await axios.post(
  `https://sandbox.cashfree.com/pg/v1/authenticate`, // ✅ Corrected
  {},
  {
    headers: {
      'x-client-id': process.env.CASHFREE_CLIENT_ID!,
      'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
    },
  }
);

    const token = tokenResponse.data.data.token;

    const verifyResponse = await axios.post(
      `https://sandbox.cashfree.com/pg/bankaccount/validate`,
      {
        bankAccount,
        ifsc,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    import { Request, Response } from 'express';
import axios from 'axios';
import Verification from '../models/data';

export const handleBankAccount = async (req: Request, res: Response) => {
  const { bankAccount, ifsc, phone, userId } = req.body;

  try {
    // 1. Check DB
    const existing = await Verification.findOne({ bankAccount, ifsc });
    if (existing) {
      return res.status(200).json({
        message: 'Account already exists',
        data: { phone: existing.phone },
      });
    }

    // 2. Get token
    const tokenResponse = await axios.post(
      `${process.env.CASHFREE_BASE_URL}/pg/v1/authenticate`,
      {},
      {
        headers: {
          'x-client-id': process.env.CASHFREE_CLIENT_ID!,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
        },
      }
    );
    const token = tokenResponse.data.data.token;

    // 3. Call verification API
    const verifyResponse = await axios.post(
      `${process.env.CASHFREE_BASE_URL}/pg/bankaccount/validate`,
      {
        bank_account: bankAccount,
        ifsc: ifsc,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = verifyResponse.data;
    const data = result.data;

    // 4. Handle SUCCESS
    if (result.status === 'SUCCESS') {
      const saved = await Verification.create({
        name: data.name_on_account,
        bankAccount,
        ifsc,
        bankName: data.bank_name,
        branch: data.branch,
        city: data.city,
        phone,
        userId,
        status: 'VERIFIED',
      });

      return res.status(201).json({
        message: 'Verified via Cashfree and saved',
        data: saved,
      });
    }

    // 5. Handle FAILURE
    const savedFailed = await Verification.create({
      bankAccount,
      ifsc,
      phone,
      userId,
      status: 'FAILED',
      reason: result.message || 'Verification failed',
    });

    return res.status(400).json({
      message: 'Verification failed via Cashfree',
      reason: result.message,
    });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

