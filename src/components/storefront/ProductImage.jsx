// We don't have real product photos in this demo, so we show a big emoji on a
// soft gradient background instead. It still looks neat and tells shoppers
// clearly that this is placeholder art, not a real product photo.
export default function ProductImage({ emoji, className = "" }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-5xl ${className}`}
      aria-hidden="true"
    >
      {emoji}
    </div>
  );
}
