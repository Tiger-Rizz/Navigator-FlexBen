/** Meridian's mark: a white lowercase "m" on a red circle. Drawn as a vector so it stays crisp at any size. */
export function MeridianLogo({ size = 28 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
      <circle cx="50" cy="50" r="50" fill="#EF3B4A" />
      <g fill="none" stroke="#fff" strokeWidth="9.5" strokeLinejoin="round" transform="translate(50 50) scale(1.18) translate(-50 -50)">
        <path d="M31.5 32.75V67.5" />
        <path d="M31.5 48c0-7 4-10.5 9.25-10.5S50 41 50 48v19.5" />
        <path d="M50 48c0-7 4-10.5 9.25-10.5s9.25 3.5 9.25 10.5v19.5" />
      </g>
    </svg>
  );
}
