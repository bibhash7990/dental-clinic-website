// Simple tooth mark used in the navbar and footer.
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5.5C10.5 4 8.5 3 6.8 3.4 4.6 3.9 3 6 3 8.4c0 2 .8 3.4 1.5 5 .8 1.8 1.2 3.8 1.6 6 .2 1 1.6 1.1 2 .1.5-1.5.9-3.6 1.6-4.9.5-.9 1.1-1.4 2.3-1.4s1.8.5 2.3 1.4c.7 1.3 1.1 3.4 1.6 4.9.4 1 1.8.9 2-.1.4-2.2.8-4.2 1.6-6 .7-1.6 1.5-3 1.5-5C21 6 19.4 3.9 17.2 3.4 15.5 3 13.5 4 12 5.5Z" />
    </svg>
  );
}
