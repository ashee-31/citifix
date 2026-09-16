import type { Complaint, ComplaintEvent } from "@/lib/types";

/**
 * Maps complaint events to citizen-facing notifications.
 *
 * Every important lifecycle event generates a privacy-safe notification
 * for the complaint reporter. Notifications never include private identity
 * information.
 */

type NotifyResult = {
  title: string;
  body: string;
  href: string;
};

/**
 * Map a complaint event type to a citizen notification message.
 * Returns null if the event should not generate a citizen notification.
 */
export function eventToNotification(
  event: Pick<ComplaintEvent, "type" | "title">,
  complaint: Pick<Complaint, "complaint_number">,
): NotifyResult | null {
  const num = complaint.complaint_number;
  const href = `/complaints/${num}`;

  switch (event.type) {
    case "COMPLAINT_SUBMITTED":
      return {
        title: "Complaint submitted",
        body: `Your complaint ${num} has been received and is being processed.`,
        href,
      };
    case "AI_EVIDENCE_VERIFIED":
      return {
        title: "AI evidence verified",
        body: `The AI system has verified evidence for ${num}. It is now in the accountability loop.`,
        href,
      };
    case "ASSIGNED":
      return {
        title: "Complaint assigned",
        body: `${num} has been assigned to the responsible authority department.`,
        href,
      };
    case "WORK_STARTED":
      return {
        title: "Work started",
        body: `Work has begun on resolving ${num}.`,
        href,
      };
    case "RESOLUTION_SUBMITTED":
      return {
        title: "Resolution submitted",
        body: `The authority has submitted resolution evidence for ${num}. Your review is requested.`,
        href,
      };
    case "AI_RESOLUTION_REVIEWED":
      return {
        title: "AI reviewed resolution",
        body: `The AI system has reviewed the resolution evidence for ${num}.`,
        href,
      };
    case "PUBLIC_REVIEW":
      return {
        title: "Opened for public review",
        body: `${num} resolution evidence is now open for your review. Approve it or request a reopen.`,
        href,
      };
    case "RESOLVED":
      return {
        title: "Complaint resolved",
        body: `${num} has been approved and marked as resolved.`,
        href,
      };
    case "DISPUTED":
      return {
        title: "Resolution disputed",
        body: `The resolution for ${num} has been disputed. The case may be reopened.`,
        href,
      };
    case "REOPENED":
      return {
        title: "Complaint reopened",
        body: `${num} has been reopened for further action.`,
        href,
      };
    case "SUPPORTED":
      return {
        title: "New community support",
        body: `A citizen has supported your complaint ${num}.`,
        href,
      };
    default:
      return null;
  }
}

/**
 * Generate a notification for a newly created complaint (SUBMITTED event).
 */
export function complaintCreatedNotification(
  complaint: Pick<Complaint, "complaint_number">,
): NotifyResult {
  const num = complaint.complaint_number;
  return {
    title: "Complaint submitted",
    body: `Your complaint ${num} has been received. Track its progress in My Citi.`,
    href: `/complaints/${num}`,
  };
}

/**
 * Generate a notification when a citizen supports a complaint.
 * Used to notify the complaint reporter of new support.
 */
export function supportReceivedNotification(
  complaint: Pick<Complaint, "complaint_number">,
  supportCount: number,
): NotifyResult {
  const num = complaint.complaint_number;
  return {
    title: `Community support on ${num}`,
    body: `${supportCount} citizen${supportCount === 1 ? "" : "s"} have supported your complaint.`,
    href: `/complaints/${num}`,
  };
}
