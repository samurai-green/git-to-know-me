export function loadBlogPosts() {
  // Use Vite's bulk static queries to fetch all md files dynamically
  const glob = import.meta.glob('/src/resources/blogs/*.md', { query: '?raw', eager: true });
  
  const posts = [];
  
  for (const path in glob) {
    const rawContent = glob[path].default;
    const filename = path.split('/').pop() || '';
    const id = filename.replace('.md', '');
    
    // Parse simple Frontmatter blocks
    let title = 'Untitled Post';
    let date = 'Unknown Date';
    let readTime = '1 Min Read';
    let tags = [];
    let summary = '';
    let content = rawContent;
    
    if (rawContent.startsWith('---')) {
      const parts = rawContent.split('---');
      if (parts.length >= 3) {
        const header = parts[1];
        content = parts.slice(2).join('---').trim();
        
        const lines = header.split('\n');
        lines.forEach(line => {
          const colonIdx = line.indexOf(':');
          if (colonIdx !== -1) {
            const key = line.substring(0, colonIdx).trim().toLowerCase();
            const value = line.substring(colonIdx + 1).trim();
            const cleanVal = value.replace(/^['"]|['"]$/g, ''); // strip outer quotes
            
            if (key === 'title') title = cleanVal;
            else if (key === 'date') date = cleanVal;
            else if (key === 'readtime') readTime = cleanVal;
            else if (key === 'summary') summary = cleanVal;
            else if (key === 'tags') {
              tags = cleanVal.split(',').map(t => t.trim().toUpperCase());
            }
          }
        });
      }
    }
    
    posts.push({
      id,
      title,
      date,
      readTime,
      tags,
      summary,
      content
    });
  }
  
  const order = ['hackerone-reflected-xss', 'like-button-distributed-systems', 'rethinking-frontend-complexity', 'chroot-containerization', 'art-of-exploitation'];
  return posts.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}
