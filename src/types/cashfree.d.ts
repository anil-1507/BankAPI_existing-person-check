export interface CashfreeAsyncResponse {
  reference_id: string;
  status: string;
}

export interface BankAccountDetails {
  account_number: string;
  ifsc: string;
  bank_name: string;
  city: string;
  branch: string;
  name_on_account: string;
}
