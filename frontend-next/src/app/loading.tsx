import SpaceLoader from "@/components/SpaceLoader";

export default function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      <SpaceLoader text="loading..." />
    </div>
  );
}
