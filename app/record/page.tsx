import { RecordDemo } from "@/components/app/RecordDemo";

export default async function RecordPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialItemId = Array.isArray(params.item) ? params.item[0] : params.item;
  return <RecordDemo initialItemId={initialItemId} />;
}
