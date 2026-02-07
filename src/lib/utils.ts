import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | undefined) {
  if (!dateString) return "N/A";
  const justDate = dateString.split("T")[0];
  if (!justDate) return "N/A";
  const [year, month, day] = justDate.split("-");
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
export function formatDateForInput(dateString: string | undefined) {
  if (!dateString) return "";
  return dateString.split("T")[0]; 
}
export function formatISOForBackend(dateString: string) {
    if (!dateString) return "";
    return `${dateString}T00:00:00Z`;
}