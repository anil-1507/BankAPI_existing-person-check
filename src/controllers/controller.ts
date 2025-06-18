import { Request, Response } from 'express';
import axios from 'axios';
import Verification from '../models/data';

// Initiate verification or return existing one
export const verifyBankAccount = async (req: Request, res: Response) => {
  const { bankAccount, ifsc, name, userId, phone } = req.body;

  try {
    // Step 1: Check if already exists
    const existing = await Verification.findOne({ bankAccount, ifsc });

    if (existing) {
      return res.status(200).json({
        message: 'Account already verified',
        data: {
          name: existing.name,
          phone: existing.phone,
          status: existing.status,
          referenceId: existing.referenceId,
        },
      });
    }

    // Step 2: Make Cashfree call
    const response = await axios.post(
      `https://sandbox.cashfree.com/verification/bank-account/async`,
      {
        bank_account: bankAccount,
        ifsc,
        name,
        user_id: userId,
        phone,
      },
      {
        headers: {
          'x-client-id': process.env.CASHFREE_CLIENT_ID!,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
          'Content-Type': 'application/json',
        },
      }
    );

    const { reference_id, status } = response.data;

    // Step 3: Save to DB
    const saved = await Verification.create({
      name,
      bankAccount,
      ifsc,
      phone,
      userId,
      referenceId: reference_id,
      status,
    });

    return res.status(200).json({
      message: 'Verification initiated',
      referenceId: reference_id,
      data: saved,
    });
  } catch (err) {
    console.error('Verification failed:', err);
    return res.status(500).json({
      message: 'Verification failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

// Check status by reference ID
export const checkVerificationStatus = async (req: Request, res: Response) => {
  const { refId } = req.params;

  try {
    const response = await axios.get(
      `${process.env.CASHFREE_BASE_URL}/bank-account/${refId}`,
      {
        headers: {
          'x-client-id': process.env.CASHFREE_CLIENT_ID!,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
        },
      }
    );

    const { status, bank_account_details } = response.data;

    await Verification.findOneAndUpdate(
      { referenceId: refId },
      { status },
      { new: true }
    );

    return res.status(200).json({
      message: 'Status fetched',
      status,
      details: bank_account_details,
    });
  } catch (err) {
    console.error('Status fetch failed:', err);
    return res.status(500).json({
      message: 'Failed to get verification status',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};
