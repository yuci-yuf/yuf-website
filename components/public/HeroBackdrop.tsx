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
  "/images/recognition/award_1.jpg",
  "/images/events/event-4.png",
  "/images/advisor/advisor.jpg",
  "/images/recognition/award_3.jpg",
  "/images/events/event-5.png",
  "/images/hero/about.jpg",
  "/images/recognition/award_2.jpg",
  "/images/events/event-6.png",
  "/images/sections/join-us.jpg",
  "/images/recognition/award_4.jpg",
  "/images/events/event-7.png",
  "/images/hero/register.jpg",
  "/images/recognition/award_3.jpg",
  "/images/events/event-8.png",
  "/images/gallery/pondicherry-juniors.jpg",
  "/images/recognition/award_4.jpg",
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

      {/* Festival gradient blanket (blue → cyan → purple), matching the home hero.
         Translucent enough that the photo collage shows through as texture while
         white heading text stays readable. */}
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(120% 100% at 12% 8%, rgba(89,31,172,0.55) 0%, transparent 46%), radial-gradient(90% 90% at 92% 96%, rgba(21,147,143,0.5) 0%, transparent 50%), linear-gradient(120deg, rgba(19,58,140,0.9) 0%, rgba(21,95,166,0.88) 32%, rgba(19,110,130,0.87) 62%, rgba(21,147,143,0.88) 100%)",
        }}
      />
    </>
  );
}
