import { notFound } from "next/navigation";
import LocalAiLab from "@/components/local-ai/LocalAiLab";

export const dynamic = "force-dynamic";
export const metadata = { title: "LASTLY Local Parser Lab", robots: { index: false, follow: false } };

export default function LocalAiLabPage() {
  if (process.env.NODE_ENV !== "development" && process.env.LOCAL_AI_LAB_ENABLED !== "1") notFound();
  return <LocalAiLab />;
}
