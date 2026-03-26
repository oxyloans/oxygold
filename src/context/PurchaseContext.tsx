import { createContext, useContext, useState, ReactNode } from 'react';

interface PurchaseContextType {
  purchasePrice: number;
  setPurchasePrice: (price: number) => void;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider = ({ children }: { children: ReactNode }) => {
  const [purchasePrice, setPurchasePrice] = useState(16372.53);

  return (
    <PurchaseContext.Provider value={{ purchasePrice, setPurchasePrice }}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchasePrice = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchasePrice must be used within PurchaseProvider');
  }
  return context;
};
