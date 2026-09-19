export default function AnimatedBackground({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  return (
    <div className={`animated-bg animated-bg-${variant}`} aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  );
}
