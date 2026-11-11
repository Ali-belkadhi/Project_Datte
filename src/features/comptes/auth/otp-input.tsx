"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { useAction } from "@/hooks/use-action";
import { renvoyerCodeVerification, verifierOtp } from "@/server/modules/comptes/actions";

/** Vérification OTP à 6 cases + compte à rebours pour renvoyer le code. */
export function OtpInput({ email, suite }: { email: string; suite: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [reste, setReste] = useState(45);
  const { run, pending } = useAction(verifierOtp, { onSuccess: () => router.push(suite) });
  const renvoi = useAction(renvoyerCodeVerification);

  useEffect(() => {
    if (reste <= 0) return;
    const t = setTimeout(() => setReste((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [reste]);

  return (
    <div className="space-y-6">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-accent-foreground">
        <MessageSquareText className="size-6" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Vérifiez votre e-mail</h1>
        <p className="text-muted-foreground">
          Saisissez le code à 6 chiffres envoyé à <span className="font-semibold text-foreground">{email}</span>.
        </p>
      </div>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void run({ email, code });
        }}
      >
        <InputOTP maxLength={6} value={code} onChange={setCode} aria-label="Code de vérification" containerClassName="justify-center sm:justify-start">
          <InputOTPGroup>
            {[0, 1, 2].map((i) => (
              <InputOTPSlot key={i} index={i} className="size-12 text-lg" />
            ))}
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            {[3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} className="size-12 text-lg" />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={code.length < 6 || pending}>
          {pending ? "Vérification…" : "Vérifier"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Vous n&apos;avez rien reçu ?{" "}
        {reste > 0 ? (
          <span className="tabular-nums">Renvoyer le code dans 0:{String(reste).padStart(2, "0")}</span>
        ) : (
          <button
            type="button"
            className="font-semibold text-date hover:underline"
            disabled={renvoi.pending}
            onClick={() => {
              setReste(45);
              void renvoi.run({ email });
            }}
          >
            Renvoyer le code
          </button>
        )}
      </p>
    </div>
  );
}
