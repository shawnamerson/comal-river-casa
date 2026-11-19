const faqs = [
  {
    question: 'Where is Comal River Casa located?',
    answer:
      'Comal River Casa is a 2-bedroom condo at Camp Warnecke in New Braunfels, Texas. It is steps away from the Comal River, directly across from Schlitterbahn waterpark, and minutes from downtown New Braunfels and historic Gruene.',
  },
  {
    question: 'How many guests can Comal River Casa sleep?',
    answer:
      'The condo sleeps 8 guests in 2 bedrooms and 2 bathrooms (1,100 sq ft), with two king beds, a sleeper sofa, and an air mattress. It is a popular pick for family reunions, group getaways, and multi-family trips that want everyone under one roof.',
  },
  {
    question: 'Is Comal River Casa really across from Schlitterbahn?',
    answer:
      'Yes. The condo is directly across the street from Schlitterbahn New Braunfels, so your group can walk to the park gates in the morning, come home for lunch and naps, and head back for the afternoon. No parking fees, no shuttle schedules.',
  },
  {
    question: 'Does the condo have access to the Comal River?',
    answer:
      'Yes. Guests have private river access steps away from the condo, and free tubes are included for float days on the Comal River. The river is spring-fed and stays a refreshing 72 degrees year-round.',
  },
  {
    question: 'Is there a pool and hot tub?',
    answer:
      'Yes. The complex has a resort-style pool and a hot tub with a waterfall on site, steps from the front door, plus a fireplace in the condo for cool evenings.',
  },
  {
    question: 'What is the minimum stay, and what are check-in times?',
    answer:
      'There is a 2-night minimum. Check-in is 4:00 PM and checkout is 11:00 AM. Cancellation is free up to 5 days before check-in.',
  },
  {
    question: 'Why book direct instead of Airbnb or VRBO?',
    answer:
      'Booking direct at comalrivercasa.com gets you the same condo, from $200/night, without the service fees the big platforms add on top. You also deal directly with the owners, Kody and Dahlia.',
  },
  {
    question: 'Is Comal River Casa good for Wurstfest and other New Braunfels events?',
    answer:
      'Yes. The condo is a short walk or quick drive from Landa Park and the Wurstfest grounds, close to Gruene Hall and Whitewater Amphitheater, and steps away from the Comal River, which makes it an easy home base for festival weekends and concerts.',
  },
]

export function FaqSection() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <section className="py-24 px-4 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Questions About Staying in New Braunfels
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>
        <div className="space-y-8">
          {faqs.map((faq) => (
            <div key={faq.question} className="border-b border-gray-200 pb-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
