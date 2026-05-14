import { NewApplicationWizard } from "@/components/forms/NewApplicationWizard";

export default function NewApplicationPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">New application</h1>
        <p className="text-muted text-sm">Complete the three short steps below. You can save a draft at any time.</p>
      </div>
      <NewApplicationWizard />
    </div>
  );
}
