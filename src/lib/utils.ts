import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
}

export function isPromise(obj: unknown): obj is Promise<unknown> {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof (obj as Promise<unknown>).then === "function"
  );
}
