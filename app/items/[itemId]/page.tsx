import { ItemDetailDemo } from "@/components/app/ItemDetailDemo";
import { demoItems } from "@/lib/demo-data";

type ItemDetailPageProps = {
  params: Promise<{
    itemId: string;
  }>;
};

export function generateStaticParams() {
  return demoItems.map((item) => ({ itemId: item.id }));
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { itemId } = await params;

  return <ItemDetailDemo itemId={itemId} />;
}
