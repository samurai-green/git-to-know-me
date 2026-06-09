import React from 'react';

// Dynamically import all possible images
const blogImages = import.meta.glob('../resources/blogs/assets/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });
const heroImages = import.meta.glob('./assets/blogs/heroImages/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });

const allImages = { ...blogImages, ...heroImages };

// Create a mapping
const imageMap = {};
for (const [path, url] of Object.entries(allImages)) {
    // Correctly map globed paths (relative) back to the paths used as strings
    // `../resources/...` -> `src/resources/...`
    // `./assets/...` -> `src/components/assets/...`
    let key = path.replace(/^\.\.\/resources\//, 'src/resources/');
    key = key.replace(/^\.\/assets\//, 'src/components/assets/');
    imageMap[key] = url;
}

export default function MarkdownRenderer({ content, customWidgets }) {
  // Split lines to parse
  const lines = content.split('\n');
  const renderedElements = [];
  
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = 'rs';
  
  let inList = false;
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-none space-y-4 pl-0 my-6">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-4">
              <div className="w-4 h-4 bg-black mt-1.5 flex-shrink-0" />
              <span className="font-sans text-base text-zinc-900 leading-relaxed font-normal"
                    dangerouslySetInnerHTML={{ __html: parseInlineStyles(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushCodeBlock = (key) => {
    if (codeLines.length > 0) {
      const codeText = codeLines.join('\n');
      renderedElements.push(
        <div key={`code-${key}`} className="border-4 border-black bg-zinc-950 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-8 flex flex-col">
          <div className="border-b-2 border-black px-4 py-2 flex items-center gap-2 bg-zinc-900 select-none">
            <div className="w-3 h-3 rounded-full bg-red-400 border border-black"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400 border border-black"></div>
            <span className="ml-4 font-mono text-[10px] text-zinc-400 uppercase tracking-widest">{codeLang} shell monitor</span>
          </div>
          <pre className="p-6 overflow-x-auto font-mono text-xs md:text-sm leading-relaxed text-zinc-200 select-text">
            <code>{codeText}</code>
          </pre>
        </div>
      );
      codeLines = [];
      inCodeBlock = false;
    }
  };

  const parseInlineStyles = (text) => {
    // Escape standard code and format stars
    let parsed = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    // **bold** -> <strong class="font-black text-black">$1</strong>
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-black">$1</strong>');
    
    // `code` -> <code class="bg-[#e3e0ff] px-1.5 py-0.5 font-mono text-xs border border-black rounded-sm">code</code>
    parsed = parsed.replace(/`(.*?)`/g, '<code class="bg-neutral-100 text-[#ca0055] px-1.5 py-0.5 font-mono text-xs border border-neutral-300 font-bold">$1</code>');
    
    // Inline image match: ![alt](url) -> formatted image tag
    parsed = parsed.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
        const finalUrl = imageMap[url] || url;
        return `<img src="${finalUrl}" alt="${alt}" class="inline-block border-2 border-black max-w-full h-auto mx-auto my-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white p-1" referrerpolicy="no-referrer" />`;
    });
    
    return parsed;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Code block detection
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(index);
      } else {
        flushList(index);
        inCodeBlock = true;
        codeLang = trimmed.substring(3).trim() || 'rs';
      }
      return;
    }
    
    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }
    
    // Unordered lists detection
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        inList = true;
      }
      listItems.push(trimmed.substring(2));
      return;
    } else if (trimmed === '' && inList) {
      // blank line flushes any list
      flushList(index);
    }
    
    // Headings detection
    if (trimmed.startsWith('# ')) {
      flushList(index);
      renderedElements.push(
        <h1 key={index} className="font-heading text-4xl md:text-5xl font-black uppercase text-black mb-6 tracking-tight">
          {trimmed.substring(2)}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList(index);
      renderedElements.push(
        <h2 key={index} className="font-heading text-2xl md:text-3xl font-black uppercase border-b-4 border-black pb-2 mt-12 mb-6 inline-block bg-[#ffb2bf] px-4 -rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList(index);
      renderedElements.push(
        <h3 key={index} className="font-heading text-xl md:text-2xl font-bold uppercase border-b-2 border-black pb-1 mt-8 mb-4 text-black">
          {trimmed.substring(4)}
        </h3>
      );
    } else if (trimmed.startsWith('![') && trimmed.endsWith(')')) {
      flushList(index);
      const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (match) {
        const [, alt, url] = match;
        const finalUrl = imageMap[url] || url;
        renderedElements.push(
          <div key={`img-block-${index}`} className="my-8 flex justify-center">
            <figure className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3 inline-block max-w-full text-center animate-fade-in">
              <img 
                src={finalUrl} 
                alt={alt} 
                className="border-2 border-black max-w-full h-auto select-none" 
                referrerPolicy="no-referrer" 
              />
              {alt && (
                <figcaption className="mt-2 font-mono text-xs text-neutral-600 text-center uppercase tracking-wide border-t-2 border-dashed border-black pt-2 select-text">
                  📷 {alt}
                </figcaption>
              )}
            </figure>
          </div>
        );
      } else {
        renderedElements.push(
          <p key={index} className="font-sans text-base md:text-lg text-neutral-800 leading-relaxed font-normal mb-6"
             dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }} />
        );
      }
    } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      flushList(index);
      const widgetId = trimmed.substring(1, trimmed.length - 1);
      if (customWidgets && customWidgets[widgetId]) {
        renderedElements.push(
          <div key={`widget-${index}`} className="my-10 select-none">
            {customWidgets[widgetId]}
          </div>
        );
      } else {
        renderedElements.push(
          <div key={`widget-placeholder-${index}`} className="my-4 p-4 border-4 border-black bg-red-100 font-mono text-xs text-black border-dashed">
            [Interactive Area: {widgetId} initialized]
          </div>
        );
      }
    } else if (trimmed !== '') {
      flushList(index);
      // Paragraph lines
      renderedElements.push(
        <p key={index} className="font-sans text-base md:text-lg text-neutral-800 leading-relaxed font-normal mb-6"
           dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }} />
      );
    }
  });

  // Final flushes
  flushList(9999);
  flushCodeBlock(10000);

  return (
    <div className="prose prose-lg max-w-none text-black select-text">
      {renderedElements}
    </div>
  );
}
