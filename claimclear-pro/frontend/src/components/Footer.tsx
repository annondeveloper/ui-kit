import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>ClaimClear AI Pro &mdash; Powered by OpenAI</span>
          </div>
          <p className="text-xs text-gray-400">
            AI-generated explanations are for informational purposes only and do
            not constitute legal or financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
