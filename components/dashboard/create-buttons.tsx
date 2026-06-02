"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Loader2, FileText, Globe2, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateProjectButtons({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const create = async (
    kind: "resume" | "portfolio" | "case-study",
    endpoint: string,
    redirectPrefix: string,
    payloadKey: string
  ) => {
    setBusy(kind);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (res.ok && json[payloadKey]?.id) {
        router.push(`${redirectPrefix}/${json[payloadKey].id}`);
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  };

  const Spinner = ({ k }: { k: string }) =>
    busy === k ? <Loader2 className="size-3.5 animate-spin" /> : null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => create("resume", "/api/resumes", "/dashboard/resumes", "resume")}
          disabled={busy !== null}
        >
          <Plus className="size-3.5" />
          New
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="md"
        onClick={() => create("resume", "/api/resumes", "/dashboard/resumes", "resume")}
        disabled={busy !== null}
      >
        {busy === "resume" ? <Spinner k="resume" /> : <FileText className="size-3.5" />}
        New resume
      </Button>
      <Button
        size="md"
        variant="secondary"
        onClick={() => create("portfolio", "/api/portfolios", "/dashboard/portfolios", "portfolio")}
        disabled={busy !== null}
      >
        {busy === "portfolio" ? <Spinner k="portfolio" /> : <Globe2 className="size-3.5" />}
        New portfolio
      </Button>
      <Button
        size="md"
        variant="secondary"
        onClick={() =>
          create("case-study", "/api/case-studies", "/dashboard/case-studies", "study")
        }
        disabled={busy !== null}
      >
        {busy === "case-study" ? (
          <Spinner k="case-study" />
        ) : (
          <ScrollText className="size-3.5" />
        )}
        New case study
      </Button>
    </div>
  );
}
