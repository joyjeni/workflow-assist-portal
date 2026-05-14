export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Workflow Assist Portal logo"
      role="img"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" opacity="0.08" />
      <path
        d="M6 12.5l3.5 3.5L18 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="8" r="1.2" fill="currentColor" />
      <circle cx="6" cy="16" r="1.2" fill="currentColor" />
    </svg>
  );
}
