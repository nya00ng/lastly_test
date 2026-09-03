type IconProps = {
  className?: string;
};

function Svg({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={className ?? "h-5 w-5"}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </Svg>
  );
}

export function PlusPenIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
      <path d="m16 4 4 4" />
    </Svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </Svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05a2 2 0 0 1-2.83 2.83l-.05-.05a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 0 1-4 0v-.07A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.05.05a2 2 0 0 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.07 14H3a2 2 0 0 1 0-4h.07A1.7 1.7 0 0 0 4.63 9 1.7 1.7 0 0 0 4.29 7.1l-.05-.05a2 2 0 0 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.07V3a2 2 0 0 1 4 0v.07A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.05-.05a2 2 0 0 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.37 9c.23.61.82 1 1.56 1H21a2 2 0 0 1 0 4h-.07A1.7 1.7 0 0 0 19.4 15Z" />
    </Svg>
  );
}

export function MicIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 14a4 4 0 0 0 4-4V7a4 4 0 0 0-8 0v3a4 4 0 0 0 4 4Z" />
      <path d="M19 10a7 7 0 0 1-14 0" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12 4 4L19 6" />
    </Svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </Svg>
  );
}

export function CategoryIcon({ category, className }: IconProps & { category: string }) {
  if (category === "교체") {
    return (
      <Svg className={className}>
        <path d="M3 12a7 7 0 0 1 12-5" />
        <path d="M15 3v4h-4" />
        <path d="M21 12a7 7 0 0 1-12 5" />
        <path d="M9 21v-4h4" />
      </Svg>
    );
  }
  if (category === "구독") {
    return (
      <Svg className={className}>
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="M3 10h18" />
      </Svg>
    );
  }
  if (category === "건강") {
    return (
      <Svg className={className}>
        <path d="M20.8 8.6a5.5 5.5 0 0 0-9-4.2 5.5 5.5 0 0 0-9 4.2c0 4.9 9 10.4 9 10.4s9-5.5 9-10.4Z" />
      </Svg>
    );
  }
  if (category === "기타") {
    return (
      <Svg className={className}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      </Svg>
    );
  }
  return (
    <Svg className={className}>
      <path d="M3 11h18" />
      <path d="M5 11v8h14v-8" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  );
}
