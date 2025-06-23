import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ICardStore } from "@/types";

export const useCreditCardStore = create<ICardStore>()(
  devtools(
    (set, get) => ({
      paymentCards: [],
      selectedCard: null,
      hasLinkedCreditCard: false,
      wallet: null,
      setField: (field: string, value: any) => set({ [field]: value }),
      setPaymentCards: (cards: any) => {
        set({ paymentCards: cards }, false, "credit-cards/setPaymentCards");
      },
      setSelectedCard: (card: any) => {
        set({ selectedCard: card }, false, "credit-cards/setSelectedCard");
      },
    }),
    { name: "credit-cards" }
  )
);