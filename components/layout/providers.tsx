"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

function Toast() {
  const { toast, dismissToast, openCart } = useUIStore();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 2800);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-forest py-2.5 pl-4 pr-2.5 text-sm text-cream shadow-lux"
          >
            <CheckCircle2 className="size-4 text-gold-light" />
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => {
                dismissToast();
                openCart();
              }}
              className="rounded-full bg-cream/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-cream/20"
            >
              Voir le panier
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1] }}>
        {children}
        <Toast />
      </MotionConfig>
    </SessionProvider>
  );
}
