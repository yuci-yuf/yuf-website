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
  /** Scheduling state used to group events on the Events page. Defaults to "upcoming". */
  status?: EventStatus;
  /** Longer write-up shown on the event detail page (falls back to `description`). */
  details?: string[];
  /** Human-readable schedule label, e.g. "15 Feb 2026". */
  date?: string;
  /** Venue / city for this event. */
  venue?: string;
  /** Bullet rules/guidelines shown on the detail page. */
  rules?: string[];
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
  ageCategory: string;
  message?: string;
  amountPaid: number;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  status: RegistrationStatus;
  /** ISO string (converted from Firestore Timestamp on read) */
  createdAt: string | null;
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

export interface AdminUser {
  uid: string;
  email: string;
  name?: string;
  role?: string;
}
