export type LeadStatus = "NEW" | "CONTACTED" | "REPLIED" | "WON" | "LOST";
export type EmailStatus = "SENT" | "FAILED" | "BOUNCED";
export type ActivityType = "EMAIL_SENT" | "STATUS_CHANGED" | "NOTE_ADDED";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string;
}