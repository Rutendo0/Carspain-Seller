import { create } from "zustand";

interface UsePortalProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const usePortal = create<UsePortalProps>((set)=>({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({isOpen: false}),
}));