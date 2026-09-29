/**
 * Footer information architecture.
 *
 * Every entry now resolves to something real. The previous version pointed
 * all 25 of these at `#top` behind a preventDefault, so the entire footer
 * navigated nowhere.
 *
 * `target` values:
 *   #anchor   -> scroll to a section id on the page
 *   modal:id  -> open a dialog by key
 *
 * `href` is a real, resolvable fallback so that no link in the markup is
 * ever a bare "#" — the dialog is an enhancement over a working anchor,
 * not the only route to the content.
 */

export const footerColumns = [
  {
    title: 'Get to Know Us',
    links: [
      { label: 'About Us', target: '#company' },
      { label: 'Yatra', target: '#stories' },
      { label: 'Awards', target: '#company' },
      { label: 'Destinations', target: '#destinations' },
      { label: 'Safety', target: '#safety' },
      { label: 'Careers', target: '#careers' }
    ]
  },
  {
    title: 'Quick Links',
    links: [
      { label: 'Offers', target: '#book' },
      { label: 'Royal Club', target: '#royal-club' },
      { label: 'Blog', target: '#stories' },
      { label: 'Flight Routes', target: '#destinations' },
      { label: 'Fare Rules', target: '#fare-rules' },
      { label: 'Contact', target: '#contact' },
      { label: 'FAQ', target: '#faq' },
      { label: 'Baggage', target: '#baggage' },
      { label: 'Cargo', target: '#cargo' }
    ]
  },
  {
    title: 'Special Assistance',
    href: '#assistance',
    links: [
      { label: 'Special Needs', target: 'modal:special-needs' },
      { label: 'Pets', target: 'modal:pets' },
      { label: 'Medical', target: 'modal:medical' },
      { label: 'Pregnancy', target: 'modal:pregnancy' },
      { label: 'Children', target: 'modal:children' },
      { label: 'Unaccompanied Minors', target: 'modal:minors' }
    ]
  },
  {
    title: 'Legal',
    href: '#footer',
    links: [
      { label: 'Privacy', target: 'modal:privacy' },
      { label: 'Terms', target: 'modal:terms' },
      { label: 'Accessibility', target: 'modal:accessibility' }
    ]
  }
]

export const navLinks = [
  { id: 'book', label: 'Book a Flight', target: '#book' },
  { id: 'status', label: 'Flight Status', target: '#status' },
  { id: 'destinations', label: 'Destinations', target: '#destinations' },
  { id: 'experience', label: 'Experience', target: '#mountain-flight' },
  { id: 'royal-club', label: 'Royal Club', target: '#royal-club' }
]

// Everything that is not in the primary bar, reachable from "More".
export const moreLinks = [
  { label: 'The Fleet', target: '#fleet' },
  { label: 'Holidays', target: '#holidays' },
  { label: 'Stories', target: '#stories' },
  { label: 'Special Assistance', target: 'modal:special-needs' },
  { label: 'Company', target: '#company' },
  { label: 'Support', target: '#faq' }
]
