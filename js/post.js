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

            // Load the HTML file directly
            const postResponse = await fetch(postId);
            if (!postResponse.ok) {
                throw new Error(`Failed to load post: ${postResponse.status}`);
            }

            const htmlContent = await postResponse.text();
            
            // Create a temporary container to parse the HTML
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = htmlContent;
            
            // Extract the main content (everything inside post-container)
            const postContainer = tempContainer.querySelector('.post-container');
            
            if (!postContainer) {
                throw new Error('Invalid post format');
            }

            // Update the document title
            const postTitle = tempContainer.querySelector('.post-header h1')?.textContent || 'Blog Post';
            document.title = `${postTitle} - Veil CRM Blog`;

            // Replace the current post-container with the loaded one
            const currentPostContainer = document.querySelector('.post-container');
            currentPostContainer.replaceWith(postContainer);

            // Initialize the table of contents
            createTableOfContents();

            // Initialize sharing functionality
            initializeSharing();

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