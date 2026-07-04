/**
 * Typed content defaults for the YUF public site.
 *
 * Content is verbatim from `site-content.md` (festival year updated to 2026).
 * These objects mirror the Firestore schema in the PRD; when the CMS is wired
 * up, a Firestore loader can return the same shapes and pages won't change.
 */
import type {
  Advisor,
  CTABanner,
  CTAButton,
  EventItem,
  EventStatus,
  FeatureCard,
  Hero,
  Partner,
  RegistrationStep,
  SiteConfig,
  Testimonial,
} from "@/types";

export const siteConfig: SiteConfig = {
  siteName: "Youth United Festival",
  subBrand: "YUCI — India",
  tagline: "United Youth Will Unite Nation",
  logo: "/images/logo.png",
  navLinks: [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Events", path: "/events" },
    { label: "Study Abroad", path: "/study-abroad" },
    { label: "Gallery", path: "/gallery" },
    { label: "Contact", path: "/contact" },
    { label: "Register Now", path: "/register", isCTA: true },
  ],
  footerBlurb:
    "The Youth United Festival (YUF), organized by the Youth United Council of India with support from the Government of India, Tamil Nadu, and international bodies, celebrates youth creativity, innovation, and unity. Join us to showcase talents, connect globally, and shape an inclusive future!",
  socialLinks: [
    { platform: "instagram", url: "https://www.instagram.com/youthunitedfestival" },
    { platform: "linkedin", url: "https://www.linkedin.com/company/youth-united-festival/" },
    { platform: "twitter", url: "https://x.com/YUCIfestival" },
  ],
  quickLinks: [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Events", path: "/events" },
    { label: "Study Abroad", path: "/study-abroad" },
    { label: "Gallery", path: "/gallery" },
    { label: "Contact Us", path: "/contact" },
  ],
  usefulLinks: [
    { label: "Register Now", path: "/register" },
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms & Conditions", path: "/terms-and-conditions" },
    { label: "Refund Policy", path: "/refund-policy" },
  ],
  contact: {
    phone: "",
    email: "info@youthunitedcouncilofindia.org",
    address:
      "1, 3rd St, Nandanam Extension, Nandanam, Chennai, Tamil Nadu 600035",
  },
  copyrightText: "© 2026 Youth United Council of India | All Rights Reserved",
  stats: [
    { number: 5, suffix: "K+", label: "Participants" },
    { number: 28, suffix: "+", label: "States" },
    { number: 100, suffix: "+", label: "Districts" },
    { number: 10, suffix: "+", label: "Locations" },
  ],
  advisor: {
    name: "Dr. T K Sundaramurthy",
    title: "Ex. Mission Director, ISRO India",
    quote:
      "My aim towards the youth community is to contribute my part in moulding the future pillars of our country i.e our youth in all aspects of life. Let us not forget the fact that more empowered our youth are more empowered our country is.",
    image: "/images/advisor/advisor.jpg",
    badge: "Principal Advisor YUCI",
  },
  registrationPerks: [
    "Participation Certificate",
    "Merit Awards & Trophies",
    "YUF 2026 Merchandise",
    "Refreshments & Meals",
    "Professional Photography",
    "Networking Opportunities",
  ],
  ageCategories: [
    { label: "11 – 13 yrs", value: "11-13" },
    { label: "14 – 16 yrs", value: "14-16" },
    { label: "17 – 20 yrs", value: "17-20" },
    { label: "21 – 23 yrs", value: "21-23" },
  ],
  registrationDeadline: "31 January 2026",
};

// ── Marquee ticker items ──
export const tickerItems = [
  "Youth Talent Icon",
  "Indian Youth Parliament",
  "India's Young Scientist",
  "Arts & Culturals",
  "Sports and Games",
  "Strength & Fitness",
];

// ── Events ──
// Event graphics live in /public/images/events; we cycle the available set
// across the catalogue so every card has artwork until per-event images are
// managed via the CMS.
const eventImagePool = [
  "/images/events/event-1.png",
  "/images/events/event-2.png",
  "/images/events/event-3.png",
  "/images/events/event-4.png",
  "/images/events/event-5.png",
  "/images/events/event-6.png",
  "/images/events/event-7.png",
  "/images/events/event-8.png",
  "/images/events/event-9.png",
];

const eventBase: EventItem[] = [
  // Arts & Culturals
  { id: "acapella", title: "Acapella Competition", category: "Arts & Culturals", description: "Showcase your vocal harmony and group singing abilities in this exhilarating acapella competition.", isActive: true, order: 1 },
  { id: "performing-arts", title: "Performing Arts", category: "Arts & Culturals", description: "A stage for young dancers, actors, and musicians to express themselves and captivate audiences.", isActive: true, order: 2 },
  { id: "costume-designing", title: "Costume Designing", category: "Arts & Culturals", description: "Design and showcase original costumes that blend creativity, culture, and craftsmanship.", isActive: true, order: 3 },
  { id: "fashion-show", title: "Creative & Fashion Show", category: "Arts & Culturals", description: "Walk the ramp and display your unique sense of style in this exciting fashion showcase.", isActive: true, order: 4 },
  { id: "makeup-saree", title: "Makeup & Saree Draping", category: "Arts & Culturals", description: "A unique event celebrating the art of Indian beauty culture and traditional saree draping techniques.", isActive: true, order: 5 },
  { id: "literary-artistic", title: "Literary & Artistic", category: "Arts & Culturals", description: "Competitions in poetry, creative writing, debate, painting, and other artistic disciplines.", isActive: true, order: 6 },
  { id: "media-communication", title: "Media & Communication", category: "Arts & Culturals", description: "Events for budding journalists, photographers, film-makers, and digital content creators.", isActive: true, order: 7 },
  { id: "duet", title: "Duet Competition", category: "Arts & Culturals", description: "Pair up and perform in this soulful duet music competition open to all genres.", isActive: true, order: 8 },

  // Sports & Games
  { id: "outdoor-sports", title: "Outdoor Sports", category: "Sports & Games", description: "A range of outdoor athletic competitions — track, field events, and team sports for all age groups.", isActive: true, order: 9 },
  { id: "indoor-sports", title: "Indoor Sports", category: "Sports & Games", description: "Exciting indoor competitions including chess, carrom, table tennis, badminton, and more.", isActive: true, order: 10 },
  { id: "strength-fitness", title: "Strength & Fitness", category: "Sports & Games", description: "Demonstrate physical endurance and strength in fitness challenges designed for youth athletes.", isActive: true, order: 11 },
  { id: "athletics", title: "Athletics", category: "Sports & Games", description: "Sprint, relay, long jump, shot put, and more — compete in classic track and field events.", isActive: true, order: 12 },
  { id: "martial-arts", title: "Martial Arts", category: "Sports & Games", description: "Showcase discipline, technique, and agility in competitive martial arts demonstrations and bouts.", isActive: true, order: 13 },
  { id: "tug-of-war", title: "Tug of War", category: "Sports & Games", description: "A classic team event testing strength, coordination, and teamwork under competitive conditions.", isActive: true, order: 14 },

  // Innovation & Politics
  { id: "youth-parliament", title: "Indian Youth Parliament", category: "Innovation", description: "Debate national policies, propose solutions, and experience the democratic process first-hand.", isActive: true, order: 15 },
  { id: "young-scientist", title: "India's Young Scientist", category: "Innovation", description: "Present your scientific research, innovations, and inventions to a panel of distinguished judges.", isActive: true, order: 16 },
  { id: "talent-icon", title: "Youth Talent Icon", category: "Innovation", description: "The ultimate talent showcase — demonstrate your unique skill and win the coveted Youth Talent Icon title.", isActive: true, order: 17 },
  { id: "technical-workshops", title: "Technical Workshops", category: "Innovation", description: "Hands-on workshops in coding, robotics, AI, and engineering led by industry professionals.", isActive: true, order: 18 },
  { id: "non-technical-workshops", title: "Non-Technical Workshops", category: "Innovation", description: "Soft skills, entrepreneurship, public speaking, leadership, and career development sessions.", isActive: true, order: 19 },
  { id: "business-intelligence", title: "Business Intelligence", category: "Innovation", description: "Pitch your startup idea, analyze business cases, and compete in entrepreneurship challenges.", isActive: true, order: 20 },

  // Fun Events
  { id: "selfie-hunt", title: "Selfie Treasure Hunt", category: "Fun Events", description: "A fun-filled campus treasure hunt where teams solve clues and capture selfies at each checkpoint.", isActive: true, order: 21 },
  { id: "special-sports", title: "Special Sports", category: "Fun Events", description: "Unconventional and entertaining sports games bringing laughter, teamwork, and friendly competition.", isActive: true, order: 22 },
  { id: "collaborate-learn", title: "Collaborate & Learn", category: "Fun Events", description: "Interactive group activities designed to foster friendships, creativity, and collaborative problem-solving.", isActive: true, order: 23 },
];

export const events: EventItem[] = eventBase.map((e, i) => ({
  ...e,
  image: eventImagePool[i % eventImagePool.length],
  // All catalogue events are part of the upcoming YUF 2026 edition until the
  // CMS sets per-event scheduling. Detail/venue come from the festival defaults.
  status: e.status ?? "upcoming",
  date: e.date ?? "Youth United Festival 2026",
  venue: e.venue ?? "Chennai · Coimbatore · Pondicherry",
}));

export const eventCategoryOrder: EventItem["category"][] = [
  "Arts & Culturals",
  "Sports & Games",
  "Innovation",
  "Fun Events",
];

/** Look up a single event by its id (used by the event detail route). */
export function getEventById(id: string): EventItem | undefined {
  return events.find((e) => e.id === id);
}

export const eventStatusOrder: { status: EventStatus; label: string }[] = [
  { status: "ongoing", label: "Ongoing Events" },
  { status: "upcoming", label: "Upcoming Events" },
  { status: "past", label: "Past Events" },
];

// ── Partners & supporting institutions ──
export const partners: Partner[] = [
  { name: "Falmouth University", logoUrl: "/images/partners/falmouth_university.png" },
  { name: "World Youth Book of Records", logoUrl: "/images/partners/world_youth_book_of_records.png" },
  { name: "Easwari Engineering College", logoUrl: "/images/partners/srm-easwari.png" },
  { name: "Velammal Engineering College", logoUrl: "/images/partners/velammal.png" },
  { name: "Jain (JGI)", logoUrl: "/images/partners/jain.png" },
  { name: "V Vision", logoUrl: "/images/partners/v-vision-Logo.png" },
];

// ── Study Abroad page content ──
export const studyAbroadContent = {
  hero: {
    kicker: "Study Abroad",
    title: "Study Abroad",
    subtitle: "Empowering the Next Generation of Leaders",
    lead: "Learn from the masters — free one-on-one counselling with our esteemed international education partners, exclusively for higher secondary students.",
  },
  intro: {
    label: "Study Abroad",
    title: "Global Education Collaboration: Free Counselling for Students",
    body: [
      "We are delighted to announce our collaboration with our esteemed international educational partners. As part of this initiative, they will be offering free one-on-one counselling sessions exclusively for higher secondary students.",
    ],
    bullets: [
      "Opportunities for further studies abroad",
      "Top-ranking global universities and their admission processes",
      "Scholarships, application procedures, and career pathways",
    ],
    closing: [
      "This is a valuable opportunity for students to gain personalized insights and make informed decisions about their academic future on an international platform.",
      "We look forward to empowering our students with the right guidance and global exposure through this collaboration.",
    ],
  },
  benefits: {
    label: "Why Join",
    title: "What Students Gain",
    subtitle: "Personalized, expert-led guidance to help students take confident steps toward a global education.",
    cards: [
      { title: "1:1 Expert Counselling", description: "Free personalized sessions with advisors from leading international universities." },
      { title: "University & Course Guidance", description: "Discover top-ranking global universities and the programmes best suited to your goals." },
      { title: "Scholarships & Applications", description: "Understand scholarships, application timelines, and admission requirements." },
      { title: "Career Pathways", description: "Map long-term career opportunities that international study can unlock." },
    ],
  },
  partners: {
    label: "Our Partners",
    title: "Meet Our Partners",
    subtitle: "Driven by enthusiasm and experience, our partners are the backbone of this initiative. From planning to execution, their dedication guarantees a memorable and seamless experience for all students.",
  },
  cta: {
    label: "Ready to Begin?",
    title: "Take the first step toward studying abroad",
    body: "Register your interest and secure a free counselling session with our international education partners.",
  },
};

// ── Shared registration steps ──
export const registrationSteps: RegistrationStep[] = [
  { step: 1, title: "Enter Your Details", description: "Add the participant's name, contact number, email, and school or college details, then choose the city where you'll take part." },
  { step: 2, title: "Choose Your Event", description: "Pick a category and select the competition you want to enter — the events shown are the ones running in your chosen city." },
  { step: 3, title: "Review & Pay", description: "Check your registration summary and pay the fee securely online via Razorpay — UPI, cards, net banking, or wallets." },
  { step: 4, title: "Get Confirmed", description: "Receive an instant confirmation email with your unique registration code and event entry pass." },
];

// ── Page content ──

export const homeContent = {
  hero: {
    badge: "YUF 2026 — Now Open",
    title: "Youth United Festival",
    highlight: "2026",
    subtitle:
      "Celebrating Youth Talent, Innovation, and Unity. Join thousands of young leaders, artists, athletes, and innovators from across India.",
    buttons: [
      { label: "Join Now", href: "/events", variant: "primary" },
      { label: "Learn More", href: "/about", variant: "outline" },
    ],
    backgroundImage: "/images/hero/home.jpg",
  } satisfies Hero,
  about: {
    label: "About YUCI",
    title: "Who We Are",
    subhead: "United Youth Will Unite Nation",
    image: "/images/sections/who-we-are.jpg",
    body: [
      "We are Youth United Council of India, a nonprofit organization dedicated to empowering youth worldwide. With a focus on inclusivity and collaboration, we create opportunities for young individuals to showcase their talents and drive change through transformative initiatives like the Youth United Festival (YUF).",
      "Through our efforts, we aim to inspire, innovate, and unite youth as changemakers, building a brighter and more inclusive future for all. Together, we amplify the voices of youth to shape the world.",
    ],
    features: [
      { title: "Inclusive Community", description: "Open to every young person regardless of background, region, or discipline." },
      { title: "Innovation-Driven", description: "Fostering creativity and problem-solving across arts, science, and technology." },
      { title: "National Impact", description: "Recognized and supported by state governors and national institutions." },
    ] satisfies FeatureCard[],
    button: { label: "Learn More", href: "/about", variant: "primary" } satisfies CTAButton,
  },
  joinUs: {
    label: "Get Involved",
    title: "Join Us at YUF!",
    image: "/images/sections/join-us.jpg",
    body: [
      "Showcase your skills, connect with peers, and drive change at the Youth United Festival (YUF). Whether you're a performer, innovator, athlete, or changemaker, there's a platform waiting for you to shine.",
      "The Youth United Festival (YUF), organized by the Youth United Council of India with support from the Government of India, Tamil Nadu, and international bodies, celebrates youth creativity, innovation, and unity.",
    ],
    buttons: [
      { label: "Register now!", href: "/register", variant: "primary" },
      { label: "View Events", href: "/events", variant: "outline" },
    ] satisfies CTAButton[],
  },
  recognition: {
    label: "Recognition",
    title: "Appreciation From Ministry of Youth Affairs and Sports",
    subtitle:
      "The Youth United Council of India (YUCI) was honoured to meet Dr. Mansukh L. Mandaviya, Minister of Youth Affairs and Sports & Minister of Labour and Employment, Government of India, to strengthen youth-focused sports and employment initiatives across the nation.",
    details: [],
    images: [
      "/images/recognition/award_5.jpeg",
      "/images/recognition/award_1.jpg",
      "/images/recognition/award_2.jpg",
      "/images/recognition/award_3.jpg",
      "/images/recognition/award_4.jpg",
    ],
  },
  govInitiatives: {
    label: "Aligned With",
    title: "Government of India Initiatives",
    subtitle:
      "YUF proudly supports and aligns with key national programs promoting youth development.",
    cards: [
      { title: "Proudly Made in India", description: "Support Local, Buy Indian products.", image: "/images/gov/made_in_india_logo.png" },
      { title: "Fit India", description: "Fit India: Because a Healthy Nation is a Wealthy Nation.", image: "/images/gov/fit-india.png" },
      { title: "Skill India", description: "Empowering Youth, Building the Nation.", image: "/images/gov/skill-india.png" },
    ] satisfies FeatureCard[],
  },
  eventsPreview: {
    label: "What's Happening",
    title: "Exciting Events Ahead",
    subtitle:
      "Empowering Youth, Inspiring Creativity and Change — explore our exciting lineup designed to engage, inspire, and transform.",
  },
  registrationSteps: {
    label: "How It Works",
    title: "Steps to Register",
    subtitle:
      "Follow these simple steps to register for your desired competition. Create an account, choose your competition, fill out the registration form, and complete the payment process.",
  },
  whyJoinUs: {
    label: "Why Choose YUF",
    title: "Why Join Us",
    subtitle:
      "Joining Youth United Festival (YUF) means becoming part of a global movement that celebrates creativity, innovation, and unity.",
    cards: [
      { title: "Partner with Us", description: "Perform, innovate, and lead in diverse categories. Gain recognition at state and national levels." },
      { title: "Collaborate & Learn", description: "Gain valuable insights from workshops, expert talks, and networking with driven peers." },
      { title: "Make an Impact", description: "Contribute to community service initiatives and create meaningful, lasting change in society." },
    ] satisfies FeatureCard[],
  },
  testimonials: {
    label: "Testimonials",
    title: "Inspiring Words From Dignitaries & Public Leaders",
    subtitle:
      "Hear what governors, legislators, and global leaders have said about the Youth United Festival and the young changemakers it brings together.",
    items: [
      {
        name: "Amb. Dunston P",
        role: "The Private Office of His Royal Highness Sheikh Ahmed Bin Faisal Al Qassimi",
        quote:
          "A platform for young minds to come together, celebrate their talents, and ignite positive change! Let's unite, inspire, and create the future we all dream of. Your energy, your voice, your vision — together, we can achieve greatness!",
        image: "/images/testimonials/dunston-p.png",
      },
      {
        name: "Shri. Embalam R. Selvam",
        role: "Speaker of Puducherry Legislative Assembly",
        quote:
          "This festival is all about celebrating your creativity, energy, and vision for the future. Together, we have the power to inspire change, break barriers, and build a brighter tomorrow. Let's unite, dream big, and make a difference!",
        image: "/images/testimonials/embalam-selvam.png",
      },
    ] satisfies Testimonial[],
  },
  partners: {
    label: "Our Community",
    title: "Supporting Partners",
  },
  ctaBanner: {
    label: "Get Started Today",
    title: "Get Involved Today",
    body: "The Youth United Festival (YUF), organized by the Youth United Council of India with support from the Government of India, Tamil Nadu, and international bodies, celebrates youth creativity, innovation, and unity. Join us to showcase talents, connect globally, and shape an inclusive future!",
    buttons: [
      { label: "Let's Go!", href: "/register", variant: "primary" },
      { label: "Contact Us", href: "/contact", variant: "outline" },
    ],
  } satisfies CTABanner,
};

export const aboutContent = {
  hero: {
    badge: "About Us",
    title: "Youth United Festival",
    subtitle: "Empowering the Next Generation of Leaders",
    buttons: [
      { label: "Register Now", href: "/register", variant: "primary" },
      { label: "View Events", href: "/events", variant: "outline" },
    ],
    backgroundImage: "/images/hero/about.jpg",
  } satisfies Hero,
  about: {
    label: "Our Story",
    title: "Who We Are",
    subhead: "United Youth Will Unite Nation",
    body: [
      "We are Youth United Council of India (YUCI), a nonprofit organization dedicated to empowering youth worldwide. With a focus on inclusivity and collaboration, we create opportunities for young individuals to showcase their talents and drive change through transformative initiatives like the Youth United Festival (YUF).",
      "Through our efforts, we aim to inspire, innovate, and unite youth as changemakers, building a brighter and more inclusive future for all. Together, we amplify the voices of youth to shape the world.",
    ],
    button: { label: "Learn More", href: "/register", variant: "primary" } satisfies CTAButton,
  },
  mission: {
    label: "Our Purpose",
    title: "Our Mission",
    body: [
      "We aim to encourage youth participation, ignite creativity, and promote dialogue across diverse fields — from performing arts to technology and innovation. YUF fosters a sense of community, unity, and growth that reaches beyond the festival itself, encouraging long-lasting impact and collaboration.",
    ],
    cards: [
      { title: "Our Vision", description: "A world where every young person has the platform to lead, innovate, and inspire." },
      { title: "Our Values", description: "Inclusivity, creativity, collaboration, integrity, and youth empowerment." },
    ] satisfies FeatureCard[],
  },
  activities: {
    label: "Our Activities",
    title: "What We Do",
    subtitle:
      "At YUF, we curate a variety of events designed to engage and inspire the youth. Some of our most anticipated activities include:",
    cards: [
      { title: "Cultural Performances", description: "A platform for young artists to display their skills in music, dance, and drama. From classical to contemporary, every form of expression is celebrated." },
      { title: "Technology & Innovation Exhibitions", description: "Showcasing groundbreaking innovations from young minds in the fields of tech and science. A space for tomorrow's inventors and thinkers." },
      { title: "Sports Challenges", description: "A chance for youth to compete, collaborate, and build team spirit through various sports events ranging from athletics to martial arts." },
      { title: "Workshops & Leadership Talks", description: "Offering expert guidance on career development, leadership, and personal growth. Connect with mentors and industry leaders who inspire." },
    ] satisfies FeatureCard[],
  },
  whyJoinUs: {
    label: "Be Part of Something Bigger",
    title: "Why Join Us",
    subtitle:
      "By participating in YUF, you are joining a global community of passionate, creative, and driven individuals. Youth United Festival is not just an event; it's a movement.",
    cards: [
      { title: "Showcase Your Talents", description: "Whether you're an artist, innovator, athlete, or leader, YUF gives you the platform to shine in front of thousands." },
      { title: "Learn & Grow", description: "Gain valuable insights through workshops, talks, and networking opportunities with experts, peers, and national icons." },
      { title: "Make a Difference", description: "Contribute to meaningful change by participating in community service and social impact initiatives." },
    ] satisfies FeatureCard[],
  },
  impact: {
    label: "What We've Built",
    title: "Our Impact",
    body: [
      "Since our inception, YUF has attracted thousands of youth participants from around the globe, empowering them to create lasting change. With a focus on diversity, innovation, and leadership, YUF continues to grow each year.",
      "We believe that when youth come together, great things happen. YUF is about building a future where creativity, knowledge, and unity drive positive change for all.",
    ],
    stats: [
      { number: 5, suffix: "K+", label: "Youth Participants" },
      { number: 28, suffix: "+", label: "States Covered" },
      { number: 100, suffix: "+", label: "Districts" },
      { number: 50, suffix: "+", label: "Events Held" },
    ],
  },
  ctaBanner: {
    label: "Ready to Join?",
    title: "Be Part of the Movement",
    body: "Join thousands of young leaders, artists, athletes, and innovators at Youth United Festival 2026. Your talent deserves a stage.",
    buttons: [
      { label: "Register Now", href: "/register", variant: "primary" },
      { label: "Explore Events", href: "/events", variant: "outline" },
    ],
  } satisfies CTABanner,
};

export const eventsContent = {
  hero: {
    badge: "YUF 2026 Events",
    title: "Youth United Festival",
    highlight: "2026",
    subtitle:
      "Celebrating Youth Talent, Innovation, and Unity — explore our full lineup of events designed to engage, inspire, and transform.",
    buttons: [
      { label: "Register Now", href: "/register", variant: "primary" },
      { label: "Browse Events", href: "#events-list", variant: "outline" },
    ],
    backgroundImage: "/images/hero/events.jpg",
  } satisfies Hero,
  intro: {
    label: "Empowering Youth",
    title: "Exciting Events Ahead",
    subtitle:
      "Explore our exciting lineup of events designed to engage, inspire, and transform. From cultural performances to tech exhibitions and sports challenges, there's something for everyone to participate in. Join us and be part of the movement!",
  },
  ctaBanner: {
    label: "Don't Miss Out",
    title: "Transforming Lives Through Youth Power",
    body: "Discover how YUF initiatives are transforming lives and empowering individuals to achieve their full potential. Join the movement today.",
    buttons: [
      { label: "Register for YUF 2026", href: "/register", variant: "primary" },
      { label: "Get in Touch", href: "/contact", variant: "outline" },
    ],
  } satisfies CTABanner,
};

export const registerContent = {
  hero: {
    badge: "Registration Open",
    title: "Register for",
    highlight: "YUF 2026",
    subtitle:
      "Secure your spot at the Youth United Festival 2026. Choose your event, fill your details, and complete payment in minutes.",
    backgroundImage: "/images/hero/register.jpg",
  } satisfies Hero,
  locations: [
    { city: "Chennai", region: "Tamil Nadu" },
    { city: "Coimbatore", region: "Tamil Nadu" },
    { city: "Pondicherry", region: "Union Territory" },
  ],
};

export const contactContent = {
  hero: {
    badge: "Get In Touch",
    title: "Contact Us",
    subtitle:
      "We'd love to hear from you! Whether you have questions, need more details about YUF, or want to get involved — feel free to reach out.",
    buttons: [
      { label: "Send a Message", href: "#contact-form", variant: "primary" },
      { label: "Register Now", href: "/register", variant: "outline" },
    ],
    backgroundImage: "/images/hero/contact.jpg",
  } satisfies Hero,
  subjects: [
    { label: "General Enquiry", value: "general" },
    { label: "Event Registration", value: "registration" },
    { label: "Partnership", value: "partnership" },
    { label: "Sponsorship", value: "sponsorship" },
    { label: "Volunteering", value: "volunteer" },
    { label: "Media & Press", value: "media" },
    { label: "Other", value: "other" },
  ],
  helpCards: {
    label: "How We Can Help",
    title: "We're Here for You",
    subtitle: "Reach out for any of the following and we'll respond within 24 hours.",
    cards: [
      { title: "General Questions", description: "Ask anything about YUF 2026 — schedule, venues, eligibility, categories, or participation rules." },
      { title: "Partnerships", description: "Interested in sponsoring or partnering with YUF? We'd love to explore opportunities together." },
      { title: "Volunteering", description: "Want to be part of the organizing team? Get in touch to learn about volunteer opportunities at YUF 2026." },
    ] satisfies FeatureCard[],
  },
  ctaBanner: {
    label: "Ready to Participate?",
    title: "Get Involved Today",
    body: "Don't wait — register now for Youth United Festival 2026 and be part of India's biggest youth celebration.",
    buttons: [
      { label: "Register Now", href: "/register", variant: "primary" },
      { label: "Browse Events", href: "/events", variant: "outline" },
    ],
  } satisfies CTABanner,
};

// ── Gallery ──
// Photos are seeded from the existing event/recognition imagery already in
// /public/images. The CMS can later replace these with a managed media set.

export interface GalleryPhoto {
  src: string;
  alt: string;
}
export interface GalleryVideo {
  /** YouTube embed URL, e.g. https://www.youtube.com/embed/<id> */
  embedUrl: string;
  title: string;
}

export const galleryContent = {
  hero: {
    badge: "Gallery",
    title: "Moments From YUF",
    subtitle:
      "A glimpse into the energy, talent, and unity of the Youth United Festival — through photos, videos, and event highlights.",
    backgroundImage: "/images/hero/events.jpg",
  } satisfies Hero,
  photos: [
    { src: "/images/recognition/award_1.jpg", alt: "YUCI award presentation at Raj Bhavan" },
    { src: "/images/recognition/award_2.jpg", alt: "YUCI recognition ceremony" },
    { src: "/images/recognition/award_3.jpg", alt: "YUCI dignitaries felicitation" },
    { src: "/images/recognition/award_4.jpg", alt: "YUCI appreciation award" },
    { src: "/images/events/event-1.png", alt: "YUF event highlight" },
    { src: "/images/events/event-4.png", alt: "YUF event highlight" },
    { src: "/images/events/event-5.png", alt: "YUF event highlight" },
    { src: "/images/events/event-6.png", alt: "YUF event highlight" },
    { src: "/images/events/event-7.png", alt: "YUF event highlight" },
  ] satisfies GalleryPhoto[],
  videos: [] satisfies GalleryVideo[],
  highlights: {
    label: "Event Highlights",
    title: "Highlights From Across India",
    subtitle:
      "From Chennai to Pondicherry, the Youth United Festival brought together thousands of young talents across arts, sports, science, and innovation.",
  },
};

// ── Legal pages ──
// Each section renders as a heading followed by its blocks. A string block is a
// paragraph; a { list } block renders as a bulleted list (with an optional lead
// paragraph). `intro` shows above the first section.

export interface LegalListBlock {
  lead?: string;
  list: string[];
}
export type LegalBlock = string | LegalListBlock;
export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
}
export interface LegalPage {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}

export const privacyPolicy: LegalPage = {
  title: "Privacy Policy",
  updated: "Last updated: January 2026",
  intro:
    "At youthunitedfestival.com, we value your privacy and are committed to protecting your personal information. This policy outlines how we collect, use, and protect your data.",
  sections: [
    {
      heading: "Information We Collect",
      blocks: [
        { lead: "We may collect the following types of information:", list: [
          "Personal Information: Name, email, phone number, language preference, and social media contacts, either directly or via third-party sign-ins.",
          "Browsing Data: Pages viewed, traffic data (e.g., IP address, browser type), and other analytics.",
          "Survey Responses: Feedback on tournaments, events, or website features.",
        ] },
      ],
    },
    {
      heading: "Use of Cookies",
      blocks: [
        "Cookies enhance your experience by storing preferences and enabling certain website features. Third-party partners may also use cookies to display ads and gather non-personal demographic data. You can disable cookies in your browser settings, but some features may become inaccessible.",
      ],
    },
    {
      heading: "How We Use Your Information",
      blocks: [
        { lead: "We use your data to:", list: [
          "Improve user experience by tailoring content.",
          "Conduct surveys and analytics to enhance services.",
          "Protect against fraud and ensure security.",
          "Fulfill legal obligations or cooperate with law enforcement.",
          "Collaborate with affiliates and partners for promotions or improved services.",
        ] },
      ],
    },
    {
      heading: "Sharing of Information",
      blocks: [
        { lead: "We may share your data with:", list: [
          "Reliable third-party services like payment gateways (e.g., Razorpay) for transactions.",
          "Affiliates and trusted partners for marketing or service enhancements.",
          "Legal authorities or others when required by law.",
        ] },
      ],
    },
    {
      heading: "Changes to Policy",
      blocks: [
        "We reserve the right to update this policy. Continued use of our website signifies acceptance of changes. For updates, revisit this page periodically.",
      ],
    },
    {
      heading: "Security and Disclaimer",
      blocks: [
        "While we strive to secure your information, we cannot guarantee absolute confidentiality due to evolving internet risks. By using our site, you agree to assume responsibility for your data and interactions online.",
      ],
    },
    {
      heading: "Contact",
      blocks: [
        "For questions or concerns, email us at info@youthunitedcouncilofindia.org",
      ],
    },
  ],
};

export const termsAndConditions: LegalPage = {
  title: "Terms and Conditions",
  updated: "Last updated: January 2026",
  sections: [
    {
      heading: "Eligibility",
      blocks: [
        "Participation in the Youth United Festival is open to individuals aged 17 to 25 years. All participants must register through the official YUF website or authorized platforms. For team-based events, it is essential that all team members meet the eligibility requirements.",
      ],
    },
    {
      heading: "Registration",
      blocks: [
        "All participants must complete the registration process to take part in the festival and its events. Accurate personal and contact information must be provided during registration. Registration fees and platform fee, if applicable, are non-refundable except in cases where the event is cancelled by the organizers. In such cases, refunds will be Credited within 15 working days. For certain additional events, on-the-spot registration will be available.",
      ],
    },
    {
      heading: "Code of Conduct",
      blocks: [
        "The festival promotes values of respect, inclusivity, and professionalism, which all participants are expected to uphold throughout the event. Harassment, discrimination, or any form of inappropriate behavior is strictly prohibited. Attendees must comply with the laws of the Republic of India and adhere to the venue's rules.",
        "All attendees are required to carry a valid government-issued ID for entry into the venue. Participants may bring one additional person if permitted by the authorities.",
        "Participants must bring their own tools and accessories, as the management will not provide these essentials. Additionally, a printed copy of the email confirmation from the organization is mandatory for entry.",
      ],
    },
    {
      heading: "Event Participation",
      blocks: [
        "Participants must arrive at their designated event locations at the specified time. Late arrivals may forfeit the right to participate. For competitions, decisions made by the jury or organizing committee are final and binding, and no appeals will be entertained. Participants should show their conformation Email before entering into the respective venue.",
      ],
    },
    {
      heading: "Intellectual Property",
      blocks: [
        "Participants retain ownership of their original works created for the festival but grant the Youth United Festival permission to use photographs, videos, or content captured during the event for promotional purposes. Any form of plagiarism or misrepresentation will result in immediate disqualification.",
      ],
    },
    {
      heading: "Safety and Security",
      blocks: [
        "Participants are responsible for the safety of their personal belongings during the festival. The organizers will not be held liable for any loss, theft, or damage. Emergency protocols and instructions provided by security personnel must be strictly followed at all times to ensure safety.",
      ],
    },
    {
      heading: "Photography and Media",
      blocks: [
        "The festival will be documented through photography, videography, and live streaming. By participating, attendees consent to being recorded. Media captured during the event may be used for promotional or archival purposes without additional permissions or compensation.",
      ],
    },
    {
      heading: "Workshops and Competitions",
      blocks: [
        "Participation in workshops will be based on a first-come, first-served basis unless otherwise specified. Each competition will have specific rules and guidelines that must be strictly followed by participants.",
      ],
    },
    {
      heading: "Liability",
      blocks: [
        "Participants attend the festival at their own risk. The organizers are not responsible for any injuries, illnesses, or damages sustained during the event. Willful damage to property or misconduct will lead to immediate disqualification and may result in legal action.",
      ],
    },
    {
      heading: "Cancellations and Modifications",
      blocks: [
        "The organizers reserve the right to cancel, reschedule, or modify any event without prior notice. In the case of unforeseen circumstances, updates or changes will be communicated through official channels to all participants.",
      ],
    },
    {
      heading: "Partnerships and Sponsorships",
      blocks: [
        "All partnerships and sponsorships must align with the core values and objectives of the Youth United Festival. The display of partner logos or branding during the festival requires prior approval from the organizing committee. VVISION proudly serves as our official accounting partner.",
      ],
    },
    {
      heading: "Dispute Resolution",
      blocks: [
        "Any disputes or grievances related to the festival must be submitted in writing to the organizing committee. The committee's decision in resolving disputes will be considered final.",
      ],
    },
    {
      heading: "Acknowledgments",
      blocks: [
        "By registering for or attending the festival, participants confirm that they have read, understood, and agreed to these terms and conditions. These terms and conditions are subject to change. Updates will be posted on the official Youth United Festival website, and participants are encouraged to review the latest version before the event.",
        "Note: The organizing committee reserves the right to finalize and announce the scoring format on the spot based on time and event conditions.",
      ],
    },
  ],
};

export const refundPolicy: LegalPage = {
  title: "Refund & Cancellation Policy",
  updated: "Last updated: January 2026",
  intro:
    "This policy explains the conditions under which registration fees for the Youth United Festival may be refunded or cancelled.",
  sections: [
    {
      heading: "Registration Fees",
      blocks: [
        "Registration fees and platform fees (if applicable) are non-refundable, except in cases where the event is cancelled by the organizers.",
      ],
    },
    {
      heading: "Organizer Cancellation",
      blocks: [
        "If an event is cancelled by the organizers, eligible registration fees will be credited back to the original payment method within 15 working days of the cancellation announcement.",
      ],
    },
    {
      heading: "Participant Cancellation",
      blocks: [
        "Cancellations or withdrawals initiated by a participant after a successful registration are not eligible for a refund. Registrations are non-transferable unless expressly permitted by the organizing committee.",
      ],
    },
    {
      heading: "Rescheduled Events",
      blocks: [
        "If an event is rescheduled rather than cancelled, existing registrations remain valid for the new date and no refund will be issued. Affected participants will be notified through official channels.",
      ],
    },
    {
      heading: "Processing of Refunds",
      blocks: [
        "Approved refunds are processed through the original payment gateway (e.g., Razorpay). The time taken for the amount to reflect in your account may vary depending on your bank or card issuer.",
      ],
    },
    {
      heading: "Contact",
      blocks: [
        "For any refund or cancellation queries, email us at info@youthunitedcouncilofindia.org",
      ],
    },
  ],
};

// Re-export advisor for shared use on home + about
export const advisor: Advisor = siteConfig.advisor;
