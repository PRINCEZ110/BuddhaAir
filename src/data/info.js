/**
 * Royal Club and special-assistance content.
 *
 * No membership prices, tier thresholds or partner benefits are stated,
 * because those are commercial terms we cannot verify. The Royal Club
 * copy is limited to the benefits the operator has publicly described, and
 * everything else is framed as "confirmed on the official site".
 */

export const royalClub = {
  kicker: 'Royal Club',
  title: 'Royal Club Membership',
  intro:
    'Royal Club is the airline\'s loyalty programme. Membership is described here in general terms — tier thresholds, redemption values and any fee are commercial terms confirmed by the operator, not by this concept site.',
  benefits: [
    {
      title: 'Discounts and early offers',
      body: 'Members are offered preferential fares and early access to promotions before they are released more widely.'
    },
    {
      title: 'Royal Club points',
      body: 'Points accrue with travel and convert against future journeys. How points earn and redeem is set by the operator.'
    },
    {
      title: 'Flight history and schedules',
      body: 'Members can review their own travel history and schedule information from a personal account.'
    }
  ],
  footnote:
    'Joining is handled by the operator. No membership fee, tier rule or redemption value is quoted on this concept site, because publishing a wrong one would be worse than publishing none.'
}

export const assistance = {
  'special-needs': {
    kicker: 'Special Assistance',
    title: 'Special Needs',
    intro:
      'If you need assistance to move through the airport or to board safely, tell the airline when you book and again at check-in.',
    points: [
      'Request assistance as early as you can, since some airports require arrangements to be confirmed in advance.',
      'Ask about wheelchair and mobility aid handling, and whether it travels in the cabin or the hold.',
      'Assistance is arranged per passenger, per flight — it does not carry across bookings automatically.'
    ],
    footnote: 'Specific arrangements depend on the airport and the flight. Confirm directly with the airline before travel.'
  },
  pets: {
    kicker: 'Special Assistance',
    title: 'Travelling With Pets',
    intro:
      'Pets may travel subject to the airline\'s rules on the number of animals, their size and where they are carried.',
    points: [
      'A pet generally travels in an approved carrier, either in the cabin or in the hold depending on the aircraft and the booking.',
      'Only a limited number of animals can travel on any single flight, so capacity is booked, not assumed.',
      'Service animals are handled under separate arrangements and are not treated as ordinary pets.'
    ],
    footnote: 'Carrier specification, animal numbers and fees are confirmed by the airline at booking.'
  },
  medical: {
    kicker: 'Special Assistance',
    title: 'Medical Information',
    intro:
      'If you have a medical condition, a recent operation, or take regular medication, tell the airline before you fly.',
    points: [
      'The airline may ask about medication carried on board and how it is stored during the flight.',
      'Cabin pressure and altitude can affect some conditions; your own medical advice takes priority over anything on this page.',
      'A medical clearance may be required for certain conditions. It is your clinician, not this site, who decides.'
    ],
    footnote: 'This is general guidance and not medical advice. Speak to your clinician and the airline before travelling.'
  },
  pregnancy: {
    kicker: 'Special Assistance',
    title: 'Pregnant Women',
    intro:
      'Most airlines set a gestational limit for travel, and it is a medical threshold rather than an airline preference.',
    points: [
      'A limit usually applies in the final weeks before the due date, and it varies by operator and by route.',
      'You may be asked for a medical clearance date-checked by the airline.',
      'Seat belt use is required at all times; the crew will advise on the safest position.'
    ],
    footnote: 'The gestational limit and documentation required are set by the operator. Confirm before booking.'
  },
  children: {
    kicker: 'Special Assistance',
    title: 'Travelling With Children',
    intro:
      'Children travel on the same aircraft as adults, with some conditions on age, seating and documentation.',
    points: [
      'An infant may travel either in a seat with an approved child restraint, or on an adult lap depending on the booking.',
      'Seat selection for a child travelling separately is restricted so that an adult is seated nearby.',
      'A birth certificate or passport may be required for an infant, and a child passport for international travel.'
    ],
    footnote: 'Age, seating and document rules are set by the operator and by the destination country.'
  },
  minors: {
    kicker: 'Special Assistance',
    title: 'Unaccompanied Minors',
    intro:
      'A minor travelling without an adult needs to be accepted by the airline in advance. It is a service, not a default.',
    points: [
      'The service must be arranged and confirmed before travel, and it is normally limited to a defined age range.',
      'The parent or guardian completes the handover and collection paperwork in person, and should carry identification.',
      'Staff at the departure and arrival airports handle the handover directly to the named adult.'
    ],
    footnote: 'Age limits, fees and the exact handover procedure are confirmed by the airline before travel.'
  }
}

export const legal = {
  privacy: {
    kicker: 'Legal',
    title: 'Privacy',
    body: [
      'This is a concept experience built for demonstration. It is not a commercial website and does not process bookings or payments.',
      'The only data it handles is what your browser stores locally, such as your scroll position and your motion preference. There is no account, no tracking pixel and no analytics script.',
      'No personal information is transmitted anywhere. Fonts are loaded from Google Fonts, which means your browser makes a request to that service when the page loads.'
    ]
  },
  terms: {
    kicker: 'Legal',
    title: 'Terms',
    body: [
      'This site is a non-commercial design concept. It is not affiliated with, endorsed by, or operated by Buddha Air.',
      'Flight times, routes and fleet composition are reproduced from publicly available information for demonstration. Any errors are ours, not the operator\'s.',
      'Nothing on this site constitutes a ticket, a fare, or an offer to sell travel. To book a real flight, use buddhaair.com.'
    ]
  },
  accessibility: {
    kicker: 'Legal',
    title: 'Accessibility',
    body: [
      'The site is built to be usable without the 3D layer. If WebGL is unavailable, a static 2D scene is shown and every piece of content, form and link still works.',
      'All controls are real buttons and form fields with associated labels. Dialogs trap focus, close on Escape and return focus to the trigger.',
      'If you set reduced motion in your system preferences, camera travel, scene animation and transitions are disabled and a single coherent static scene is shown instead.',
      'Airlines publish their own accessibility arrangements and special assistance separately. Contact details are on buddhaair.com.'
    ]
  }
}
