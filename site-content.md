# Youth United Festival 2025 — Complete Website Content (Migration Reference)

> Source: static site in `/site` (index, about, events, registration, contact).
> This document captures **all text verbatim** plus image asset paths, SEO meta, link targets,
> form fields, and microcopy needed to rebuild the site in Next.js.

---

## Global / Shared Elements

### Brand
- **Site name:** Youth United Festival
- **Sub-brand:** YUCI — India
- **Organization:** Youth United Council of India (YUCI)
- **Tagline:** United Youth Will Unite Nation
- **Logo:** `/wp-content/uploads/2024/12/YUF-Logo.png`
- **Favicon:** `/wp-content/uploads/2024/12/YUF-Logo.png`
- **Fonts:** Roboto Slab (400,700) + Poppins (400,500,600,700) — Google Fonts
- **Icons:** Font Awesome 6.5.0

### Primary Navigation (all pages)
| Label | Target |
|---|---|
| Home | `index.html` (`/`) |
| About Us | `about.html` (`/about`) |
| Events | `events.html` (`/events`) |
| Contact | `contact.html` (`/contact`) |
| Register Now (CTA) | `registration.html` (`/register`) |

### Footer (identical on all pages)
**About blurb:**
"The Youth United Festival (YUF), organized by the Youth United Council of India with support from the Government of India, Tamil Nadu, and international bodies, celebrates youth creativity, innovation, and unity. Join us to showcase talents, connect globally, and shape an inclusive future!"
*(Note: the home page uses the full sentence above; about/events/registration/contact pages omit the final "Join us to showcase…" sentence.)*

**Social links:** Facebook · Twitter/X · Instagram · YouTube (all `#` placeholders)

**Quick Links:** Home · About Us · Events · Contact Us · FAQs (`#`)

**Useful Links:** Register Now · Privacy Policy (`#`) · Terms & Conditions (`#`) · FAQs (`#`)

**Contacts:**
- Phone: `+91 12334 12345`
- Email: `info@youthunitedcouncilofindia.org`
- Address: `NO 603, BLOCK E2, Akshaya Today, Thaiyur B Village, Chengalpet Taluk, Kanchipuram District, Chennai, 603103, Tamil Nadu, India`

**Footer bottom:**
- Copyright: `© 2025 Youth United Council of India | All Rights Reserved`
- Bottom links: Privacy Policy (`#`) · Terms of Use (`#`) · Contact (`contact.html`)

**Back-to-top button** present on every page.

---

# PAGE 1 — Home (`index.html` → `/`)

### SEO / Meta
- **Title:** Youth United Festival 2025 — Celebrating Youth Talent, Innovation & Unity
- **Description:** Youth United Festival (YUF) 2025 — organized by Youth United Council of India. A platform celebrating youth talent, innovation, sports, arts, and unity across India.
- **Keywords:** Youth United Festival, YUF 2025, YUCI, Youth Talent, Indian Youth Parliament, India's Young Scientist, Youth Events India
- **OG title:** Youth United Festival 2025
- **OG description:** Celebrating Youth Talent, Innovation, and Unity — Register for YUF 2025.
- **OG image:** `/wp-content/uploads/2024/12/Banner-1.jpg`
- **OG type:** website

### Hero
- **Background:** `/wp-content/uploads/2024/12/Home-Banner-bg-1.png`
- **Badge:** ⭐ YUF 2025 — Now Open
- **Title:** Youth United Festival **2025**
- **Subtitle:** Celebrating Youth Talent, Innovation, and Unity. Join thousands of young leaders, artists, athletes, and innovators from across India.
- **Buttons:** 🚀 Join Now → `events.html` · ℹ️ Learn More → `about.html`

### Marquee Ticker
Youth Talent Icon · Indian Youth Parliament · India's Young Scientist · Arts & Culturals · Sports and Games · Strength & Fitness *(set repeats twice for seamless loop)*

### Section: Who We Are
- **Label:** About YUCI
- **Title:** Who We Are
- **Subhead:** United Youth Will Unite Nation
- **Body 1:** We are **Youth United Council of India**, a nonprofit organization dedicated to empowering youth worldwide. With a focus on inclusivity and collaboration, we create opportunities for young individuals to showcase their talents and drive change through transformative initiatives like the Youth United Festival (YUF).
- **Body 2:** Through our efforts, we aim to inspire, innovate, and unite youth as changemakers, building a brighter and more inclusive future for all. Together, we amplify the voices of youth to shape the world.
- **Feature list:**
  - 👥 **Inclusive Community** — Open to every young person regardless of background, region, or discipline.
  - 💡 **Innovation-Driven** — Fostering creativity and problem-solving across arts, science, and technology.
  - 🤝 **National Impact** — Recognized and supported by state governors and national institutions.
- **Button:** Learn More → `about.html`
- **Images:** `/wp-content/uploads/2024/12/Modi-image.jpg` (alt: "Youth United Festival recognition from government"); badge overlay `/wp-content/uploads/2024/12/YUCI-Logo.png`

### Section: Stats
| Number | Label |
|---|---|
| 5000K+ | Participation |
| 28+ | States |
| 100+ | Districts |
| 10+ | Locations |
*(numbers animate from 0; data-count = 5000 / 28 / 100 / 10)*

### Section: Join Us at YUF!
- **Label:** Get Involved
- **Title:** Join Us at YUF!
- **Image:** `/wp-content/uploads/2024/12/Join-us-bg-1.jpg`
- **Body 1:** Showcase your skills, connect with peers, and drive change at the Youth United Festival (YUF). Whether you're a performer, innovator, athlete, or changemaker, there's a platform waiting for you to shine.
- **Body 2:** The Youth United Festival (YUF), organized by the Youth United Council of India with support from the Government of India, Tamil Nadu, and international bodies, celebrates youth creativity, innovation, and unity.
- **Buttons:** ✏️ Register now! → `registration.html` · View Events → `events.html`

### Section: Nobel Appreciation From Raj Bhavan
- **Label:** Recognition
- **Title:** Nobel Appreciation From Raj Bhavan
- **Subtitle:** The Youth United Council of India (YUCI) received prestigious recognition for its commendable contributions. Awards of appreciation were presented by esteemed dignitaries:
- **Details:**
  - **Sri Jishnu Dev Varma**, Governor of Telangana, at Raj Bhavan, Hyderabad.
  - **Shri K. Kailashnathan**, Lieutenant Governor of Puducherry, at Raj Bhavan, Puducherry.
- **Slider images:** `/wp-content/uploads/2024/12/Awards-slide-2.jpg`, `Awards-slide-3.jpg`, `Awards-slide-1.jpg`

### Section: Government of India Initiatives
- **Label:** Aligned With
- **Title:** Government of India Initiatives
- **Subtitle:** YUF proudly supports and aligns with key national programs promoting youth development.
- **Cards:**
  - **Proudly Made in India** — Support Local, Buy Indian products — `/wp-content/uploads/2024/12/Make-in-india-Logo-1.avif`
  - **Fit India** — Fit India: Because a Healthy Nation is a Wealthy Nation — `/wp-content/uploads/2024/12/fit-india-fit-india-01-01.jpg`
  - **Skill India** — Empowering Youth, Building the Nation — `/wp-content/uploads/2024/12/Skill-India_Preview.png`

### Section: Principal Advisor
- **Label:** Leadership
- **Title:** A Word From Our Principal Advisor
- **Quote:** "My aim towards the youth community is to contribute my part in moulding the future pillars of our country i.e our youth in all aspects of life. Let us not forget the fact that more empowered our youth are more empowered our country is."
- **Name:** Dr. T K Sundaramurthy
- **Title:** Ex. Mission Director, ISRO India
- **Image:** `/wp-content/uploads/2024/12/T-K-Sundaramurthy-photo.jpg`
- **Badge:** Principal Advisor YUCI

### Section: Exciting Events Ahead (preview)
- **Label:** What's Happening
- **Title:** Exciting Events Ahead
- **Subtitle:** Empowering Youth, Inspiring Creativity and Change — explore our exciting lineup designed to engage, inspire, and transform.
- **Cards:**
  - **Arts & Culturals** (Culture) — A vibrant showcase for young artists in music, dance, drama, and creative expression. → `events.html#arts` — `/wp-content/uploads/2024/12/Art-and-Culturals.png`
  - **Sports and Games** (Sports) — Compete, collaborate, and build team spirit through a wide range of exciting sports events. → `events.html#sports` — `/wp-content/uploads/2024/12/Outdoor-Sports.jpg`
  - **Innovation & Politics** (Innovation) — Young minds discuss policy, science, technology, and leadership shaping India's future. → `events.html#innovation` — `/wp-content/uploads/2024/12/Innovation-Politics.png`
- **Button:** View All Events → `events.html`

### Section: Steps to Register
- **Label:** How It Works
- **Title:** Steps to Register
- **Subtitle:** Follow these simple steps to register for your desired competition. Create an account, choose your competition, fill out the registration form, and complete the payment process.
- **Steps:**
  1. **Create an Account** — Register by providing your basic details such as name, email, and password. This will create your unique account for the event.
  2. **Select the Competition** — Browse the list of available competitions and select the one you're interested in. Ensure it aligns with your interests and skills.
  3. **Fill the Form** — Complete the registration form with the necessary details, such as participant information, category, and additional required specifics.
  4. **Payment** — Proceed to payment to confirm your registration. Choose your preferred payment method and ensure the transaction is completed.
- **Button:** ✏️ Register Now → `registration.html`

### Section: Why Join Us
- **Background:** `/wp-content/uploads/2024/12/Why-join-us-bg.jpg`
- **Label:** Why Choose YUF
- **Title:** Why Join Us
- **Subtitle:** Joining Youth United Festival (YUF) means becoming part of a global movement that celebrates creativity, innovation, and unity.
- **Cards:**
  - 🏆 **Partner with Us** — Perform, innovate, and lead in diverse categories. Gain recognition at state and national levels.
  - 🎓 **Collaborate & Learn** — Gain valuable insights from workshops, expert talks, and networking with driven peers.
  - ❤️ **Make an Impact** — Contribute to community service initiatives and create meaningful, lasting change in society.

### Section: Supporting Partners
- **Label:** Our Community
- **Title:** Supporting Partners
- **Logos:** `/wp-content/uploads/2024/12/Clients-Logo-1.png` … `Clients-Logo-9.png` (9 logos, duplicated for infinite carousel)

### Section: CTA Banner
- **Background:** `/wp-content/uploads/2024/12/Banners-bg-3.jpg`
- **Label:** Get Started Today
- **Title:** Get Involved Today
- **Body:** The Youth United Festival (YUF), organized by the Youth United Council of India with support from the Government of India, Tamil Nadu, and international bodies, celebrates youth creativity, innovation, and unity. Join us to showcase talents, connect globally, and shape an inclusive future!
- **Buttons:** 🚀 Let's Go! → `registration.html` · Contact Us → `contact.html`

---

# PAGE 2 — About Us (`about.html` → `/about`)

### SEO / Meta
- **Title:** About Us — Youth United Festival 2025
- **Description:** Learn about Youth United Council of India (YUCI) — our mission, what we do, and how YUF empowers the next generation of leaders, innovators, and changemakers.

### Hero
- **Background:** `/wp-content/uploads/2024/12/about-us.jpg`
- **Badge:** ℹ️ About Us
- **Title:** Youth United Festival
- **Subtitle:** Empowering the Next Generation of Leaders
- **Buttons:** ✏️ Register Now → `registration.html` · View Events → `events.html`

### Section: Who We Are
- **Label:** Our Story
- **Title:** Who We Are
- **Subhead:** United Youth Will Unite Nation
- **Body 1:** We are **Youth United Council of India (YUCI)**, a nonprofit organization dedicated to empowering youth worldwide. With a focus on inclusivity and collaboration, we create opportunities for young individuals to showcase their talents and drive change through transformative initiatives like the Youth United Festival (YUF).
- **Body 2:** Through our efforts, we aim to inspire, innovate, and unite youth as changemakers, building a brighter and more inclusive future for all. Together, we amplify the voices of youth to shape the world.
- **Button:** Learn More → `registration.html`
- **Images:** `/wp-content/uploads/2024/12/about-us-2.jpg`; badge `/wp-content/uploads/2024/12/YUCI-Logo.png`

### Section: Our Mission
- **Label:** Our Purpose
- **Title:** Our Mission
- **Image:** `/wp-content/uploads/2024/12/Our-mission-2.png`
- **Body 1:** Our mission is to inspire and empower the next generation of leaders, innovators, and changemakers by providing them with the resources, mentorship, and opportunities they need to realize their potential.
- **Body 2:** We aim to encourage youth participation, ignite creativity, and promote dialogue across diverse fields — from performing arts to technology and innovation. YUF fosters a sense of community, unity, and growth that reaches beyond the festival itself, encouraging long-lasting impact and collaboration.
- **Cards:**
  - 🎯 **Our Vision** — A world where every young person has the platform to lead, innovate, and inspire.
  - ❤️ **Our Values** — Inclusivity, creativity, collaboration, integrity, and youth empowerment.

### Section: What We Do
- **Label:** Our Activities
- **Title:** What We Do
- **Subtitle:** At YUF, we curate a variety of events designed to engage and inspire the youth. Some of our most anticipated activities include:
- **Cards:**
  - 🎭 **Cultural Performances** — A platform for young artists to display their skills in music, dance, and drama. From classical to contemporary, every form of expression is celebrated.
  - 💡 **Technology & Innovation Exhibitions** — Showcasing groundbreaking innovations from young minds in the fields of tech and science. A space for tomorrow's inventors and thinkers.
  - 🏆 **Sports Challenges** — A chance for youth to compete, collaborate, and build team spirit through various sports events ranging from athletics to martial arts.
  - 🎓 **Workshops & Leadership Talks** — Offering expert guidance on career development, leadership, and personal growth. Connect with mentors and industry leaders who inspire.

### Section: Why Join Us
- **Background:** `/wp-content/uploads/2024/12/Why-join-us-bg.jpg`
- **Label:** Be Part of Something Bigger
- **Title:** Why Join Us
- **Subtitle:** By participating in YUF, you are joining a global community of passionate, creative, and driven individuals. YUF is not just an event; it's a movement.
- **Cards:**
  - ⭐ **Showcase Your Talents** — Whether you're an artist, innovator, athlete, or leader, YUF gives you the platform to shine in front of thousands.
  - 📖 **Learn & Grow** — Gain valuable insights through workshops, talks, and networking opportunities with experts, peers, and national icons.
  - 🌐 **Make a Difference** — Contribute to meaningful change by participating in community service and social impact initiatives.

### Section: Our Impact
- **Label:** What We've Built
- **Title:** Our Impact
- **Body 1:** Since our inception, YUF has attracted thousands of youth participants from around the globe, empowering them to create lasting change. With a focus on diversity, innovation, and leadership, YUF continues to grow each year.
- **Body 2:** We believe that when youth come together, great things happen. YUF is about building a future where creativity, knowledge, and unity drive positive change for all.
- **Stats:** 5000K+ Youth Participants · 28+ States Covered · 100+ Districts · 50+ Events Held
- **Image:** `/wp-content/uploads/2024/12/our-Impact.jpg`

### Section: Principal Advisor
- **Label:** Leadership
- **Title:** Principal Advisor
- **Quote:** "My aim towards the youth community is to contribute my part in moulding the future pillars of our country i.e our youth in all aspects of life. Let us not forget the fact that more empowered our youth are more empowered our country is."
- **Name:** Dr. T K Sundaramurthy — Ex. Mission Director, ISRO India
- **Image:** `/wp-content/uploads/2024/12/T-K-Sundaramurthy-photo.jpg`

### Section: CTA Banner
- **Background:** `/wp-content/uploads/2024/12/Banners-bg-3.jpg`
- **Label:** Ready to Join?
- **Title:** Be Part of the Movement
- **Body:** Join thousands of young leaders, artists, athletes, and innovators at Youth United Festival 2025. Your talent deserves a stage.
- **Buttons:** ✏️ Register Now → `registration.html` · Explore Events → `events.html`

---

# PAGE 3 — Events (`events.html` → `/events`)

### SEO / Meta
- **Title:** Events — Youth United Festival 2025
- **Description:** Explore all YUF 2025 events — Arts & Culturals, Sports & Games, Indian Youth Parliament, India's Young Scientists, Youth Talent Icon, and more.

### Hero
- **Background:** `/wp-content/uploads/2024/12/events-bg-1.jpg`
- **Badge:** 📅 YUF 2025 Events
- **Title:** Youth United Festival **2025**
- **Subtitle:** Celebrating Youth Talent, Innovation, and Unity — explore our full lineup of events designed to engage, inspire, and transform.
- **Buttons:** ✏️ Register Now → `registration.html` · 📋 Browse Events → `#events-list`

### Marquee Ticker
Youth Talent Icon · Indian Youth Parliament · India's Young Scientist · Arts & Culturals · Sports and Games · Fun Events

### Intro
- **Label:** Empowering Youth
- **Title:** Exciting Events Ahead
- **Subtitle:** Explore our exciting lineup of events designed to engage, inspire, and transform. From cultural performances to tech exhibitions and sports challenges, there's something for everyone to participate in. Join us and be part of the movement!

### Filter Tabs
All Events · Arts & Culturals · Sports & Games · Innovation · Fun Events

### Category: Arts & Culturals
*Sub-label: A vibrant showcase for young creative talents*

| Event | Tag | Image | Description |
|---|---|---|---|
| Acapella Competition | Music | `Acapella-Competition.jpg` | Showcase your vocal harmony and group singing abilities in this exhilarating acapella competition. |
| Performing Arts | Performance | `Performing-arts.jpg` | A stage for young dancers, actors, and musicians to express themselves and captivate audiences. |
| Costume Designing | Fashion | `CostumeDesigning.jpg` | Design and showcase original costumes that blend creativity, culture, and craftsmanship. |
| Creative & Fashion Show | Fashion | `Creative-and-Fashion.jpg` | Walk the ramp and display your unique sense of style in this exciting fashion showcase. |
| Makeup & Saree Draping | Beauty | `Makeup-Over-Saree-Drapping.jpg` | A unique event celebrating the art of Indian beauty culture and traditional saree draping techniques. |
| Literary & Artistic | Literary | `Literary-and-Artistic.jpg` | Competitions in poetry, creative writing, debate, painting, and other artistic disciplines. |
| Media & Communication | Media | `Media-and-communication.jpg` | Events for budding journalists, photographers, film-makers, and digital content creators. |
| Duet Competition | Music | `DUET.png` | Pair up and perform in this soulful duet music competition open to all genres. |

### Category: Sports & Games
*Sub-label: Compete, collaborate, and build team spirit*

| Event | Tag | Image | Description |
|---|---|---|---|
| Outdoor Sports | Outdoor | `Outdoor-Sports.jpg` | A range of outdoor athletic competitions — track, field events, and team sports for all age groups. |
| Indoor Sports | Indoor | `Indoor-Sports.jpg` | Exciting indoor competitions including chess, carrom, table tennis, badminton, and more. |
| Strength & Fitness | Fitness | `Strength-and-Fitness.jpg` | Demonstrate physical endurance and strength in fitness challenges designed for youth athletes. |
| Athletics | Athletics | `Athletics.jpg` | Sprint, relay, long jump, shot put, and more — compete in classic track and field events. |
| Martial Arts | Martial Arts | `Martial-Arts.jpg` | Showcase discipline, technique, and agility in competitive martial arts demonstrations and bouts. |
| Tug of War | Team | `Tug-of-War.png` | A classic team event testing strength, coordination, and teamwork under competitive conditions. |

### Category: Innovation & Politics
*Sub-label: Youth leadership, science, and national dialogue*

| Event | Tag | Image | Description |
|---|---|---|---|
| Indian Youth Parliament | Parliament | `Indias-1.png` | Debate national policies, propose solutions, and experience the democratic process first-hand. |
| India's Young Scientist | Science | `Indias-2.png` | Present your scientific research, innovations, and inventions to a panel of distinguished judges. |
| Youth Talent Icon | Talent | `Youth-talent-events.png` | The ultimate talent showcase — demonstrate your unique skill and win the coveted Youth Talent Icon title. |
| Technical Workshops | Tech | `Technical-Events.jpg` | Hands-on workshops in coding, robotics, AI, and engineering led by industry professionals. |
| Non-Technical Workshops | Workshop | `Non-Technical-Events.jpg` | Soft skills, entrepreneurship, public speaking, leadership, and career development sessions. |
| Business Intelligence | Business | `Business-Intelligence-Competitions.jpg` | Pitch your startup idea, analyze business cases, and compete in entrepreneurship challenges. |

### Category: Fun Events
*Sub-label: Lighthearted activities for everyone*

| Event | Tag | Image | Description |
|---|---|---|---|
| Selfie Treasure Hunt | Fun | `Selfie-Teasure-hunt-game.jpg` | A fun-filled campus treasure hunt where teams solve clues and capture selfies at each checkpoint. |
| Special Sports | Fun | `Special-sports.jpg` | Unconventional and entertaining sports games bringing laughter, teamwork, and friendly competition. |
| Collaborate & Learn | Social | `Collaborate-Learn.jpg` | Interactive group activities designed to foster friendships, creativity, and collaborative problem-solving. |

*(All event card images are under `/wp-content/uploads/2024/12/`. Each card "Register" button → `registration.html`.)*

### Section: Steps to Register
- **Label:** How It Works · **Title:** Steps to Register
- **Subtitle:** Follow these simple steps to register for your desired competition.
  1. **Create an Account** — Register by providing your basic details such as name, email, and password. This will create your unique account for the event.
  2. **Select the Competition** — Browse the list of available competitions and select the one you're interested in. Ensure it aligns with your interests and skills.
  3. **Fill the Form** — Complete the registration form with the necessary details, such as participant information, category, and required specifics.
  4. **Payment** — Proceed to payment to confirm your registration. Choose your preferred payment method and ensure the transaction is completed.
- **Button:** ✏️ Register Now → `registration.html`

### Section: Stats
5000K+ Participation · 28+ States · 100+ Districts · 10+ Locations

### Section: CTA Banner
- **Background:** `/wp-content/uploads/2024/12/Register-bg.jpg`
- **Label:** Don't Miss Out
- **Title:** Transforming Lives Through Youth Power
- **Body:** Discover how YUF initiatives are transforming lives and empowering individuals to achieve their full potential. Join the movement today.
- **Buttons:** 🚀 Register for YUF 2025 → `registration.html` · Get in Touch → `contact.html`

---

# PAGE 4 — Register (`registration.html` → `/register`)

### SEO / Meta
- **Title:** Register — Youth United Festival 2025
- **Description:** Register for Youth United Festival 2025. Choose your event category, fill in your details, and complete payment to secure your spot at YUF 2025.

### Hero
- **Background:** `/wp-content/uploads/2024/12/Register-bg.jpg`
- **Badge:** ✏️ Registration Open
- **Title:** Register for **YUF 2025**
- **Subtitle:** Secure your spot at the Youth United Festival 2025. Choose your event, fill your details, and complete payment in minutes.

### Progress Indicator
1 Personal Info → 2 Event Selection → 3 Payment → 4 ✓ Confirmed

### Registration Form (`#registration-form`)
**Heading:** Registration

**Section — Personal Details** 👤
| Field | Type | Placeholder | Required | Autocomplete |
|---|---|---|---|---|
| First Name | text | Enter your first name | Yes | given-name |
| Last Name | text | Enter your last name | Yes | family-name |
| Phone Number | tel | Enter your phone number | Yes | tel |
| Email Address | email | Enter your email | Yes | email |

**Section — Institution Details** 🏫
| Field | Type | Options / Placeholder | Required |
|---|---|---|---|
| Location | select | Select a location / Chennai / Coimbatore / Pondicherry | Yes |
| College / School | text | Enter your college or school name | Yes |

**Section — Event Selection** 📅
| Field | Type | Options | Required |
|---|---|---|---|
| Event Category | select | Select a category / Arts & Culturals / Sports & Games | Yes |
| Event | select | (populated dynamically based on category; default "Select a category first") | Yes |

**Age Category** (radio, required): 11 – 13 yrs · 14 – 16 yrs · 17 – 20 yrs · 21 – 23 yrs

**Message / Special Requests** (textarea): placeholder — "Any special requests, accessibility needs, or additional information you'd like to share..."

**Registration Fee** 💰: "Amount to Pay" — dynamic value (default "—")

**Payment note:** 🛡️ Secure payment powered by **Razorpay**. We accept UPI, cards, net banking & wallets.

**Submit button:** 🔒 Pay & Complete Registration

**Disclaimer:** By registering you agree to our Terms & Conditions (`#`) and Privacy Policy (`#`).

*Razorpay checkout SDK loaded: `https://checkout.razorpay.com/v1/checkout.js`*

### Sidebar — Registration Summary
- **Heading:** Registration Summary
- **Price:** ₹ — (per participant; dynamic)
- **Included features:**
  - 🏅 Participation Certificate
  - 🥇 Merit Awards & Trophies
  - 👕 YUF 2025 Merchandise
  - 🍽️ Refreshments & Meals
  - 📷 Professional Photography
  - 👥 Networking Opportunities
- **Info strip:** ⏰ Registration closes **31 January 2025** · 📞 Need help? Call **+91 12334 12345**

**Event Locations card:**
- Chennai — Tamil Nadu
- Coimbatore — Tamil Nadu
- Pondicherry — Union Territory

**Need Assistance? card:** 🎧 "Our team is ready to help you with registration." → Contact Us (`contact.html`)

### Section: Recognition
- **Label:** Recognition
- **Title:** Nobel Appreciation From Raj Bhavan
- **Subtitle:** YUCI received prestigious recognition from esteemed government dignitaries across India.
- **Images:** `Awards-slide-1.jpg`, `Awards-slide-2.jpg` (alt: Governor of Telangana), `Awards-slide-3.jpg` (alt: Lt Governor Puducherry)

---

# PAGE 5 — Contact Us (`contact.html` → `/contact`)

### SEO / Meta
- **Title:** Contact Us — Youth United Festival 2025
- **Description:** Get in touch with Youth United Council of India. We'd love to hear from you — questions, partnerships, event details, or volunteering inquiries.

### Hero
- **Background:** `/wp-content/uploads/2024/12/Contact-us-bg-1.jpg`
- **Badge:** ✉️ Get In Touch
- **Title:** Contact Us
- **Subtitle:** We'd love to hear from you! Whether you have questions, need more details about YUF, or want to get involved — feel free to reach out.
- **Buttons:** 📨 Send a Message → `#contact-form-section` · Register Now → `registration.html`

### Contact Form (`#contact-form`)
**Heading:** Send us a message
| Field | Type | Placeholder / Options | Required |
|---|---|---|---|
| First Name | text | Enter your first name | Yes |
| Last Name | text | Enter your last name | Yes |
| Email Address | email | Enter your email | Yes |
| Phone Number | tel | Enter your phone number | No |
| Subject | select | Select a subject / General Enquiry / Event Registration / Partnership / Sponsorship / Volunteering / Media & Press / Other | Yes |
| Message | textarea | "We'd love to hear from you! Whether you have questions, need more details about YUF, or want to get involved, feel free to write here. We'll get back to you as soon as possible." | Yes |

**Submit button:** 📨 Send Message

*(Subject `<option>` values: general, registration, partnership, volunteer, media, other)*

### Sidebar — Get in touch with us
- 📞 **Phone:** +91 12334 12345
- ✉️ **Email:** info@youthunitedcouncilofindia.org (mailto link)
- 📍 **Address:** NO 603, BLOCK E2, Akshaya Today, Thaiyur B Village, Chengalpet Taluk, Kanchipuram District, Chennai, 603103, Tamil Nadu, India

**Follow our social:** Facebook · Twitter · Instagram · YouTube (all `#`)

**Map:** Google Maps embed — query "Thaiyur B Village, Chengalpet Taluk, Kanchipuram District, Chennai, 603103, Tamil Nadu, India"

### Section: We're Here for You
- **Label:** How We Can Help
- **Title:** We're Here for You
- **Subtitle:** Reach out for any of the following and we'll respond within 24 hours.
- **Cards:**
  - ❓ **General Questions** — Ask anything about YUF 2025 — schedule, venues, eligibility, categories, or participation rules.
  - 🤝 **Partnerships** — Interested in sponsoring or partnering with YUF? We'd love to explore opportunities together.
  - 👥 **Volunteering** — Want to be part of the organizing team? Get in touch to learn about volunteer opportunities at YUF 2025.

### Section: CTA Banner
- **Background:** `/wp-content/uploads/2024/12/Banners-bg-3.jpg`
- **Label:** Ready to Participate?
- **Title:** Get Involved Today
- **Body:** Don't wait — register now for Youth United Festival 2025 and be part of India's biggest youth celebration.
- **Buttons:** ✏️ Register Now → `registration.html` · Browse Events → `events.html`

---

## Appendix — Interactive Behaviors to Reimplement in Next.js

1. **Mobile nav toggle** — hamburger opens/closes nav menu (`aria-expanded`).
2. **Stat counters** — animate from 0 to `data-count` with `data-suffix` (e.g. "K+", "+") on scroll into view.
3. **Fade-in on scroll** — `.fade-in` elements with staggered `data-delay`.
4. **Awards slider** (home) — prev/next buttons + dots, 3 slides.
5. **Partners logo carousel** — infinite horizontal scroll.
6. **Marquee ticker** — seamless looping text.
7. **Events filter tabs** — show/hide category sections + cards by `data-category`.
8. **Registration form** — category→event dependent dropdown, dynamic price display synced to sidebar, progress-step highlight on field focus, Razorpay checkout integration.
9. **Contact form** — client-side validation, subject dropdown.
10. **Back-to-top button** — appears on scroll.

> ⚠️ Pending content (links currently `#`, fill before launch): Privacy Policy, Terms & Conditions, FAQs pages; real social media URLs; final phone number (placeholder `+91 12334 12345`); registration fee amounts per category/event.
