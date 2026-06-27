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
  platform: "facebook" | "twitter" | "instagram" | "youtube";
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

export type EventCategory =
  | "Arts & Culturals"
  | "Sports & Games"
  | "Innovation"
  | "Fun Events";

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  tag: string;
  description: string;
  image?: string;
  registrationFee?: number;
  isActive: boolean;
  order: number;
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
