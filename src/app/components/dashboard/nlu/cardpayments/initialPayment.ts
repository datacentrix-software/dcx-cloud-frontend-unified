
import { useAuthStore } from '@/store';
import axios from "axios";

interface CardDetails {
  email: string;
  organisationId: number,
  pin: string,
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
}

interface TokenizeCardResponse {
  message: string;
  authorization_code?: string;
  error?: string;
  status: boolean;
}

export async function tokenizeCard(
  data: CardDetails
): Promise<TokenizeCardResponse> {
    const authUser: any = useAuthStore((state) => state.user);
    console.log(":",data)
  try {
    const chargeData = {
      email: data.email ,
      organisationId: data.organisationId,
      pin: "1234",
      card: {
        number: data.card_number,
        expiry_month: data.expiry_month,
        expiry_year: data.expiry_year,
        cvv: data.cvv,
      },
    };

    const saveCardResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/payment/savecard`,
      {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
        params: chargeData
      }
    );
   
    const subscriptionResponse = saveCardResponse.data;

    if (!subscriptionResponse.status) {
      return {
        error: "Failed to process trasection",
        message: "Subscription failed",
        status: false
      };
    }
    const authorization_code = subscriptionResponse.authorizationCode
    

    return {
      message: "Subscription created successfully",
      status: true
    };
  } catch (error: any) {
    return {
      error: error?.response?.data?.message || "Unknown error occurred",
      message: "An error occurred",
      status: false
    };
  }
}
