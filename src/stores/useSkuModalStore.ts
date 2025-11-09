import { create } from "zustand";
import type { Sku } from "@/lib/supabase-types";

interface SkuModalState {
  isOpen: boolean;
  sku: Sku | null;
  openModal: (sku: Sku) => void;
  closeModal: () => void;
}

export const useSkuModalStore = create<SkuModalState>((set) => ({
  isOpen: false,
  sku: null,
  openModal: (sku) => set({ isOpen: true, sku }),
  closeModal: () => set({ isOpen: false, sku: null }),
}));
