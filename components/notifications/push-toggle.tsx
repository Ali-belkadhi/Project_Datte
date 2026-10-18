"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Alerte } from "@/components/ui/feedback";
import { actionSouscrirePush, actionSupprimerPush } from "@/server/actions/notification.actions";
import { BellRing, BellOff, Loader2 } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushToggle({ vapidPublicKey }: { vapidPublicKey?: string }) {
  const [actif, setActif] = useState(false);
  const [support, setSupport] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  useEffect(() => {
    if (!vapidPublicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupport(false);
      return;
    }
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => setActif(Boolean(sub)))
      .catch(() => setActif(false));
  }, [vapidPublicKey]);

  if (!support) {
    return (
      <Alerte type="info">
        Les notifications push ne sont pas disponibles sur cet appareil ou ne sont pas encore
        configurées.
      </Alerte>
    );
  }

  function activer() {
    setErreur(null);
    setMessage(null);
    demarrer(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setErreur("Permission refusée pour les notifications.");
          return;
        }
        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!),
        });
        const json = sub.toJSON();
        const reponse = await actionSouscrirePush({
          endpoint: json.endpoint!,
          keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
        });
        if (!reponse.success) {
          setErreur(reponse.error ?? "Activation impossible");
          return;
        }
        setActif(true);
        setMessage(reponse.message ?? "Notifications push activées.");
      } catch {
        setErreur("Impossible d'activer les notifications push.");
      }
    });
  }

  function desactiver() {
    setErreur(null);
    setMessage(null);
    demarrer(async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (sub) {
          await actionSupprimerPush(sub.endpoint);
          await sub.unsubscribe();
        }
        setActif(false);
        setMessage("Notifications push désactivées.");
      } catch {
        setErreur("Désactivation impossible.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {message && <Alerte type="succes">{message}</Alerte>}
      {erreur && <Alerte type="erreur">{erreur}</Alerte>}
      {actif ? (
        <Button
          type="button"
          variant="outline"
          onClick={desactiver}
          disabled={enCours}
          className="rounded-full"
        >
          {enCours ? <Loader2 className="size-4 animate-spin" /> : <BellOff className="size-4" />}
          Désactiver les notifications push
        </Button>
      ) : (
        <Button type="button" onClick={activer} disabled={enCours} className="rounded-full">
          {enCours ? <Loader2 className="size-4 animate-spin" /> : <BellRing className="size-4" />}
          Activer les notifications push
        </Button>
      )}
    </div>
  );
}
