import { google } from 'googleapis';
import { getGmailClientForUser } from '@/lib/gmail-client';
import { prisma } from '@/lib/prisma';
import { LeadStatus, ActivityType } from '@prisma/client';

const IGNORED_SENDER_PATTERNS = [
  'noreply@',
  'no-reply@',
  'mailer-daemon@',
  'postmaster@',
  'notifications@',
  'donotreply@',
];

const IGNORED_SUBJECT_PATTERNS = [
  'out of office',
  'automatic reply',
  'auto-reply',
  'autoreply',
  'undeliverable',
  'delivery status notification',
  'failed message',
];

export async function checkRepliesForUser(userId: string) {
  let detectedCount = 0;

  try {
    const gmailAccount = await prisma.gmailAccount.findFirst({
      where: { userId, isActive: true },
    });

    if (!gmailAccount) {
      return { success: false, reason: 'No active Gmail OAuth account' };
    }

    const gmail = await getGmailClientForUser(userId);

    // Fetch sent emails that have a gmailThreadId and lead is not yet REPLIED
    const pendingSentEmails = await prisma.emailSent.findMany({
      where: {
        userId,
        gmailThreadId: { not: null },
        lead: {
          status: {
            in: ['SENT', 'FOLLOWUP_1', 'FOLLOWUP_2', 'QUEUED'],
          },
        },
      },
      include: {
        lead: true,
      },
      orderBy: { sentAt: 'desc' },
      take: 50,
    });

    if (pendingSentEmails.length === 0) {
      return { success: true, detectedCount: 0, message: 'No pending threads to check' };
    }

    // Group by thread ID to minimize Gmail API calls
    const threadMap = new Map<string, typeof pendingSentEmails[0]>();
    for (const emailLog of pendingSentEmails) {
      if (emailLog.gmailThreadId && !threadMap.has(emailLog.gmailThreadId)) {
        threadMap.set(emailLog.gmailThreadId, emailLog);
      }
    }

    for (const [threadId, emailLog] of threadMap.entries()) {
      try {
        const threadRes = await gmail.users.threads.get({
          userId: 'me',
          id: threadId,
        });

        const messages = threadRes.data.messages || [];
        if (messages.length <= 1) continue; // No reply yet (only our original email)

        // Find incoming message from lead
        for (const msg of messages) {
          const headers = msg.payload?.headers || [];
          const fromHeader = headers.find((h) => h.name?.toLowerCase() === 'from')?.value || '';
          const subjectHeader = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || '';

          const senderEmail = fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader;
          const senderLower = senderEmail.toLowerCase().trim();
          const subjectLower = subjectHeader.toLowerCase().trim();

          // Skip if email is from the user themselves
          if (senderLower.includes(gmailAccount.email.toLowerCase())) continue;

          // Skip false positives (OOO, noreply)
          const isIgnoredSender = IGNORED_SENDER_PATTERNS.some((p) => senderLower.includes(p));
          const isIgnoredSubject = IGNORED_SUBJECT_PATTERNS.some((p) => subjectLower.includes(p));

          if (isIgnoredSender || isIgnoredSubject) continue;

          // Genuine lead reply detected!
          await prisma.$transaction([
            prisma.lead.update({
              where: { id: emailLog.leadId },
              data: {
                status: LeadStatus.REPLIED,
                replyDetectedAt: new Date(),
              },
            }),
            prisma.activity.create({
              data: {
                leadId: emailLog.leadId,
                type: ActivityType.EMAIL_REPLIED,
                description: `Lead replied to email thread! Subject: "${subjectHeader}"`,
              },
            }),
          ]);

          detectedCount++;
          break; // Stop scanning this thread once reply is confirmed
        }
      } catch (threadErr: any) {
        console.error(`Error checking thread ${threadId}:`, threadErr.message);
      }
    }

    return { success: true, detectedCount };
  } catch (error: any) {
    console.error(`Reply check error for user ${userId}:`, error.message);
    return { success: false, error: error.message };
  }
}