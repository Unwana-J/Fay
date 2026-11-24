import { redirect } from "next/navigation";

export default async function LegacyLibraryRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  if (params?.tab === "schedule") {
    redirect("/classroom?tab=schedule");
  }
  redirect("/classroom?tab=recordings");
}
