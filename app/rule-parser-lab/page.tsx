import { notFound } from "next/navigation";
import RuleParserLab from "@/components/rule-parser/RuleParserLab";
export const dynamic = "force-dynamic";
export const metadata = { title: "LASTLY Rule Parser Lab", robots: { index: false, follow: false } };
export default function Page() {
  if (process.env.NODE_ENV !== "development" && process.env.RULE_PARSER_LAB_ENABLED !== "1") notFound();
  return <RuleParserLab />;
}
