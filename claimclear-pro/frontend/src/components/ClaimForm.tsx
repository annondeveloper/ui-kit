import { useState, useEffect, type FormEvent } from "react";
import {
  Send,
  Loader2,
  FileText,
  User,
  DollarSign,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  Beaker,
} from "lucide-react";
import { fetchSamples } from "../api/client";
import type { ClaimRequest, SampleClaim } from "../types";

interface ClaimFormProps {
  onSubmit: (data: ClaimRequest) => void;
  isLoading: boolean;
}

const EMPTY_FORM: ClaimRequest = {
  claim_id: "",
  customer_name: "",
  policy_type: "",
  claim_amount: 0,
  decision: "",
  decision_reason: "",
  policy_terms: "",
  tone: "empathetic",
  reading_level: "8th grade",
};

export default function ClaimForm({ onSubmit, isLoading }: ClaimFormProps) {
  const [form, setForm] = useState<ClaimRequest>(EMPTY_FORM);
  const [samples, setSamples] = useState<SampleClaim[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSamples()
      .then((res) => setSamples(res.samples))
      .catch(() => {
        /* samples are optional */
      });
  }, []);

  function fillSample(sample: SampleClaim) {
    setForm({
      claim_id: sample.claim_id,
      customer_name: sample.customer_name,
      policy_type: sample.policy_type,
      claim_amount: sample.claim_amount,
      decision: sample.decision,
      decision_reason: sample.decision_reason,
      policy_terms: sample.policy_terms,
      tone: sample.tone,
      reading_level: sample.reading_level,
    });
    setErrors({});
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.claim_id.trim()) e.claim_id = "Required";
    if (!form.customer_name.trim()) e.customer_name = "Required";
    if (!form.policy_type.trim()) e.policy_type = "Required";
    if (form.claim_amount <= 0) e.claim_amount = "Must be positive";
    if (!form.decision.trim()) e.decision = "Required";
    if (!form.decision_reason.trim()) e.decision_reason = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(form);
  }

  function field(
    label: string,
    name: keyof ClaimRequest,
    icon: React.ReactNode,
    opts?: {
      type?: string;
      textarea?: boolean;
      placeholder?: string;
    }
  ) {
    const value = form[name];
    const err = errors[name];

    const shared =
      "w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition " +
      "placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 " +
      (err ? "border-red-400" : "border-gray-300");

    return (
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          {icon}
          {label}
        </label>
        {opts?.textarea ? (
          <textarea
            className={shared + " min-h-[90px] resize-y"}
            value={value as string}
            placeholder={opts.placeholder}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          />
        ) : (
          <input
            className={shared}
            type={opts?.type ?? "text"}
            value={opts?.type === "number" ? (value as number) || "" : (value as string)}
            placeholder={opts?.placeholder}
            onChange={(e) =>
              setForm({
                ...form,
                [name]:
                  opts?.type === "number"
                    ? parseFloat(e.target.value) || 0
                    : e.target.value,
              })
            }
          />
        )}
        {err && <p className="text-xs text-red-500">{err}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick-fill sample claims */}
      {samples.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
            <Beaker className="h-4 w-4" />
            Quick-fill with a sample claim:
          </p>
          <div className="flex flex-wrap gap-2">
            {samples.map((s) => (
              <button
                key={s.claim_id}
                type="button"
                onClick={() => fillSample(s)}
                className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100 hover:shadow-sm"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Claim identification */}
      <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Claim Information
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("Claim ID", "claim_id", <FileText className="h-4 w-4 text-gray-400" />, {
            placeholder: "CLM-2024-XXXXX",
          })}
          {field("Customer Name", "customer_name", <User className="h-4 w-4 text-gray-400" />, {
            placeholder: "Jane Doe",
          })}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("Policy Type", "policy_type", <BookOpen className="h-4 w-4 text-gray-400" />, {
            placeholder: "e.g. Comprehensive Auto Insurance",
          })}
          {field("Claim Amount ($)", "claim_amount", <DollarSign className="h-4 w-4 text-gray-400" />, {
            type: "number",
            placeholder: "4250.00",
          })}
        </div>
      </fieldset>

      {/* Decision details */}
      <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Decision Details
        </legend>
        {field("Decision", "decision", <CheckCircle2 className="h-4 w-4 text-gray-400" />, {
          placeholder: "Approved / Denied / Partially Approved",
        })}
        {field("Decision Reason", "decision_reason", <MessageSquare className="h-4 w-4 text-gray-400" />, {
          textarea: true,
          placeholder: "Detailed reason for the claim decision...",
        })}
        {field("Relevant Policy Terms", "policy_terms", <BookOpen className="h-4 w-4 text-gray-400" />, {
          textarea: true,
          placeholder: "Section references and relevant policy language...",
        })}
      </fieldset>

      {/* Explanation preferences */}
      <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Explanation Preferences
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              Tone
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            >
              <option value="empathetic">Empathetic</option>
              <option value="formal">Formal</option>
              <option value="simple">Simple</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <BookOpen className="h-4 w-4 text-gray-400" />
              Reading Level
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={form.reading_level}
              onChange={(e) =>
                setForm({ ...form, reading_level: e.target.value })
              }
            >
              <option value="5th grade">5th Grade</option>
              <option value="8th grade">8th Grade</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 to-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition-all hover:shadow-xl hover:shadow-brand-700/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating Explanation...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            Generate Explanation
          </>
        )}
      </button>
    </form>
  );
}
