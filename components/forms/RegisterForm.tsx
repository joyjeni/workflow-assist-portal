"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { useState } from "react";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error || "Registration failed");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className="label" htmlFor="fullName">Full name</label>
        <input id="fullName" className="input" aria-invalid={!!errors.fullName} {...register("fullName")} />
        {errors.fullName && <div className="error">{errors.fullName.message}</div>}
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" className="input" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email && <div className="error">{errors.email.message}</div>}
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone (optional)</label>
        <input id="phone" className="input" {...register("phone")} />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="input"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <p className="help">Minimum 8 characters with an uppercase letter and a digit.</p>
        {errors.password && <div className="error">{errors.password.message}</div>}
      </div>
      {serverError && <div role="alert" className="error">{serverError}</div>}
      <button className="btn btn-primary w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
