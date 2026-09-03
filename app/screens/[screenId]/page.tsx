import { notFound } from "next/navigation";
import { isScreenId, renderScreen, screenIds } from "@/lib/screens/index";

type ScreenPageProps = {
  params: Promise<{
    screenId: string;
  }>;
};

export function generateStaticParams() {
  return screenIds.map((screenId) => ({ screenId }));
}

export default async function ScreenPage({ params }: ScreenPageProps) {
  const { screenId } = await params;

  if (!isScreenId(screenId)) {
    notFound();
  }

  return renderScreen(screenId);
}
