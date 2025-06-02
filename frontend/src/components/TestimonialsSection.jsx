// src/components/TestimonialsSection.js
import React from 'react';
import { motion } from 'framer-motion';
import { FaQuoteLeft } from 'react-icons/fa'; // For quotes

// Placeholder testimonials
const testimonials = [
  {
    quote: "PDFMaestro has revolutionized how I handle documents for my small business. The batch conversion tools save me hours every week!",
    name: "Aisha Khan",
    role: "Founder, Creative Designs Co.",
    avatar: "https://randomuser.me/api/portraits/women/34.jpg" // Replace with actual or placeholder
  },
  {
    quote: "As a student, managing research papers and lecture notes used to be a nightmare. PDFMaestro's merging and splitting tools are a lifesaver. And it's free!",
    name: "David Miller",
    role: "University Student",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg"
  },
  {
    quote: "The compression quality is fantastic without significant loss. My team can now share PDFs via email without any issues. Highly recommended!",
    name: "Maria Garcia",
    role: "Project Manager, Tech Solutions Inc.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  },
];

const TestimonialsSection = ({ isDarkMode }) => {
  const cardVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
      },
    }),
  };

  return (
    <section className={`py-16 sm:py-24 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100/70'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Loved by <span className={`${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>Users Worldwide</span>
          </h2>
          <p className={`mt-4 text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Hear what people are saying about their experience with PDFMaestro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className={`flex flex-col p-6 rounded-xl shadow-xl overflow-hidden
                          ${isDarkMode 
                            ? 'bg-slate-800 border border-slate-700' 
                            : 'bg-white border border-slate-200'}`}
            >
              <FaQuoteLeft className={`w-8 h-8 mb-4 ${isDarkMode ? 'text-sky-500' : 'text-sky-600'}`} aria-hidden="true" />
              <blockquote className={`flex-grow italic mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                "{testimonial.quote}"
              </blockquote>
              <footer className="flex items-center">
                <img className="w-12 h-12 rounded-full mr-4" src={testimonial.avatar} alt={testimonial.name} />
                <div>
                  <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{testimonial.name}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{testimonial.role}</p>
                </div>
              </footer>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;