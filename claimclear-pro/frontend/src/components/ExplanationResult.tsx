import { useState } from "react";
import {
  Copy,
  Check,
  Download,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import type { ClaimResponse } from "../types";

interface ExplanationResultProps {
  result: ClaimResponse;
}

/** Circular gauge for the comprehension score. */
function ComprehensionGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75
      ? "text-emerald-500"
      : score >= 50
        ? "text-amber-500"
        : "text-red-500";

  const label =
    score >= 75 ? "Easy to read" : score >= 50 ? "Moderate" : "Complex";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-gray-200"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`gauge-ring ${color}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">
            {Math.round(score)}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            / 100
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700">
          Comprehension Score
        </p>
        <p className={`text-xs font-medium ${color}`}>{label}</p>
      </div>
    </div>
  );
}

export default function ExplanationResult({ result }: ExplanationResultProps) {
  const [copied, setCopied] = useState(false);
  const [openGlossary, setOpenGlossary] = useState<Record<number, boolean>>(
    {}
  );

  const timeSavedMinutes = Math.max(3, Math.round(result.processing_time_ms / 1000) + 4);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(result.explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadAsText() {
    const blob = new Blob([result.explanation], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claim-explanation-${result.request_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleGlossary(idx: number) {
    setOpenGlossary((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <Clock className="h-4 w-4 text-brand-600" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Processing
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {(result.processing_time_ms / 1000).toFixed(1)}s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <Zap className="h-4 w-4 text-amber-500" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Time Saved
            </p>
            <p className="text-sm font-semibold text-gray-800">
              ~{timeSavedMinutes} min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <BookOpen className="h-4 w-4 text-teal-600" />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Glossary
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {result.glossary.length} terms
            </p>
          </div>
        </div>
      </div>

      {/* Main content: explanation + gauge */}
      <div className="grid gap-6 lg:grid-cols-[1fr_180px]">
        {/* Explanation card */}
        <div className="animate-slide-up rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Plain-Language Explanation
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={downloadAsText}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            {result.explanation.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* Comprehension gauge */}
        <div className="flex items-start justify-center lg:pt-4">
          <ComprehensionGauge score={result.comprehension_score} />
        </div>
      </div>

      {/* Glossary accordion */}
      {result.glossary.length > 0 && (
        <div className="animate-slide-up animation-delay-150 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <BookOpen className="h-5 w-5 text-teal-600" />
              Insurance Glossary
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {result.glossary.map((item, idx) => (
              <div key={idx}>
                <button
                  onClick={() => toggleGlossary(idx)}
                  className="flex w-full items-center justify-between px-6 py-3 text-left transition hover:bg-gray-50"
                >
                  <span className="text-sm font-semibold text-brand-700">
                    {item.term}
                  </span>
                  {openGlossary[idx] ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {openGlossary[idx] && (
                  <div className="animate-fade-in px-6 pb-3 text-sm text-gray-600">
                    {item.definition}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request ID footer */}
      <p className="text-center text-xs text-gray-400">
        Request ID: {result.request_id}
      </p>
    </div>
  );
}
