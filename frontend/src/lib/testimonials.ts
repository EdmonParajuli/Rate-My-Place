// Marketing copy, not backend data - same "hardcoded, not a query" precedent
// as the marketing landing page's stats strip (docs/specs/phase-4-frontend-mvp.md).
// Ported from prototype/auth-screens and prototype/marketing-landing-page, both
// of which used this exact same set of three testimonials - shared here so the
// auth screens' carousel and the marketing landing page's testimonial grid
// don't drift into showing different quotes for the same three people.
export const TESTIMONIALS = [
  {
    text: "Rate My Place helped me find the best plumber in town when I had an emergency. The reviews were spot on!",
    author: "Sarah Jenkins, Local Guide",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  },
  {
    text: "Claiming my listing changed everything. I can respond to customers directly and show we care.",
    author: "Michael Chen, Café Owner",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
  },
  {
    text: "I love the community feel. People share hidden gems, not just complaints.",
    author: "Emily Rodriguez, Frequent Reviewer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
  },
]
