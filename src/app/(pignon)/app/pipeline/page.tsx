import { PipelineScreen } from "@/components/pipeline/pipeline-screen";

// Rendered in the browser only (see AppGate): nothing to validate in the prerendered shell.
export const instant = false;

export default function PipelinePage() {
  return <PipelineScreen />;
}
