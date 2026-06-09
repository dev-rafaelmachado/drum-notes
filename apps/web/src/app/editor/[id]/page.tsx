import { ScoreEditor } from "@/features/editor/components/ScoreEditor";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScoreEditor scoreId={id} />;
}
