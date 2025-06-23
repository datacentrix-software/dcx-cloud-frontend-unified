interface IPaymentCard {
    id: number;
    organisationId: number;
    authorizationCode: string;
    last4: string;
    brand: string;
    expMonth: string;
    expYear: string;
    bank: string;
    reusable: boolean;
    isDefault: boolean;
    createdAt: string;
}

interface ICardStore {
    paymentCards: IPaymentCard[]
    selectedCard: IPaymentCard | null
    hasLinkedCreditCard: boolean
    wallet: {
        balance: number
        currency: string
        updatedAt: string
    }
    setField: (field: string, value: any) => void,
    setPaymentCards: (cards: IPaymentCard[]) => void
    setSelectedCard: (card: IPaymentCard) => void
}

export type { IPaymentCard, ICardStore }