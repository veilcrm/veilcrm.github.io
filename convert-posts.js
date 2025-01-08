const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const marked = require('marked');

function generateTableOfContents(htmlContent) {
    // Create regex patterns for finding headings
    const h2Pattern = /<h2.*?id="(.*?)".*?>(.*?)<\/h2>/g;
    const h3Pattern = /<h3.*?id="(.*?)".*?>(.*?)<\/h3>/g;
    
    let headings = [];
    let match;
    
    // Find all h2 headings
    while ((match = h2Pattern.exec(htmlContent)) !== null) {
        headings.push({
            id: match[1],
            text: match[2],
            level: 'h2'
        });
    }
    
    // Find all h3 headings
    while ((match = h3Pattern.exec(htmlContent)) !== null) {
        headings.push({
            id: match[1],
            text: match[2],
            level: 'h3'
        });
    }
    
    if (headings.length === 0) return { tocHtml: '', updatedContent: htmlContent };

    // Generate TOC HTML
    let tocHtml = '<ul class="toc-list">\n';
    
    headings.forEach((heading) => {
        const className = `toc-link toc-${heading.level}`;
        const indentation = heading.level === 'h3' ? '    ' : '';
        tocHtml += `${indentation}<li><a href="#${heading.id}" class="${className}">${heading.text}</a></li>\n`;
    });
    
    tocHtml += '</ul>';

    return { tocHtml, updatedContent: htmlContent };
}

function addIdsToHeadings(htmlContent) {
    let headingCount = 0;
    
    // Add IDs to h2 and h3 tags that don't have them
    return htmlContent.replace(/<(h[23])(.*?)>(.*?)<\/h[23]>/g, (match, tag, attributes, content) => {
        if (!attributes.includes('id=')) {
            return `<${tag} id="heading-${headingCount++}"${attributes}>${content}</${tag}>`;
        }
        return match;
    });
}

function cleanFrontMatter(content) {
    // Remove any BOM characters
    content = content.replace(/^\uFEFF/, '');

    // First, let's extract what's between the --- markers
    const matches = content.match(/---\s*([\s\S]*?)\s*---/);
    if (!matches) return content;

    let frontMatter = matches[1];

    // Split on identifiable field names and clean up
    const fields = frontMatter.split(/(title:|date:|author:|excerpt:)/g)
        .filter(Boolean)
        .map(s => s.trim());

    // Rebuild front matter with proper formatting
    let cleanedFrontMatter = '---\n';
    for (let i = 0; i < fields.length; i += 2) {
        if (i + 1 < fields.length) {
            const key = fields[i].replace(':', '');
            let value = fields[i + 1];

            // Add quotes if value contains special characters
            if (value.includes(':') || value.includes('"') || value.includes("'") ||
                value.includes('[') || value.includes(']') || value.includes('{') ||
                value.includes('}')) {
                value = `"${value.replace(/"/g, '\\"')}"`;
            }

            cleanedFrontMatter += `${key}: ${value}\n`;
        }
    }
    cleanedFrontMatter += '---\n\n';

    // Replace original front matter with cleaned version
    return content.replace(/---[\s\S]*?---/, cleanedFrontMatter.trim());
}

async function convertMarkdownToHtml() {
    const POSTS_DIR = './blog/posts';
    const OUTPUT_DIR = './blog/html';

    try {
        // Create output directory if it doesn't exist
        await fs.mkdir(OUTPUT_DIR, { recursive: true });

        // Read all markdown files
        const files = await fs.readdir(POSTS_DIR);
        const mdFiles = files.filter(file => file.endsWith('.md'));
        const validPosts = [];

        for (const file of mdFiles) {
            const filePath = path.join(POSTS_DIR, file);
            console.log(`Processing ${file}...`);

            try {
                // Read markdown file
                let markdown = await fs.readFile(filePath, 'utf-8');

                // Clean up front matter
                markdown = cleanFrontMatter(markdown);

                // Write back the cleaned markdown
                await fs.writeFile(filePath, markdown, 'utf-8');

                // Parse front matter and content
                const { data: frontMatter, content } = matter(markdown);

                // Validate required fields
                const requiredFields = ['title', 'date', 'excerpt'];
                const missingFields = requiredFields.filter(field => !frontMatter[field]);

                if (missingFields.length > 0) {
                    console.error(`Missing required fields in ${file}: ${missingFields.join(', ')}`);
                    continue;
                }

                // Convert markdown to HTML
                let htmlContent = marked.parse(content);
                
                // Add IDs to headings and generate TOC
                htmlContent = addIdsToHeadings(htmlContent);
                const { tocHtml, updatedContent } = generateTableOfContents(htmlContent);

                // Create HTML file
                const htmlFileName = file.replace('.md', '.html');

                const htmlFile = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${frontMatter.title} - Veil CRM Blog</title>
    
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/navigation.css">
    <link rel="stylesheet" href="/css/footer.css">
    <link rel="stylesheet" href="/css/blog.css">
    <link rel="stylesheet" href="/css/post.css">
    
    <script src="https://cdn.jsdelivr.net/npm/lucide@0.469.0/dist/umd/lucide.min.js"></script>
</head>
<body>
    <div id="header"></div>
    
    <div class="post-container">
        <aside class="table-of-contents">
            <h2>TABLE OF CONTENTS</h2>
            <nav id="toc-nav">${tocHtml}</nav>
        </aside>

        <article class="post">
            <div class="post-body">
                ${updatedContent}
            </div>
        </article>

        <div class="share-buttons">
            <a href="#" class="share-link copy-link" aria-label="Copy link">
                <i data-lucide="link"></i>
            </a>
            <a href="#" class="share-link twitter" aria-label="Share on Twitter">
                <i data-lucide="twitter"></i>
            </a>
            <a href="#" class="share-link facebook" aria-label="Share on Facebook">
                <i data-lucide="facebook"></i>
            </a>
            <a href="#" class="share-link linkedin" aria-label="Share on LinkedIn">
                <i data-lucide="linkedin"></i>
            </a>
            <a href="/blog.html" class="share-link back-to-blog" aria-label="Back to Blog">
                <i data-lucide="arrow-left"></i>
            </a>
        </div>
    </div>
    
    <div id="footer"></div>
    
    <script src="/js/script.js"></script>
    <script src="/js/components.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
        });
    </script>
</body>
</html>`;

                await fs.writeFile(path.join(OUTPUT_DIR, htmlFileName), htmlFile);
                console.log(`Converted ${file} to HTML`);

                validPosts.push({
                    title: frontMatter.title,
                    excerpt: frontMatter.excerpt,
                    url: `/blog/html/${htmlFileName}`,
                    date: frontMatter.date,
                    author: frontMatter.author || 'Veil CRM Team'
                });

            } catch (error) {
                console.error(`Error processing ${file}:`, error);
            }
        }

        // Update blog-posts.json
        if (validPosts.length > 0) {
            await fs.writeFile(
                'blog-posts.json',
                JSON.stringify(validPosts, null, 2)
            );
            console.log('Successfully updated blog-posts.json');
        }

    } catch (error) {
        console.error('Error converting markdown to HTML:', error);
    }
}

convertMarkdownToHtml();