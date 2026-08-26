import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsForm } from "@/components/forms/SettingsForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function SettingsPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: {
      name: true,
      email: true,
      smtpHost: true,
      smtpPort: true,
      smtpUser: true,
    },
  });

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your founder workspace profile and outbound email server."
      />
      <SettingsForm initialUser={user as any} />
    </div>
  );
}