import { create } from 'zustand';

export interface BillItem {
  id: string;
  medicineId: string;
  medicineName: string;
  batchId: string;
  batchNumber: string;
  expiryDate: Date;
  mrp: number;
  quantity: number;
  rate: number;
  discount: number;
  gstPercentage: number;
  cgst: number;
  sgst: number;
  amount: number;
}

interface BillingState {
  items: BillItem[];
  customerId: string | null;
  discount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  notes: string;
  
  addItem: (item: BillItem) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  updateItemDiscount: (id: string, discount: number) => void;
  setCustomerId: (customerId: string | null) => void;
  setDiscount: (discount: number) => void;
  setPaymentMode: (mode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT') => void;
  setNotes: (notes: string) => void;
  clearBill: () => void;
  
  getSubtotal: () => number;
  getTotalDiscount: () => number;
  getTotalCGST: () => number;
  getTotalSGST: () => number;
  getTotal: () => number;
  getRoundedTotal: () => number;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  items: [],
  customerId: null,
  discount: 0,
  paymentMode: 'CASH',
  notes: '',
  
  addItem: (item) => set((state) => {
    const existingIndex = state.items.findIndex(
      (i) => i.medicineId === item.medicineId && i.batchId === item.batchId
    );
    
    if (existingIndex >= 0) {
      const newItems = [...state.items];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + item.quantity,
        amount: (newItems[existingIndex].quantity + item.quantity) * newItems[existingIndex].rate * (1 - newItems[existingIndex].discount / 100),
        cgst: ((newItems[existingIndex].quantity + item.quantity) * newItems[existingIndex].rate * (1 - newItems[existingIndex].discount / 100)) * (item.gstPercentage / 2 / 100),
        sgst: ((newItems[existingIndex].quantity + item.quantity) * newItems[existingIndex].rate * (1 - newItems[existingIndex].discount / 100)) * (item.gstPercentage / 2 / 100),
      };
      return { items: newItems };
    }
    
    return { items: [...state.items, item] };
  }),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
  })),
  
  updateItemQuantity: (id, quantity) => set((state) => ({
    items: state.items.map((i) =>
      i.id === id
        ? {
            ...i,
            quantity,
            amount: quantity * i.rate * (1 - i.discount / 100),
            cgst: quantity * i.rate * (1 - i.discount / 100) * (i.gstPercentage / 2 / 100),
            sgst: quantity * i.rate * (1 - i.discount / 100) * (i.gstPercentage / 2 / 100),
          }
        : i
    ),
  })),
  
  updateItemDiscount: (id, discount) => set((state) => ({
    items: state.items.map((i) =>
      i.id === id
        ? {
            ...i,
            discount,
            amount: i.quantity * i.rate * (1 - discount / 100),
            cgst: i.quantity * i.rate * (1 - discount / 100) * (i.gstPercentage / 2 / 100),
            sgst: i.quantity * i.rate * (1 - discount / 100) * (i.gstPercentage / 2 / 100),
          }
        : i
    ),
  })),
  
  setCustomerId: (customerId) => set({ customerId }),
  setDiscount: (discount) => set({ discount }),
  setPaymentMode: (paymentMode) => set({ paymentMode }),
  setNotes: (notes) => set({ notes }),
  clearBill: () => set({
    items: [],
    customerId: null,
    discount: 0,
    paymentMode: 'CASH',
    notes: '',
  }),
  
  getSubtotal: () => {
    const state = get();
    return state.items.reduce((sum, item) => sum + (item.amount - item.cgst - item.sgst), 0);
  },
  
  getTotalDiscount: () => {
    const state = get();
    return state.items.reduce((sum, item) => sum + item.discount, 0) + state.discount;
  },
  
  getTotalCGST: () => {
    const state = get();
    return state.items.reduce((sum, item) => sum + item.cgst, 0);
  },
  
  getTotalSGST: () => {
    const state = get();
    return state.items.reduce((sum, item) => sum + item.sgst, 0);
  },
  
  getTotal: () => {
    const state = get();
    return state.items.reduce((sum, item) => sum + item.amount, 0) - state.discount;
  },
  
  getRoundedTotal: () => {
    const state = get();
    const total = state.items.reduce((sum, item) => sum + item.amount, 0) - state.discount;
    return Math.round(total);
  },
}));
