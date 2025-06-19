import express from 'express';
import { handleBankAccount } from '../controllers/controller';

const router = express.Router();

const asyncHandler = (fn: any) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/verify', asyncHandler(handleBankAccount));

export default router;
