interface IProduct {
    id: string;
    title: string;
    price: number;
    cost: number;
    categoryId: string;
    code: string;
    profit: number;
    createdAt: string;
    updatedAt: string;
    units: number;
    Category: {
      name: string;
    };
    type?: string;
  }

// Simplified product interface for components that don't need all IProduct fields
interface ISimpleProduct {
    id: number;
    title: string;
    cost: number;
    price: number;
    profit: number;
    type?: string;
    Category?: {
      name: string;
    };
}
  
export type { IProduct, ISimpleProduct };