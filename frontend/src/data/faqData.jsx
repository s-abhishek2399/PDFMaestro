// src/data/faqData.js
export const faqCategories = [
  {
    categoryName: "General Questions",
    faqs: [
      {
        question: "What is PDFMaestro?",
        answer: "PDFMaestro is your go-to online platform for a comprehensive suite of PDF tools. We provide simple, fast, and effective solutions for converting, editing, managing, and securing your PDF documents, all completely free to use!"
      },
      {
        question: "Is PDFMaestro really free?",
        answer: "Yes! All tools on PDFMaestro are completely free to use. The only limitation you might encounter is a generous file size limit per operation, which ensures smooth performance for all our users. There are no hidden costs or premium-only features."
      },
      {
        question: "Are my uploaded files secure with PDFMaestro?",
        answer: "Absolutely. We prioritize your privacy and data security. All file transfers use secure HTTPS connections. Your uploaded files are processed on our servers and are automatically and permanently deleted within a short period (typically 1-2 hours) after processing. We do not view, store long-term, or share your file content."
      },
      {
        question: "Do I need to install any software or create an account?",
        answer: "No installation is required! PDFMaestro is entirely web-based, accessible directly from your favorite browser (like Chrome, Firefox, Safari, or Edge). You also do not need to create an account to use our tools, making it quick and easy to get started."
      },
      {
        question: "What browsers are supported?",
        answer: "PDFMaestro is designed to work well on all modern web browsers, including Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge. For the best experience, we recommend using the latest version of your browser."
      }
    ]
  },
  {
    categoryName: "Using the Tools",
    faqs: [
      {
        question: "How accurate are the PDF conversions (e.g., PDF to Word)?",
        answer: "We strive for the highest accuracy in all our conversions. However, PDF is a complex format primarily designed for viewing, not editing. The conversion quality, especially for formats like Word or Excel, can depend on the original PDF's structure. PDFs created from digital sources (rather than scanned images) generally convert best. For scanned PDFs, text extraction might be limited unless OCR (Optical Character Recognition) is available for that specific tool."
      },
      {
        question: "What are the typical file size limits?",
        answer: "To ensure optimal performance for everyone, we have file size limits that vary slightly per tool (e.g., 50MB for some conversions, 100MB for others like merging). These limits are generally quite generous for most common use cases. If you encounter an issue, please ensure your file is within the indicated limit on the tool's page."
      },
      {
        question: "How long can I download my processed files?",
        answer: "For your security, download links for processed files are active for a limited time, typically 1-2 hours. After this period, the files are permanently removed from our servers."
      },
      {
        question: "What if a tool doesn't work as expected?",
        answer: "While we test our tools thoroughly, PDF files can be very diverse. If you encounter an issue, please try the following: 1. Ensure your input file is not corrupted and is of the correct type. 2. Check if your file is within the size limits. 3. Try a different browser. If the problem persists, please feel free to reach out to our support – we appreciate your feedback!"
      }
    ]
  }
  // Removed "Account & Billing" category
];