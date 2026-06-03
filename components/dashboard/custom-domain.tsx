"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Check,
  Loader2,
  Copy,
  Trash2,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DomainState = {
  customDomain: string | null;
  domainVerified: boolean;
};

export function CustomDomainPanel({
  portfolioId,
  initial,
}: {
  portfolioId: string;
  initial: DomainState;
}) {
  const router = useRouter();
  const [state, setState] = useState<DomainState>(initial);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vercelConfigured, setVercelConfigured] = useState<boolean | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Poll verification every 30s while a domain is set but unverified
  useEffect(() => {
    if (!state.customDomain || state.domainVerified) return;
    const t = setInterval(async () => {
      const res = await fetch(`/api/portfolios/${portfolioId}/domain`);
      if (!res.ok) return;
      const json = await res.json();
      if (json?.portfolio) {
        setState({
          customDomain: json.portfolio.customDomain,
          domainVerified: !!json.portfolio.domainVerified,
        });
        setVercelConfigured(!!json.vercelConfigured);
        if (json.portfolio.domainVerified) router.refresh();
      }
    }, 30000);
    return () => clearInterval(t);
  }, [state.customDomain, state.domainVerified, portfolioId, router]);

  // Fetch config status on mount
  useEffect(() => {
    let abort = false;
    (async () => {
      const res = await fetch(`/api/portfolios/${portfolioId}/domain`);
      if (!res.ok || abort) return;
      const json = await res.json();
      if (json?.portfolio) {
        setState({
          customDomain: json.portfolio.customDomain,
          domainVerified: !!json.portfolio.domainVerified,
        });
        setVercelConfigured(!!json.vercelConfigured);
      }
    })();
    return () => { abort = true; };
  }, [portfolioId]);

  const connect = async () => {
    if (!draft.trim()) return;
    setBusy("connect");
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/domain`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: draft.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Couldn't connect this domain.");
        return;
      }
      setState({
        customDomain: json.portfolio.customDomain,
        domainVerified: !!json.portfolio.domainVerified,
      });
      setVercelConfigured(!!json.vercelConfigured);
      setDraft("");
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect this custom domain?")) return;
    setBusy("disconnect");
    try {
      await fetch(`/api/portfolios/${portfolioId}/domain`, { method: "DELETE" });
      setState({ customDomain: null, domainVerified: false });
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const recheck = async () => {
    setBusy("recheck");
    const res = await fetch(`/api/portfolios/${portfolioId}/domain`);
    if (res.ok) {
      const json = await res.json();
      if (json?.portfolio) {
        setState({
          customDomain: json.portfolio.customDomain,
          domainVerified: !!json.portfolio.domainVerified,
        });
        router.refresh();
      }
    }
    setBusy(null);
  };

  const copy = (key: string, value: string) => {
    navigator.clipboard?.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <Globe className="size-3.5 text-brand-violet" />
          Custom domain
        </h3>
        {state.customDomain && (
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full",
              state.domainVerified
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
            )}
          >
            {state.domainVerified ? "Live" : "Pending verification"}
          </span>
        )}
      </div>

      {!state.customDomain ? (
        <>
          <p className="text-xs text-white/55">
            Use your own domain instead of <code>careerora.vercel.app/p/…</code>.
            We&apos;ll show you the DNS records to set.
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.02] border border-white/10 focus-within:border-brand-violet/50 px-3 h-10">
            <Globe className="size-3.5 text-white/40" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="yourname.com"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          {error && (
            <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
              {error}
            </p>
          )}
          <Button size="sm" onClick={connect} disabled={busy !== null || !draft.trim()} className="w-full">
            {busy === "connect" ? <Loader2 className="size-3.5 animate-spin" /> : <Globe className="size-3.5" />}
            Connect domain
          </Button>
        </>
      ) : (
        <>
          <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/45">Connected</p>
            <p className="mt-0.5 text-sm font-medium break-all">{state.customDomain}</p>
            {state.domainVerified && (
              <a
                href={`https://${state.customDomain}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 text-xs gradient-text inline-flex items-center gap-1 hover:underline"
              >
                Open site
              </a>
            )}
          </div>

          {!state.domainVerified && (
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 space-y-2">
              <p className="text-xs text-white/85 font-medium">
                Point your DNS at us
              </p>
              <p className="text-[11px] text-white/55">
                In your domain registrar, add this CNAME record:
              </p>
              <div className="space-y-1.5">
                <DnsRow label="Type" value="CNAME" />
                <DnsRow label="Name" value="@ or www" copy={() => copy("name", "www")} copied={copied === "name"} />
                <DnsRow
                  label="Value"
                  value="cname.vercel-dns.com"
                  copy={() => copy("value", "cname.vercel-dns.com")}
                  copied={copied === "value"}
                />
              </div>
              <p className="text-[10px] text-white/40 mt-2">
                We re-check every 30s. Verification usually takes 1–5 minutes after
                DNS propagates.
              </p>
              {vercelConfigured === false && (
                <p className="text-[11px] text-amber-300 inline-flex items-start gap-1 mt-2">
                  <AlertCircle className="size-3 mt-0.5 shrink-0" />
                  <span>
                    Vercel Domains API isn&apos;t configured on this deployment, so
                    the domain isn&apos;t yet bound to the project. Add it manually
                    in Vercel &rarr; Settings &rarr; Domains for now, or set{" "}
                    <code>VERCEL_API_TOKEN</code> on the server.
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={recheck} disabled={busy !== null} className="flex-1">
              {busy === "recheck" ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCcw className="size-3.5" />}
              Re-check
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={disconnect}
              disabled={busy !== null}
              className="text-rose-300 hover:bg-rose-500/10"
            >
              {busy === "disconnect" ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              Disconnect
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function DnsRow({
  label,
  value,
  copy,
  copied,
}: {
  label: string;
  value: string;
  copy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-white/45 w-12 shrink-0">{label}</span>
      <code className="flex-1 px-2 py-1 rounded bg-ink-950/60 border border-white/5 break-all">{value}</code>
      {copy && (
        <button
          onClick={copy}
          className="size-6 rounded-md text-white/40 hover:text-white inline-flex items-center justify-center"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
        </button>
      )}
    </div>
  );
}
