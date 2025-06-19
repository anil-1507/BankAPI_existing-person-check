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

    const data = verifyResponse.data.data;

    // Step 3: Save to DB
    const saved = await Verification.create({
      name: data.name,
      bankAccount,
      ifsc,
      phone,
      userId,
      status: 'VERIFIED',
    });

    return res.status(201).json({
      message: 'Verified via Cashfree and saved',
      data: {
        name: data.name,
        bankAccount,
        ifsc,
        phone,
        userId,
        status: 'VERIFIED',
      },
    });
  } catch (err) {
    console.error('Verification failed:', err);
    return res.status(500).json({
      message: 'Verification failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};
