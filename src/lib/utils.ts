import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isPromise(obj: unknown): obj is Promise<unknown> {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof (obj as Promise<unknown>).then === "function"
  );
}
