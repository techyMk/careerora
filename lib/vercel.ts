/**
 * Optional Vercel Domains API integration.
 *
 * When `VERCEL_API_TOKEN` and `VERCEL_PROJECT_ID` are set, custom-domain
 * connection happens automatically — Vercel issues SSL + handles routing.
 *
 * When they're NOT set, the app still lets users save a custom domain;
 * the user just has to add the domain to their Vercel project manually
 * (UI tells them so honestly).
 */

const VERCEL_API = "https://api.vercel.com";

export const hasVercelDomainsApi = !!(
  process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID
);

function teamQuery() {
  return process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : "";
}

async function vercelFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("Vercel API not configured");
  const res = await fetch(`${VERCEL_API}${path}${teamQuery()}`, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string> | undefined),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok && res.status !== 409) {
    const text = await res.text();
    throw new Error(`Vercel API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export type AddDomainResult = {
  name: string;
  verified?: boolean;
  verification?: { type: string; domain: string; value: string; reason: string }[];
};

export async function addDomain(name: string): Promise<AddDomainResult> {
  const projectId = process.env.VERCEL_PROJECT_ID!;
  return vercelFetch<AddDomainResult>(`/v10/projects/${projectId}/domains`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function getDomain(name: string): Promise<AddDomainResult> {
  const projectId = process.env.VERCEL_PROJECT_ID!;
  return vercelFetch<AddDomainResult>(`/v9/projects/${projectId}/domains/${name}`);
}

export async function verifyDomain(name: string): Promise<{ verified: boolean }> {
  const projectId = process.env.VERCEL_PROJECT_ID!;
  return vercelFetch<{ verified: boolean }>(
    `/v9/projects/${projectId}/domains/${name}/verify`,
    { method: "POST" }
  );
}

export async function removeDomain(name: string): Promise<boolean> {
  const projectId = process.env.VERCEL_PROJECT_ID!;
  try {
    await vercelFetch(`/v9/projects/${projectId}/domains/${name}`, {
      method: "DELETE",
    });
    return true;
  } catch {
    return false;
  }
}
