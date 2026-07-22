"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Confirmation wrapper for destructive/state-changing admin quick actions.
 *  `formAction` is a plain server action bound to the inner <form> — same
 *  convention as the rest of the admin panel's fire-and-forget actions. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  formAction,
  hiddenFields,
  confirmClassName = "rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-dark",
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  formAction: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  confirmClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-grey-100 px-4 py-2 text-sm font-semibold text-grey-600 transition hover:border-primary hover:text-primary"
          >
            Cancel
          </button>
          <form action={formAction} onSubmit={() => setOpen(false)}>
            {Object.entries(hiddenFields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <button type="submit" className={confirmClassName}>
              {confirmLabel}
            </button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
