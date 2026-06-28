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
  FeatureCard,
  Hero,
  Partner,
  RegistrationStep,
  SiteConfig,
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
    { label: "Contact", path: "/contact" },
    { label: "Register Now", path: "/register", isCTA: true },
  ],
  footerBlurb:
    "The Youth United Festival (YUF), organized by the Youth United Council of India with support from the Government of India, Tamil Nadu, and international bodies, celebrates youth creativity, innovation, and unity. Join us to showcase talents, connect globally, and shape an inclusive future!",
  socialLinks: [
    { platform: "facebook", url: "#" },
    { platform: "twitter", url: "#" },
    { platform: "instagram", url: "#" },
    { platform: "youtube", url: "#" },
  ],
  quickLinks: [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Events", path: "/events" },
    { label: "Contact Us", path: "/contact" },
    { label: "FAQs", path: "#" },
  ],
  usefulLinks: [
    { label: "Register Now", path: "/register" },
    { label: "Privacy Policy", path: "#" },
    { label: "Terms & Conditions", path: "#" },
    { label: "FAQs", path: "#" },
  ],
  contact: {
    phone: "+91 12334 12345",
    email: "info@youthunitedcouncilofindia.org",
    address:
      "NO 603, BLOCK E2, Akshaya Today, Thaiyur B Village, Chengalpet Taluk, Kanchipuram District, Chennai, 603103, Tamil Nadu, India",
  },
  copyrightText: "© 2026 Youth United Council of India | All Rights Reserved",
  stats: [
    { number: 5000, suffix: "K+", label: "Participation" },
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
  { id: "acapella", title: "Acapella Competition", category: "Arts & Culturals", tag: "Music", description: "Showcase your vocal harmony and group singing abilities in this exhilarating acapella competition.", isActive: true, order: 1 },
  { id: "performing-arts", title: "Performing Arts", category: "Arts & Culturals", tag: "Performance", description: "A stage for young dancers, actors, and musicians to express themselves and captivate audiences.", isActive: true, order: 2 },
  { id: "costume-designing", title: "Costume Designing", category: "Arts & Culturals", tag: "Fashion", description: "Design and showcase original costumes that blend creativity, culture, and craftsmanship.", isActive: true, order: 3 },
  { id: "fashion-show", title: "Creative & Fashion Show", category: "Arts & Culturals", tag: "Fashion", description: "Walk the ramp and display your unique sense of style in this exciting fashion showcase.", isActive: true, order: 4 },
  { id: "makeup-saree", title: "Makeup & Saree Draping", category: "Arts & Culturals", tag: "Beauty", description: "A unique event celebrating the art of Indian beauty culture and traditional saree draping techniques.", isActive: true, order: 5 },
  { id: "literary-artistic", title: "Literary & Artistic", category: "Arts & Culturals", tag: "Literary", description: "Competitions in poetry, creative writing, debate, painting, and other artistic disciplines.", isActive: true, order: 6 },
  { id: "media-communication", title: "Media & Communication", category: "Arts & Culturals", tag: "Media", description: "Events for budding journalists, photographers, film-makers, and digital content creators.", isActive: true, order: 7 },
  { id: "duet", title: "Duet Competition", category: "Arts & Culturals", tag: "Music", description: "Pair up and perform in this soulful duet music competition open to all genres.", isActive: true, order: 8 },

  // Sports & Games
  { id: "outdoor-sports", title: "Outdoor Sports", category: "Sports & Games", tag: "Outdoor", description: "A range of outdoor athletic competitions — track, field events, and team sports for all age groups.", isActive: true, order: 9 },
  { id: "indoor-sports", title: "Indoor Sports", category: "Sports & Games", tag: "Indoor", description: "Exciting indoor competitions including chess, carrom, table tennis, badminton, and more.", isActive: true, order: 10 },
  { id: "strength-fitness", title: "Strength & Fitness", category: "Sports & Games", tag: "Fitness", description: "Demonstrate physical endurance and strength in fitness challenges designed for youth athletes.", isActive: true, order: 11 },
  { id: "athletics", title: "Athletics", category: "Sports & Games", tag: "Athletics", description: "Sprint, relay, long jump, shot put, and more — compete in classic track and field events.", isActive: true, order: 12 },
  { id: "martial-arts", title: "Martial Arts", category: "Sports & Games", tag: "Martial Arts", description: "Showcase discipline, technique, and agility in competitive martial arts demonstrations and bouts.", isActive: true, order: 13 },
  { id: "tug-of-war", title: "Tug of War", category: "Sports & Games", tag: "Team", description: "A classic team event testing strength, coordination, and teamwork under competitive conditions.", isActive: true, order: 14 },

  // Innovation & Politics
  { id: "youth-parliament", title: "Indian Youth Parliament", category: "Innovation", tag: "Parliament", description: "Debate national policies, propose solutions, and experience the democratic process first-hand.", isActive: true, order: 15 },
  { id: "young-scientist", title: "India's Young Scientist", category: "Innovation", tag: "Science", description: "Present your scientific research, innovations, and inventions to a panel of distinguished judges.", isActive: true, order: 16 },
  { id: "talent-icon", title: "Youth Talent Icon", category: "Innovation", tag: "Talent", description: "The ultimate talent showcase — demonstrate your unique skill and win the coveted Youth Talent Icon title.", isActive: true, order: 17 },
  { id: "technical-workshops", title: "Technical Workshops", category: "Innovation", tag: "Tech", description: "Hands-on workshops in coding, robotics, AI, and engineering led by industry professionals.", isActive: true, order: 18 },
  { id: "non-technical-workshops", title: "Non-Technical Workshops", category: "Innovation", tag: "Workshop", description: "Soft skills, entrepreneurship, public speaking, leadership, and career development sessions.", isActive: true, order: 19 },
  { id: "business-intelligence", title: "Business Intelligence", category: "Innovation", tag: "Business", description: "Pitch your startup idea, analyze business cases, and compete in entrepreneurship challenges.", isActive: true, order: 20 },

  // Fun Events
  { id: "selfie-hunt", title: "Selfie Treasure Hunt", category: "Fun Events", tag: "Fun", description: "A fun-filled campus treasure hunt where teams solve clues and capture selfies at each checkpoint.", isActive: true, order: 21 },
  { id: "special-sports", title: "Special Sports", category: "Fun Events", tag: "Fun", description: "Unconventional and entertaining sports games bringing laughter, teamwork, and friendly competition.", isActive: true, order: 22 },
  { id: "collaborate-learn", title: "Collaborate & Learn", category: "Fun Events", tag: "Social", description: "Interactive group activities designed to foster friendships, creativity, and collaborative problem-solving.", isActive: true, order: 23 },
];

export const events: EventItem[] = eventBase.map((e, i) => ({
  ...e,
  image: eventImagePool[i % eventImagePool.length],
}));

export const eventCategoryOrder: EventItem["category"][] = [
  "Arts & Culturals",
  "Sports & Games",
  "Innovation",
  "Fun Events",
];

// ── Partners & supporting institutions ──
export const partners: Partner[] = [
  { name: "De Montfort University, Leicester", logoUrl: "/images/partners/de-montfort.jpg" },
  { name: "StudyIn", logoUrl: "/images/partners/study-in.jpg" },
  { name: "Visa", logoUrl: "/images/partners/visa.jpg" },
  { name: "Partner College 1", logoUrl: "/images/partners/college-1.png" },
  { name: "Partner College 2", logoUrl: "/images/partners/college-2.png" },
  { name: "Partner College 3", logoUrl: "/images/partners/college-3.png" },
  { name: "Partner College 4", logoUrl: "/images/partners/college-4.png" },
  { name: "Partner College 5", logoUrl: "/images/partners/college-5.png" },
  { name: "Partner College 6", logoUrl: "/images/partners/college-6.png" },
  { name: "Partner College 7", logoUrl: "/images/partners/college-7.png" },
  { name: "Partner College 8", logoUrl: "/images/partners/college-8.png" },
];

// ── Shared registration steps ──
export const registrationSteps: RegistrationStep[] = [
  { step: 1, title: "Create an Account", description: "Register by providing your basic details such as name, email, and password. This will create your unique account for the event." },
  { step: 2, title: "Select the Competition", description: "Browse the list of available competitions and select the one you're interested in. Ensure it aligns with your interests and skills." },
  { step: 3, title: "Fill the Form", description: "Complete the registration form with the necessary details, such as participant information, category, and additional required specifics." },
  { step: 4, title: "Payment", description: "Proceed to payment to confirm your registration. Choose your preferred payment method and ensure the transaction is completed." },
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
    title: "Noble Appreciation From Raj Bhavan",
    subtitle:
      "The Youth United Council of India (YUCI) received prestigious recognition for its commendable contributions. Awards of appreciation were presented by esteemed dignitaries:",
    details: [
      "Sri Jishnu Dev Varma, Governor of Telangana, at Raj Bhavan, Hyderabad.",
      "Shri K. Kailashnathan, Lieutenant Governor of Puducherry, at Raj Bhavan, Puducherry.",
    ],
    images: [
      "/images/recognition/award-1.jpg",
      "/images/recognition/award-2.jpg",
      "/images/recognition/award-3.jpg",
      "/images/recognition/award-4.jpg",
    ],
  },
  govInitiatives: {
    label: "Aligned With",
    title: "Government of India Initiatives",
    subtitle:
      "YUF proudly supports and aligns with key national programs promoting youth development.",
    cards: [
      { title: "Proudly Made in India", description: "Support Local, Buy Indian products.", image: "/images/gov/make-in-india.avif" },
      { title: "Fit India", description: "Fit India: Because a Healthy Nation is a Wealthy Nation.", image: "/images/gov/fit-india.jpg" },
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
      "Our mission is to inspire and empower the next generation of leaders, innovators, and changemakers by providing them with the resources, mentorship, and opportunities they need to realize their potential.",
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
      "By participating in YUF, you are joining a global community of passionate, creative, and driven individuals. YUF is not just an event; it's a movement.",
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
      { number: 5000, suffix: "K+", label: "Youth Participants" },
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

// Re-export advisor for shared use on home + about
export const advisor: Advisor = siteConfig.advisor;
