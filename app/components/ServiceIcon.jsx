import { hotspotsData } from './services';

// Service symbols from Figma (40×40), keyed by the service title in
// services.js, filled in the service's colour from there.
const ICONS = {
  Strategy: (
    <path
      d="M27.94 0C21.28 0 15.88 5.4 15.88 12.06V27.93C15.88 30.03 14.17 31.74 12.07 31.74C9.97 31.74 8.26 30.03 8.26 27.93V0H0V27.92C0 34.58 5.4 39.98 12.06 39.98C18.72 39.98 24.12 34.58 24.12 27.92V12.05C24.12 9.95 25.83 8.24 27.93 8.24C30.03 8.24 31.74 9.95 31.74 12.05V39.98H39.99V12.06C39.99 5.4 34.59 0 27.93 0H27.94Z"
    />
  ),
  Identity: (
    <path
      d="M40 15.87H29.96L37.06 8.78L31.22 2.94L24.13 10.04V0H15.87V10.04L8.78 2.94L2.94 8.78L10.04 15.87H0V24.13H10.04L2.94 31.22L8.78 37.06L15.87 29.96V40H24.13V29.96L31.22 37.06L37.06 31.22L29.96 24.13H40V15.87Z"
    />
  ),
  Experience: (
    <path
      d="M20.04 20H40C40 8.95 31.05 0 20 0C8.95 0 0 8.95 0 20H19.96C8.93 20.03 0 28.97 0 40H40C40 28.97 31.07 20.03 20.04 20Z"
    />
  ),
  Engineering: (
    <g>
      <path d="M0 0L20 20V0H0Z" />
      <path d="M20 40V20H0L20 40Z" />
      <path d="M20 0L40 20V0H20Z" />
      <path d="M40 40V20H20L40 40Z" />
    </g>
  ),
};

// `color` overrides the service colour (e.g. the darker tone on a subpage).
export default function ServiceIcon({ name, size = 40, color, className, style }) {
  const icon = ICONS[name];
  if (!icon) return null;
  const fill = color ?? hotspotsData.find(h => h.title === name)?.color;
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill={fill}
      aria-hidden="true"
    >
      {icon}
    </svg>
  );
}
