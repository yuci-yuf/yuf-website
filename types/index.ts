/**
 * Content model for the YUF website.
 *
 * These types mirror the Firestore schema described in the PRD
 * (siteConfig, pages, events, partners). For now the public site reads
 * from a typed defaults module (`lib/content.ts`); later, a Firestore
 * loader can return the same shapes so pages don't need to change.
 */

// ── Shared primitives ──

export interface NavLink {
  label: string;
  path: string;
  isCTA?: boolean;
}

export interface SocialLink {
  platform: "facebook" | "twitter" | "instagram" | "youtube" | "linkedin";
  url: string;
}

export interface Stat {
  number: number;
  suffix: string;
  label: string;
}

export interface CTAButton {
  label: string;
  href: string;
  /** Optional leading emoji/icon glyph */
  icon?: string;
  variant?: "primary" | "secondary" | "outline";
}

export interface Hero {
  badge?: string;
  title: string;
  /** Optional emphasized fragment rendered in the accent color */
  highlight?: string;
  subtitle: string;
  buttons?: CTAButton[];
  backgroundImage?: string;
}

export interface FeatureCard {
  icon?: string;
  title: string;
  description: string;
  image?: string;
  href?: string;
}

export interface CTABanner {
  label: string;
  title: string;
  body: string;
  buttons: CTAButton[];
  backgroundImage?: string;
}

export interface RegistrationStep {
  step: number;
  title: string;
  description: string;
  /** Optional emphasized note shown below the description (e.g. a caution). */
  highlight?: string;
}

// ── Site-wide config ──

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

export interface Advisor {
  name: string;
  title: string;
  quote: string;
  image?: string;
  badge: string;
}

export interface SiteConfig {
  siteName: string;
  subBrand: string;
  tagline: string;
  logo: string;
  navLinks: NavLink[];
  footerBlurb: string;
  socialLinks: SocialLink[];
  quickLinks: NavLink[];
  usefulLinks: NavLink[];
  contact: ContactInfo;
  copyrightText: string;
  stats: Stat[];
  advisor: Advisor;
  registrationPerks: string[];
  ageCategories: { label: string; value: string }[];
  registrationDeadline: string;
}

// ── Events ──

/**
 * The default seed categories. Categories are now admin-managed (stored in the
 * Firestore `eventCategories` collection), so `EventItem.category` is a plain
 * string — this union only documents the original built-in set.
 */
export type EventCategory =
  | "Arts & Culturals"
  | "Sports & Games"
  | "Innovation"
  | "Fun Events";

export type EventStatus = "upcoming" | "ongoing" | "past";

/** Who an event is open to. Defaults to "both" when unset (legacy events). */
export type EventAudience = "school" | "college" | "both";

/**
 * One place/date an event is held. An event can run in several locations that
 * share all other details (fee, description, image, rules) but each have their
 * own venue, date, and capacity. Registrations are tagged with `id` so they can
 * be counted and exported per location.
 */
export interface EventLocation {
  /** Stable key within the event, used to tag registrations. */
  id: string;
  /** City the event runs in, e.g. "Chennai". Drives the register-page filter. */
  city?: string;
  /** Full street address, e.g. "Velammal Bodhi Campus, Ponneri". */
  address?: string;
  /** Human-readable schedule label, e.g. "2nd Sept 2026". */
  date?: string;
  /**
   * Max registrations for THIS location. Omitted/undefined = unlimited.
   */
  registrationLimit?: number;
  /** Running count of registrations for this location. Defaults to 0. */
  registrationCount?: number;
}

export interface EventItem {
  id: string;
  title: string;
  /** Admin-defined category name (matches an `EventCategory` doc / seed value). */
  category: string;
  description: string;
  image?: string;
  registrationFee?: number;
  /**
   * Maximum number of registrations accepted. Omitted/undefined means
   * unlimited capacity.
   */
  registrationLimit?: number;
  /**
   * Running count of submitted registrations, maintained atomically by the
   * public registration flow (see lib/submissions.ts). Used together with
   * `registrationLimit` to know when an event is full. Defaults to 0.
   */
  registrationCount?: number;
  isActive: boolean;
  /**
   * Whether the event currently accepts registrations. Independent of
   * `isActive` (site visibility) and `status` — lets a past/visible event have
   * its registration closed. Treated as open unless explicitly `false`.
   */
  registrationOpen?: boolean;
  order: number;
  /**
   * Position of this event within its category on the HOME page's "Browse By
   * Category" strips only (lower = earlier; index 0 becomes the featured card).
   * Admin-managed via the "Arrange Home Order" screen. Does not affect the
   * /events page. Unset events sort after ordered ones, keeping their prior order.
   */
  homeOrder?: number;
  /** Scheduling state used to group events on the Events page. Defaults to "upcoming". */
  status?: EventStatus;
  /** Who can register — school, college, or both. Defaults to "both". */
  audience?: EventAudience;
  /** Longer write-up shown on the event detail page (falls back to `description`). */
  details?: string[];
  /**
   * The places/dates this event runs. When present, this is the source of
   * truth for venue/date/capacity (each entry has its own). When absent (legacy
   * events), the flat `date`/`venue`/`district`/`registrationLimit`/
   * `registrationCount` fields below describe the single location. Use
   * `getEventLocations()` to read either shape uniformly.
   */
  locations?: EventLocation[];
  /** Legacy single-location schedule label, e.g. "15 Feb 2026". */
  date?: string;
  /** Legacy single-location venue / city. */
  venue?: string;
  /** Legacy single-location district (e.g. "Ponneri", "Coimbatore"). */
  district?: string;
  /** General guidelines bullets shown on the detail page. */
  guidelines?: string[];
  /** Rules & regulations bullets shown on the detail page. */
  rules?: string[];
  /** Optional rule-book PDF URL (uploaded in the admin panel). */
  ruleBook?: string;
}

/** An admin-managed event category (Firestore `eventCategories` collection). */
export interface EventCategoryDoc {
  id: string;
  name: string;
  order: number;
}

/** A gallery image managed in the admin panel (Firestore `gallery` collection). */
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  order: number;
  /** ISO string (converted from Firestore Timestamp on read) */
  createdAt: string | null;
}

// ── Testimonials ──

export interface Testimonial {
  /** Speaker's name, e.g. "Dr. Tamilisai Soundararajan". */
  name: string;
  /** Role / office, shown as the small uppercase line above the quote. */
  role: string;
  /** The testimonial text. */
  quote: string;
  /** Portrait image path (optional — falls back to an initial avatar). */
  image?: string;
}

// ── Partners ──

export interface Partner {
  name: string;
  logoUrl?: string;
  link?: string;
}

// ── Submissions (stored in Firestore) ──

export type PaymentStatus = "paid" | "pending" | "failed";
export type RegistrationStatus = "confirmed" | "pending" | "cancelled";

export interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  institution: string;
  eventCategory: string;
  eventId: string;
  eventTitle: string;
  /** Which location of the event this registration is for (EventLocation.id). */
  locationId?: string;
  /** Snapshot of the chosen location's address/city, for admin display/export. */
  locationVenue?: string;
  /** Snapshot of the chosen location's date. */
  locationDate?: string;
  ageCategory: string;
  message?: string;
  amountPaid: number;
  /** Human-readable code shown to the participant, e.g. "YUF26-8F3KQ2". */
  registrationCode?: string;
  /** Client-supplied key that dedupes retried registration attempts. */
  idempotencyKey?: string;
  /** Razorpay order id (set when the payment order is created). */
  orderId?: string;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  status: RegistrationStatus;
  /** ISO string (converted from Firestore Timestamp on read) */
  createdAt: string | null;
  /** ISO string — when payment was confirmed. */
  paidAt?: string | null;
}

export interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string | null;
}
