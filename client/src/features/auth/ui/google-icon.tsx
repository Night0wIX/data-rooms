import type { SVGProps } from "react";

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-3a7.15 7.15 0 0 1-10.65-3.76H1.4v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.33a7.2 7.2 0 0 1 0-4.66V6.58H1.4a12 12 0 0 0 0 10.84l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.4 6.58l4 3.09A7.15 7.15 0 0 1 12 4.77Z"
      />
    </svg>
  );
}
