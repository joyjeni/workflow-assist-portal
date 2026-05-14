"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicationStep1Schema,
  applicationStep2Schema,
  applicationStep3Schema,
  applicationCategories,
} from "@/lib/validators";
import { Stepper } from "@/components/StepperForm";
import { z } from "zod";

type Step1 = z.infer<typeof applicationStep1Schema>;
type Step2 = z.infer<typeof applicationStep2Schema>;
type Step3 = z.infer<typeof applicationStep3Schema>;

const STEP_LABELS = ["Application", "Applicant", "Details"];

export function NewApplicationWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<Step1 & Step2 & Step3>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="space-y-5">
      <Stepper steps={STEP_LABELS} current={step} />
      <div className="card p-5">
        {step === 0 && (
          <StepOne
            defaults={data}
            onNext={(v) => {
              setData((d) => ({ ...d, ...v }));
              setStep(1);
            }}
          />
        )}
        {step === 1 && (
          <StepTwo
            defaults={data}
            onBack={() => setStep(0)}
            onNext={(v) => {
              setData((d) => ({ ...d, ...v }));
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <StepThree
            defaults={data}
            onBack={() => setStep(1)}
            submitting={submitting}
            onSaveDraft={async (v) => {
              await submitApp({ ...data, ...v }, "draft");
            }}
            onSubmit={async (v) => {
              await submitApp({ ...data, ...v }, "submit");
            }}
          />
        )}
        {serverError && (
          <div role="alert" className="error mt-3">{serverError}</div>
        )}
      </div>
    </div>
  );

  async function submitApp(values: Partial<Step1 & Step2 & Step3>, action: "draft" | "submit") {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");
      window.location.href = `/dashboard/applications/${json.application.id}`;
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }
}

function StepOne({ defaults, onNext }: { defaults: Partial<Step1>; onNext: (v: Step1) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step1>({
    resolver: zodResolver(applicationStep1Schema),
    defaultValues: defaults,
  });
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-4">
      <div>
        <label className="label" htmlFor="category">Category</label>
        <select id="category" className="select" {...register("category")}>
          <option value="">Select a category…</option>
          {applicationCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <div className="error">{errors.category.message}</div>}
      </div>
      <div>
        <label className="label" htmlFor="title">Short title</label>
        <input id="title" className="input" placeholder="e.g. Affordable housing subsidy" {...register("title")} />
        <p className="help">A brief summary for your own reference.</p>
        {errors.title && <div className="error">{errors.title.message}</div>}
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary">Continue</button>
      </div>
    </form>
  );
}

function StepTwo({ defaults, onBack, onNext }: { defaults: Partial<Step2>; onBack: () => void; onNext: (v: Step2) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step2>({
    resolver: zodResolver(applicationStep2Schema),
    defaultValues: defaults,
  });
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" className="input" {...register("fullName")} />
          {errors.fullName && <div className="error">{errors.fullName.message}</div>}
        </div>
        <div>
          <label className="label" htmlFor="dob">Date of birth</label>
          <input id="dob" type="date" className="input" {...register("dateOfBirth")} />
          {errors.dateOfBirth && <div className="error">{errors.dateOfBirth.message}</div>}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="nationalId">National ID</label>
          <input id="nationalId" className="input" {...register("nationalId")} />
          {errors.nationalId && <div className="error">{errors.nationalId.message}</div>}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="addr1">Address line 1</label>
          <input id="addr1" className="input" {...register("addressLine1")} />
          {errors.addressLine1 && <div className="error">{errors.addressLine1.message}</div>}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="addr2">Address line 2 (optional)</label>
          <input id="addr2" className="input" {...register("addressLine2")} />
        </div>
        <div>
          <label className="label" htmlFor="city">City</label>
          <input id="city" className="input" {...register("city")} />
          {errors.city && <div className="error">{errors.city.message}</div>}
        </div>
        <div>
          <label className="label" htmlFor="state">State</label>
          <input id="state" className="input" {...register("state")} />
          {errors.state && <div className="error">{errors.state.message}</div>}
        </div>
        <div>
          <label className="label" htmlFor="postal">Postal code</label>
          <input id="postal" className="input" {...register("postalCode")} />
          {errors.postalCode && <div className="error">{errors.postalCode.message}</div>}
        </div>
      </div>
      <div className="flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={onBack}>Back</button>
        <button type="submit" className="btn btn-primary">Continue</button>
      </div>
    </form>
  );
}

function StepThree({
  defaults,
  onBack,
  onSaveDraft,
  onSubmit,
  submitting,
}: {
  defaults: Partial<Step3>;
  onBack: () => void;
  onSaveDraft: (v: Step3) => void;
  onSubmit: (v: Step3) => void;
  submitting: boolean;
}) {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Step3>({
    resolver: zodResolver(applicationStep3Schema),
    defaultValues: defaults,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className="label" htmlFor="reason">Reason for application</label>
        <textarea
          id="reason"
          rows={5}
          className="textarea"
          placeholder="Describe your situation and what you are requesting."
          {...register("reason")}
        />
        <p className="help">At least 30 characters — clear, specific context speeds up review.</p>
        {errors.reason && <div className="error">{errors.reason.message}</div>}
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="label" htmlFor="income">Declared income (₹/yr)</label>
          <input id="income" type="number" className="input" {...register("declaredIncome")} />
        </div>
        <div>
          <label className="label" htmlFor="household">Household size</label>
          <input id="household" type="number" className="input" {...register("householdSize")} />
        </div>
        <div>
          <label className="label" htmlFor="prev">Prior applications</label>
          <input id="prev" type="number" className="input" {...register("prevApplications")} />
        </div>
      </div>
      <div className="flex justify-between flex-wrap gap-2">
        <button type="button" className="btn btn-ghost" onClick={onBack}>Back</button>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={submitting}
            onClick={() => onSaveDraft(getValues())}
          >
            Save draft
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit application"}
          </button>
        </div>
      </div>
    </form>
  );
}
