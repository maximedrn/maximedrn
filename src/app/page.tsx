import { Effect } from "effect";
import type { ReactNode } from "react";
import { PreviewPage } from "@/components/preview.tsx";
import { loadPreview } from "@/lib/preview/preview.services";
import type { PreviewState } from "@/lib/preview/preview.types.ts";

const Page = async (): Promise<ReactNode> => {
  const preview: PreviewState = await Effect.runPromise(loadPreview());
  return <PreviewPage preview={preview} />;
};

export const dynamic = "force-dynamic";
export default Page;
