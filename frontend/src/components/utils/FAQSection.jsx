import { useState } from "react";

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Is there a file size limit?",
      answer:
        "No, you can upload files of any size. Our system efficiently handles all file sizes.",
    },
    {
      question: "How secure is my upload?",
      answer:
        "All uploads are securely processed and protected with the latest encryption technologies.",
    },
    {
      question: "Can I edit my uploaded files?",
      answer:
        "Yes, you can edit files directly from our platform without needing to download them first.",
    },
    {
      question: "Are there any subscription plans?",
      answer:
        "We offer both free and premium subscription plans with added benefits for advanced users.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "You can reach out to our customer support team 24/7 through the 'Help' section in the app.",
    },
    {
      question: "Is there a limit on the number of files I can upload?",
      answer:
        "No, you can upload as many files as you want without any restrictions.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="mt-12 py-10 px-6 bg-gradient-to-r from-white to-gray-100 rounded-lg shadow-xl max-w-3xl mx-auto">
      <h3
        className="text-2xl font-bold text-center text-gray-800 mb-8"
        style={{ fontFamily: "cursive" }}
      >
        Frequently Asked Questions
      </h3>
      <div className="space-y-4 text-left">
        {faqs.map((faq, index) => (
          <div key={index}>
            <h4
              className="flex justify-between items-center text-lg font-semibold text-gray-800 cursor-pointer p-3 bg-gray-50 rounded-lg transition duration-300 hover:bg-gray-100"
              onClick={() => toggleAccordion(index)}
            >
              {index + 1}. {faq.question}
              <span
                className={`transform transition-transform ${
                  activeIndex === index ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </h4>
            {activeIndex === index && (
              <p className="text-gray-600 p-4 bg-gray-50 rounded-lg">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
