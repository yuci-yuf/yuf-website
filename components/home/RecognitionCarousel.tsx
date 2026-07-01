import Image from "next/image";

export function RecognitionCarousel({ images }: { images: string[] }) {
  const src = images[0];
  if (!src) return null;

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5 sm:aspect-[5/4]">
      <Image
        src={src}
        alt="Recognition award"
        fill
        sizes="(min-width: 1024px) 45vw, 100vw"
        className="object-cover"
        priority
      />
    </div>
  );
}
