// post.js
document.addEventListener('DOMContentLoaded', async () => {
    const postContent = document.getElementById('post-content');
    const tocNav = document.getElementById('toc-nav');
    const shareButtons = document.querySelectorAll('.share-link');
    const backToBlogButton = document.querySelector('.back-to-blog');

    // Add event listener for the back to blog button
    if (backToBlogButton) {
        backToBlogButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/blog.html';
        });
    }

    async function loadPost() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');

            if (!postId) {
                throw new Error('No post ID provided');
            }

            // Fetch the post content directly (assuming markdown files are in a /posts directory)
            const postResponse = await fetch(`${postId}`);
            if (!postResponse.ok) {
                throw new Error(`Failed to load post: ${postResponse.status}`);
            }

            const markdownContent = await postResponse.text();

            // Normalize line endings and ensure proper spacing
            const normalizedContent = markdownContent.replace(/\r\n/g, '\n').trim();
            
            // More flexible regex that handles various line endings and spacing
            const frontMatterRegex = /^---[\r\n]+([\s\S]*?)[\r\n]+---[\r\n]+([\s\S]*)$/;
            const matches = normalizedContent.match(frontMatterRegex);

            if (!matches) {
                throw new Error('Invalid post format');
            }

            const frontMatter = parseFrontMatter(matches[1]);
            const content = matches[2];
            console.log(content);

            // Update page title
            document.title = `${frontMatter.title} - Veil CRM Blog`;

            // Render the post content
            postContent.innerHTML = `
                <article class="post">
                    <div class="post-body">
                        ${marked.parse(content)}
                    </div>
                </article>
            `;
            // Initialize table of contents
            createTableOfContents();

            // Initialize sharing functionality
            initializeSharing(frontMatter.title);

            // Initialize syntax highlighting if code blocks exist
            if (typeof hljs !== 'undefined') {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }

            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

        } catch (error) {
            console.error('Error loading post:', error);
            postContent.innerHTML = `
                <div class="error-message">
                    <h1>Error Loading Post</h1>
                    <p>We're sorry, but there was an error loading the blog post. ${error.message}</p>
                    <a href="/blog.html" class="back-to-blog">← Back to Blog</a>
                </div>
            `;
        }
    }

    function parseFrontMatter(frontMatter) {
        const metadata = {};
        const lines = frontMatter.split('\n');

        lines.forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
                metadata[key.trim()] = valueParts.join(':').trim();
            }
        });

        return metadata;
    }

    function createTableOfContents() {
        const headings = postContent.querySelectorAll('h2, h3');
        const toc = document.createElement('ul');
        toc.className = 'toc-list';

        headings.forEach((heading, index) => {
            // Add ID to heading if it doesn't have one
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            link.className = `toc-link toc-${heading.tagName.toLowerCase()}`;

            listItem.appendChild(link);
            toc.appendChild(listItem);

            // Add smooth scroll behavior
            link.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, `#${heading.id}`);
            });
        });

        tocNav.appendChild(toc);
    }

    function initializeSharing(title) {
        const url = encodeURIComponent(window.location.href);
        const encodedTitle = encodeURIComponent(title);

        shareButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();

                if (button.classList.contains('copy-link')) {
                    try {
                        await navigator.clipboard.writeText(window.location.href);
                        showToast('Link copied to clipboard!');
                    } catch (err) {
                        console.error('Failed to copy link:', err);
                    }
                    return;
                }

                const shareUrls = {
                    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}`,
                    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
                };

                for (const [platform, shareUrl] of Object.entries(shareUrls)) {
                    if (button.classList.contains(platform)) {
                        window.open(shareUrl, '_blank', 'width=600,height=400');
                        break;
                    }
                }
            });
        });
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }, 100);
    }

    // Initialize the post
    await loadPost();
});