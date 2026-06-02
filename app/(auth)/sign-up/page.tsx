import { getEnabledProviders } from "@/lib/providers";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  const providers = getEnabledProviders();
  return <SignUpForm enabledProviders={providers} />;
}
