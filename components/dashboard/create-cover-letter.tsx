"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateCoverLetterButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="md"
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch("/api/cover-letters", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({}),
          });
          const json = await res.json();
          if (json?.letter?.id) {
            router.push(`/dashboard/cover-letters/${json.letter.id}`);
            router.refresh();
          }
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy}
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
      New cover letter
    </Button>
  );
}
