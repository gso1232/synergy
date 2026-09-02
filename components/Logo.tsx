import { useId } from "react";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
};

/**
 * Inline render of public/logo.svg (source: synergy-insurance-group.svg).
 * The original's full-canvas black <rect> and lens-flare glow group are
 * stripped; gradient ids are namespaced per instance so multiple logos can
 * coexist on one page.
 *
 * variant="dark"  → gold artwork as provided, for navy/dark backgrounds.
 * variant="light" → wordmark text recolored to ink #1A1A1A for cream/light
 *                   backgrounds (gold text on cream fails contrast).
 */
export default function Logo({ variant = "dark", className }: LogoProps) {
  const uid = useId();
  const gold = `gold-${uid}`;
  const goldText = `goldText-${uid}`;
  const blue = `blue-${uid}`;
  const heartGrad = `heartGrad-${uid}`;
  const innerClip = `innerClip-${uid}`;
  const wordmarkFill = variant === "light" ? "#0B1F3A" : `url(#${goldText})`;

  return (
    <svg
      viewBox="160 224 920 784"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>Synergy Insurance Group</title>
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7a5a12" />
          <stop offset=".18" stopColor="#d8ae3e" />
          <stop offset=".38" stopColor="#f7e29a" />
          <stop offset=".52" stopColor="#c9962b" />
          <stop offset=".72" stopColor="#f2d478" />
          <stop offset="1" stopColor="#8a6415" />
        </linearGradient>
        <linearGradient id={goldText} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a6415" />
          <stop offset=".22" stopColor="#e8c458" />
          <stop offset=".45" stopColor="#fdf3c4" />
          <stop offset=".58" stopColor="#d4a231" />
          <stop offset=".8" stopColor="#f0d788" />
          <stop offset="1" stopColor="#7d5a10" />
        </linearGradient>
        <linearGradient id={blue} x1=".15" y1="0" x2=".85" y2="1">
          <stop offset="0" stopColor="#0b2f8a" />
          <stop offset=".45" stopColor="#1f5fe0" />
          <stop offset="1" stopColor="#06174a" />
        </linearGradient>
        <radialGradient id={heartGrad} cx=".35" cy=".28" r=".85">
          <stop offset="0" stopColor="#2f7bff" />
          <stop offset=".55" stopColor="#123ba8" />
          <stop offset="1" stopColor="#050f38" />
        </radialGradient>
        <clipPath id={innerClip}>
          <path d="M620 302 L800 356 V566 C800 664 726 716 620 762 C514 716 440 664 440 566 V356 Z" />
        </clipPath>
      </defs>

      <path
        d="M620 248 L840 314 V572 C840 692 748 758 620 812 C492 758 400 692 400 572 V314 Z"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="17"
      />
      <path
        d="M620 276 L818 335 V569 C818 676 736 736 620 786 C504 736 422 676 422 569 V335 Z"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="9"
        opacity=".85"
      />

      <path
        d="M620 302 L800 356 V566 C800 664 726 716 620 762 C514 716 440 664 440 566 V356 Z"
        fill="#000"
        stroke={`url(#${blue})`}
        strokeWidth="15"
      />

      <g clipPath={`url(#${innerClip})`}>
        <g fill={`url(#${gold})`}>
          <circle cx="560" cy="404" r="30" />
          <path d="M560 442c-38 0-58 22-60 58l-6 96c-1 12 6 18 15 18l10 0 4 88c0 9 6 14 14 14h46c8 0 14-5 14-14l4-88 10 0c9 0 16-6 15-18l-6-96c-2-36-22-58-60-58z" />
        </g>
        <g fill={`url(#${gold})`}>
          <circle cx="700" cy="404" r="30" />
          <path d="M700 442c-36 0-54 20-60 52l-22 108c-2 11 4 18 14 18h20l-8 42c-2 10 4 16 13 16h16l4 84c0 9 6 14 14 14h18c8 0 14-5 14-14l4-84h16c9 0 15-6 13-16l-8-42h20c10 0 16-7 14-18l-22-108c-6-32-24-52-60-52z" />
        </g>
        <g fill={`url(#${gold})`}>
          <circle cx="527" cy="536" r="24" />
          <path d="M527 566c-29 0-44 17-46 45l-4 70c-1 10 5 15 12 15h8l3 62c0 8 5 12 12 12h30c7 0 12-4 12-12l3-62h8c7 0 13-5 12-15l-4-70c-2-28-17-45-46-45z" />
        </g>
      </g>

      <path
        d="M620 606c-8 0-92-52-92-114 0-32 25-56 55-56 18 0 31 9 37 20 6-11 19-20 37-20 30 0 55 24 55 56 0 62-84 114-92 114z"
        fill={`url(#${heartGrad})`}
        stroke={`url(#${gold})`}
        strokeWidth="9"
      />
      <path
        d="M566 512h22l12-30 14 62 14-46 10 22h34"
        fill="none"
        stroke="#eaf3ff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <text
        x="620"
        y="905"
        textAnchor="middle"
        fill={wordmarkFill}
        fontFamily="'Playfair Display','Times New Roman',Georgia,serif"
        fontWeight="700"
        fontSize="176"
        letterSpacing="6"
      >
        SYNERGY
      </text>

      <text
        x="620"
        y="990"
        textAnchor="middle"
        fill={wordmarkFill}
        fontFamily="'Playfair Display','Times New Roman',Georgia,serif"
        fontWeight="500"
        fontSize="54"
        letterSpacing="17"
      >
        INSURANCE GROUP
      </text>

      <g stroke={`url(#${gold})`} strokeWidth="2.5" strokeLinecap="round">
        <line x1="178" y1="972" x2="330" y2="972" />
        <line x1="910" y1="972" x2="1062" y2="972" />
      </g>
      <g fill={`url(#${gold})`}>
        <path d="M330 972l22-7v14z" />
        <path d="M910 972l-22-7v14z" />
      </g>
    </svg>
  );
}
