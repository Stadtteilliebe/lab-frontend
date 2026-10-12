// Hand-drawn stadtteilliebe arrow (points right by default). The viewBox is
// cropped to the drawing itself, so `width` is the arrow's actual length.
// Color follows `currentColor`.
const ROTATION = { right: 0, down: 90, left: 180, up: 270 };
const RATIO = 14.1719 / 24;

export default function Arrow({ direction = 'right', width = 12, className }) {
  const rotation = ROTATION[direction];
  return (
    <svg
      className={className}
      width={width}
      height={width * RATIO}
      viewBox="10.5 15.4141 24 14.1719"
      fill="currentColor"
      aria-hidden="true"
      style={rotation ? { transform: `rotate(${rotation}deg)` } : undefined}
    >
      <path d="M11.8999 23.9446C18.1612 24.538 24.1124 24.3784 30.3737 23.9446C32.2299 23.815 32.2444 20.823 30.3737 20.9527C24.1124 21.3865 18.1612 21.5461 11.8999 20.9527C10.0389 20.7781 10.0486 23.7701 11.8999 23.9446Z" />
      <path d="M26.4285 29.3018C28.7401 27.5415 30.9743 25.6865 33.1211 23.7118C33.7075 23.1733 33.6542 22.141 33.1211 21.5975C31.0857 19.5131 28.6916 17.8626 26.6078 15.833C25.246 14.5116 23.1863 16.6209 24.553 17.9473C26.6417 19.9769 29.0309 21.6274 31.0663 23.7118V21.5975C29.1036 23.4027 27.0779 25.1081 24.9648 26.7187C23.4771 27.8507 24.9261 30.4487 26.4333 29.3018H26.4285Z" />
    </svg>
  );
}
