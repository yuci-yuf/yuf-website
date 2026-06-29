import Image from "next/image";

// Dense photo wall behind the dark blanket — drawn from the site's image library.
// Single source of truth shared by the home hero and the public/about heroes.
export const HERO_COLLAGE = [
  "/images/events/event-1.png",
  "/images/recognition/award_1.jpg",
  "/images/hero/home.jpg",
  "/images/events/event-2.png",
  "/images/sections/who-we-are.jpg",
  "/images/recognition/award_2.jpg",
  "/images/events/event-3.png",
  "/images/hero/events.jpg",
  "/images/recognition/backup/award_1.jpg",
  "/images/events/event-4.png",
  "/images/advisor/advisor.jpg",
  "/images/recognition/award_3.jpg",
  "/images/events/event-5.png",
  "/images/hero/about.jpg",
  "/images/recognition/backup/award_2.jpg",
  "/images/events/event-6.png",
  "/images/sections/join-us.jpg",
  "/images/recognition/award_4.jpg",
  "/images/events/event-7.png",
  "/images/hero/register.jpg",
  "/images/recognition/backup/award_3.png",
  "/images/events/event-8.png",
  "/images/gallery/pondicherry-juniors.jpg",
  "/images/recognition/backup/award_4.jpg",
  "/images/events/event-9.png",
  "/images/hero/contact.jpg",
  "/images/recognition/award_1.jpg",
  "/images/events/event-1.png",
  "/images/sections/who-we-are.jpg",
  "/images/events/event-4.png",
];

/**
 * Dark photo-collage hero background: a grid of site images covered by a deep
 * blue blanket and an aqua radial glow. Fills its nearest positioned ancestor
 * (the parent section must be `relative overflow-hidden`). Content should sit at
 * `z-30` above it.
 */
export function HeroBackdrop() {
  return (
    <>
      {/* Photo collage grid */}
      <div aria-hidden className="absolute inset-0 z-0">
        <div className="grid h-full w-full auto-rows-fr grid-cols-3 sm:grid-cols-5 lg:grid-cols-6">
          {HERO_COLLAGE.map((src, i) => (
            <div key={i} className="relative">
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width:1024px) 17vw, (min-width:640px) 20vw, 34vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dark blue blanket */}
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,43,61,0.88) 0%, rgba(15,71,95,0.74) 46%, rgba(8,43,61,0.94) 100%)",
        }}
      />
      {/* Aqua radial glow */}
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(120% 78% at 50% 34%, rgba(31,168,215,0.22) 0%, transparent 62%)",
        }}
      />
    </>
  );
}
