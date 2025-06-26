
import axios from 'axios';

interface FetchTransactionsParams {
  email: string;
  fromDate: string;
  toDate: string;
  status: string;
}

const PAYSTACK_SECRET_KEY = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY || '';

export async function fetchTransactionsApi({
  email,
  fromDate,
  toDate,
  status,
}: FetchTransactionsParams): Promise<any> {
  try {
    const baseUrl = 'https://api.paystack.co/transaction';
    const queryParams =
      status === 'all'
        ? `?email=${email}&from=${fromDate}&to=${toDate}&reduced_fields=true`
        : `?email=${email}&status=${status}&from=${fromDate}&to=${toDate}&reduced_fields=true`;

    const url = `${baseUrl}${queryParams}`;

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    };

    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch transactions');
  }
}
