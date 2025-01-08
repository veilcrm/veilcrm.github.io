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

    // Initialize the post
    await loadPost();
});