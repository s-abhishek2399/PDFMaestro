// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineTool } from 'react-icons/ai';
import { FaGithub } from 'react-icons/fa'; // Only GitHub
import { toolCategoriesData } from '../data/toolsData'; // Import tool data

const FooterLink = ({ to, children, isDarkMode, isExternal = false }) => {
  const classes = `text-sm transition-colors duration-200 ease-in-out
                 ${isDarkMode 
                   ? 'text-slate-400 hover:text-sky-300 hover:underline underline-offset-2' 
                   : 'text-slate-500 hover:text-sky-600 hover:underline underline-offset-2'}`;
  if (isExternal) {
    return (
      <a href={to} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
};

const SocialLink = ({ href, icon: Icon, name, isDarkMode }) => (
  <a 
    href={href} 
    className={`transition-colors duration-200 ease-in-out
               ${isDarkMode ? 'text-slate-400 hover:text-sky-400' : 'text-slate-500 hover:text-sky-600'}`}
    target="_blank" 
    rel="noopener noreferrer"
    aria-label={name}
  >
    <span className="sr-only">{name}</span>
    <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
  </a>
);

const Footer = ({ isDarkMode }) => {
  const currentYear = new Date().getFullYear();

  // Dynamically generate "All Tools" links from toolCategoriesData
  const allAvailableToolsFlat = toolCategoriesData.reduce((acc, category) => {
    if (!category.disabled && category.tools) {
      const categoryTools = category.tools.filter(tool => !tool.comingSoon && !tool.aliasFor);
      categoryTools.forEach(tool => acc.push({ name: tool.name, to: `/${tool.slug}` }));
    }
    return acc;
  }, []);
  // Sort them alphabetically for consistency
  allAvailableToolsFlat.sort((a, b) => a.name.localeCompare(b.name));


  const linkSections = [
    {
      title: 'Quick Tools', // Renamed for clarity
      // Display a subset of popular tools, or a "More Tools..." link
      // For a full list, it might get too long. Let's show first 5-6 popular/varied ones + All Tools.
      // Or, we can create sub-columns for tools if we want many.
      // For this example, let's limit to a few plus "All Tools".
      links: [
        { name: 'Merge PDF', to: '/merge-pdf' },
        { name: 'PDF to Word', to: '/pdf-to-word' },
        { name: 'Compress PDF', to: '/compress-pdf' },
        { name: 'Images to PDF', to: '/images-to-pdf' },
        { name: 'Protect PDF', to: '/protect-pdf' },
        { name: 'All PDF Tools', to: '/all-tools', isEmphasized: true }, // Flag for different styling
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', to: '/about-us' },
        // { name: 'Blog', to: '/blog', disabled: true },
      ],
    },
    {
      title: 'Support', // Changed "Resources" back to "Support" for clarity
      links: [
        { name: 'FAQ / Help', to: '/help' }, // Changed from /faq
        // { name: 'Privacy Policy', to: '/privacy' },
        // { name: 'Terms of Service', to: '/terms' },
      ],
    },

    {
      title: 'Purpose', // Changed "Resources" back to "Support" for clarity
      links: [
        { name: 'Solutions', to: '/solutions' }, // Changed from /faq
        // { name: 'Privacy Policy', to: '/privacy' },
        // { name: 'Terms of Service', to: '/terms' },
      ],
    },
  ];
  
  const socialLinks = [
    { name: 'GitHub', icon: FaGithub, href: 'https://github.com/yourusername/pdfmaestro' }, // Replace with your actual GitHub
  ];

  return (
    <footer className={`${isDarkMode ? 'bg-slate-900 border-t border-slate-700/50' : 'bg-slate-50 border-t border-slate-200'}`}>
      <div className="max-w-7xl mx-auto pt-16 pb-10 px-4 sm:px-6 lg:px-8"> {/* Adjusted padding */}
        <div className="xl:grid xl:grid-cols-12 xl:gap-8"> {/* Using 12-col grid for more flexibility */}
          
          {/* Logo & Description - Spans more columns on larger screens */}
          <div className="space-y-6 xl:col-span-4 mb-10 xl:mb-0">
             <Link to="/" className="inline-flex items-center space-x-2.5">
                <AiOutlineTool className={`w-8 h-8 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                <span className="text-3xl font-bold">
                  <span className={`${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>PDF</span>
                  <span className={`${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Maestro</span>
                </span>
            </Link>
            <p className={`text-sm leading-relaxed max-w-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Your complete, free, and easy-to-use online PDF toolkit. Convert, edit, manage, and secure your documents effortlessly.
            </p>
            <div className="flex space-x-5">
              {socialLinks.map((item) => (
                 <SocialLink 
                    key={item.name} 
                    href={item.href} 
                    icon={item.icon}
                    name={item.name}
                    isDarkMode={isDarkMode}
                  />
              ))}
            </div>
          </div>

          {/* Link Sections - Spans remaining columns and uses its own multi-column layout */}
          <div className="xl:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10"> {/* More columns for links */}
            {linkSections.map((section) => (
              section.links.length > 0 && (
                <div key={section.title}>
                  <h3 className={`text-xs font-semibold tracking-wider uppercase mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{section.title}</h3>
                  <ul role="list" className="space-y-2.5 sm:space-y-3"> {/* Tighter spacing */}
                    {section.links.map((item) => (
                      <li key={item.name}>
                        {!item.disabled ? (
                           <FooterLink 
                              to={item.to} 
                              isDarkMode={isDarkMode}
                              isExternal={item.isExternal}
                            >
                              {item.name}
                              {item.isEmphasized && (
                                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-100 text-sky-600'}`}>
                                  All
                                </span>
                              )}
                            </FooterLink>
                        ) : (
                           <span className={`text-sm cursor-not-allowed ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{item.name} <span className="text-xs">(soon)</span></span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
             {/* Dynamically generated All Tools (if many, consider a "More Tools" link instead) */}
             {/* This might make the footer very long. Let's keep the curated list above for now */}
             {/* Or, make a dedicated "All Tools" column */}
             {/* 
             <div>
                <h3 className={`text-xs font-semibold tracking-wider uppercase mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>All Tools</h3>
                <ul role="list" className="space-y-2.5 sm:space-y-3" style={{ columnCount: 2, columnGap: '1rem' }}> 
                  {allAvailableToolsFlat.map((item) => (
                    <li key={item.name} className="break-inside-avoid">
                      <FooterLink to={item.to} isDarkMode={isDarkMode}>{item.name}</FooterLink>
                    </li>
                  ))}
                </ul>
             </div>
             */}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`mt-12 border-t pt-8 text-sm text-center ${isDarkMode ? 'border-slate-700/60 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <p>
            © {currentYear} PDFMaestro. All rights reserved.
          </p>
          {/* <p className="mt-1">
            A project built with passion. 
          </p> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;