// src/data/solutionsData.js
import { FiBookOpen, FiBriefcase, FiHome, FiLayers, FiEdit3, FiShield, FiShare2, FiFileText, FiImage } from 'react-icons/fi';
import { toolSpecificIcons } from './toolsData'; // To reuse tool icons

export const solutions = [
  {
    id: 'students-educators',
    title: 'For Students & Educators',
    icon: FiBookOpen,
    description: "Compile research, prepare assignments, and manage academic documents efficiently. PDFMaestro helps you stay organized and present your work professionally.",
    keyProblemsSolved: [
      "Combining multiple research papers into one document.",
      "Reducing large PDF sizes for easy submission.",
      "Converting lecture notes or articles to editable formats.",
      "Adding page numbers for thesis or long reports."
    ],
    relevantTools: [ // List tool names exactly as they appear in toolSpecificIcons or your main tool list
      { name: 'Merge PDF', slug: 'merge-pdf', icon: toolSpecificIcons['Merge PDF'] },
      { name: 'Compress PDF', slug: 'compress-pdf', icon: toolSpecificIcons['Compress PDF'] },
      { name: 'PDF to Word', slug: 'pdf-to-word', icon: toolSpecificIcons['PDF to Word'] },
      { name: 'Add Page Numbers', slug: 'add-page-numbers', icon: toolSpecificIcons['Add Page Numbers'] },
    ],
    ctaText: "Explore Student Tools" // Optional
  },
  {
    id: 'business-professionals',
    title: 'Streamline Business Documents',
    icon: FiBriefcase,
    description: "Enhance your workflow with tools for creating, securing, and distributing professional business documents, from reports to contracts.",
    keyProblemsSolved: [
      "Securing confidential reports with passwords.",
      "Converting spreadsheets and presentations to PDF for sharing.",
      "Extracting data from PDFs into editable Excel sheets.",
      "Preparing documents for client review or internal use."
    ],
    relevantTools: [
      { name: 'Protect PDF', slug: 'protect-pdf', icon: toolSpecificIcons['Protect PDF'] },
      { name: 'Excel to PDF', slug: 'excel-to-pdf', icon: toolSpecificIcons['Excel to PDF'] },
      { name: 'PPT to PDF', slug: 'ppt-to-pdf', icon: toolSpecificIcons['PPT to PDF'] },
      { name: 'PDF to Excel', slug: 'pdf-to-excel', icon: toolSpecificIcons['PDF to Excel'] },
    ],
    ctaText: "Boost Business Productivity"
  },
  {
    id: 'personal-document-management',
    title: 'Personal Document Organization',
    icon: FiHome,
    description: "Manage your personal digital paperwork with ease. Convert scans, organize receipts, or prepare documents for personal use.",
    keyProblemsSolved: [
      "Converting scanned documents or images to PDF.",
      "Reducing file sizes for easy storage and sharing.",
      "Extracting text from image-based PDFs (if OCR existed).", // Placeholder if no OCR
      "Unlocking PDFs when you have the password."
    ],
    relevantTools: [
      { name: 'Images to PDF', slug: 'images-to-pdf', icon: toolSpecificIcons['Images to PDF'] },
      { name: 'Compress PDF', slug: 'compress-pdf', icon: toolSpecificIcons['Compress PDF'] },
      { name: 'Unlock PDF', slug: 'unlock-pdf', icon: toolSpecificIcons['Unlock PDF'] },
      { name: 'PDF to Text', slug: 'pdf-to-text', icon: toolSpecificIcons['PDF to Text'] }
    ],
    ctaText: "Organize Your Files"
  },
  // Add more solution categories as needed
];