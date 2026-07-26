"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

export function SubmitButton({
  idleLabel,
  pendingLabel,
  className = "button button-primary button-block",
}: {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className}
      type="submit"
      disabled={pending}
      aria-busy={pending}
    >
      {pending && <LoaderCircle className="submit-spinner" size={17} />}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
