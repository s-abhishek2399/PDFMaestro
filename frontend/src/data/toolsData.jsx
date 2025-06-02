// src/data/toolsData.js
import {
  FiUploadCloud, FiDownloadCloud, FiShuffle, FiShield, FiEdit3,
  FiFileText, FiGrid, FiPaperclip, FiType, FiImage, FiLayers,
  FiScissors, FiRefreshCw, FiKey, FiUnlock, FiTool, FiFileMinus,
  FiHash, FiCopy, FiGlobe, FiPenTool, FiSettings // Added FiHash, FiCopy, FiGlobe, FiPenTool
} from 'react-icons/fi';
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint } from 'react-icons/fa'; // Using more specific Fa icons

export const toolSpecificIcons = {
  // Convert TO PDF
  'Images to PDF': FiImage,
  'Word to PDF': FaFileWord,
  'Excel to PDF': FaFileExcel,
  'PPT to PDF': FaFilePowerpoint,
  'Text to PDF': FiFileText,
  'HTML to PDF': FiGlobe,

  // Convert FROM PDF
  'PDF to Word': FaFileWord,
  'PDF to Excel': FaFileExcel,
  'PDF to PPT': FaFilePowerpoint,
  'PDF to Image': FiImage,
  'PDF to Text': FiFileText,

  // Organize & Manage
  'Merge PDF': FiLayers,
  'Split PDF': FiScissors,
  'Rotate PDF': FiRefreshCw,
  'Delete Pages': FiFileMinus,
  'Add Page Numbers': FiHash,
  'Extract Pages': FiCopy,

  // Optimize & Secure
  'Compress PDF': FiTool, // FiMinimize2 could also work
  'Protect PDF': FiKey,
  'Unlock PDF': FiUnlock,
  'Repair PDF': FiSettings,

  // Edit & Sign
  'Edit PDF Text': FiEdit3, // Or FiType
  'Add Images to PDF': FiImage, // Different from converter: add image TO a PDF
  'eSign PDF': FiPenTool,

  // Fallback/Generic
  default: FiTool,
};

export const toolCategoriesData = [
  {
    name: 'Convert TO PDF',
    description: 'Transform various file formats into high-quality PDF documents.',
    icon: FiUploadCloud,
    tools: [
      { name: 'Images to PDF', slug: 'images-to-pdf', description: "Combine JPG, PNG, and other images into one PDF." },
      { name: 'Word to PDF', slug: 'word-to-pdf', description: "Convert DOCX and DOC files to PDF.", comingSoon: false },
      { name: 'Excel to PDF', slug: 'excel-to-pdf', description: "Turn your spreadsheets into PDFs.", comingSoon: false },
      { name: 'PPT to PDF', slug: 'ppt-to-pdf', description: "Convert PowerPoint presentations to PDF.", comingSoon: false },
      { name: 'Text to PDF', slug: 'text-to-pdf', description: "Convert plain text files to PDF.", comingSoon: false },
      { name: 'HTML to PDF', slug: 'html-to-pdf', description: "Convert web pages or HTML files to PDF.", comingSoon: false },
    ],
  },
  {
    name: 'Convert FROM PDF',
    description: 'Extract content and convert PDFs into editable formats.',
    icon: FiDownloadCloud,
    tools: [
      { name: 'PDF to Word', slug: 'pdf-to-word', description: "Convert PDFs to editable DOCX documents." },
      { name: 'PDF to Excel', slug: 'pdf-to-excel', description: "Extract tables from PDF to Excel sheets.", comingSoon: false },
      { name: 'PDF to PPT', slug: 'pdf-to-ppt', description: "Turn PDFs into PowerPoint presentations.", comingSoon: false },
      { name: 'PDF to Image', slug: 'pdf-to-image', description: "Convert PDF pages into images (PNG, JPEG).", comingSoon: false }, // Updated description slightly
      { name: 'PDF to Text', slug: 'pdf-to-text', description: "Extract text content from your PDFs.", comingSoon: false },
    ],
  },
  {
    name: 'Organize & Manage',
    description: 'Modify, arrange, and manage your PDF files with ease.',
    icon: FiShuffle,
    tools: [
      { name: 'Merge PDF', slug: 'merge-pdf', description: "Combine multiple PDF files into one document." },
      { name: 'Split PDF', slug: 'split-pdf', description: "Extract pages or divide a PDF into multiple files." },
      { name: 'Rotate PDF', slug: 'rotate-pdf', description: "Change the orientation of PDF pages." },
      { name: 'Delete Pages', slug: 'delete-pages', description: "Remove unwanted pages from your PDF.", comingSoon: false },
      { name: 'Add Page Numbers', slug: 'add-page-numbers', description: "Insert page numbers into your PDF documents.", comingSoon: false }, // Or true if not fully built yet
      { name: 'Extract Pages', slug: 'extract-pages', description: "Select and extract specific pages from a PDF.", comingSoon: false },
    ],
  },
  {
    name: 'Optimize & Secure',
    description: 'Reduce file size, add security, or repair your PDFs.',
    icon: FiShield,
    tools: [
      { name: 'Compress PDF', slug: 'compress-pdf', description: "Reduce PDF file size without losing quality." },
      { name: 'Protect PDF', slug: 'protect-pdf', description: "Add a password to secure your PDF files.", comingSoon: false },
      { name: 'Unlock PDF', slug: 'unlock-pdf', description: "Remove password protection from PDFs.", comingSoon: false },
      { name: 'Repair PDF', slug: 'repair-pdf', description: "Attempt to fix corrupted or damaged PDFs.", comingSoon: true },
    ],
  },
  {
    name: 'Edit & Sign', // Simplified name
    description: 'Advanced PDF editing and e-signing capabilities.',
    icon: FiEdit3,
    tools: [
      { name: 'Edit PDF Text', slug: 'edit-pdf-text', description: "Modify text content directly within your PDF.", comingSoon: true },
      { name: 'Add Images to PDF', slug: 'add-images-to-pdf', description: "Insert images into existing PDF documents.", comingSoon: true },
      { name: 'eSign PDF', slug: 'esign-pdf', description: "Electronically sign PDF documents securely.", comingSoon: true },
    ],
    disabled: false, // Enable if you want to show "coming soon" tools, or true to hide completely for now
    // If disabled: true, and you want a specific message different from the default empty state:
    comingSoonMessage: "Advanced editing and e-signing tools are under development. Stay tuned!"
  }
];