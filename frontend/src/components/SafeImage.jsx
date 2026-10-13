// An <img> that shows a neutral placeholder if the image link is broken.
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#2a2522'/><text x='50%' y='50%' fill='#c9a24d' font-family='sans-serif' font-size='28' text-anchor='middle'>Image coming soon</text></svg>`
  );

function SafeImage({ src, alt, className }) {
  function handleError(event) {
    event.target.onerror = null; // stop an endless loop
    event.target.src = PLACEHOLDER;
  }
  return <img src={src || PLACEHOLDER} alt={alt} className={className} loading="lazy" onError={handleError} />;
}

export default SafeImage;
