// blog.js
document.addEventListener('DOMContentLoaded', async () => {
    const blogPostsContainer = document.getElementById('blog-posts');
    const recentPostsList = document.querySelector('.blog-sidebar ul');

    async function loadBlogPosts() {
        try {
            const response = await fetch('/blog-posts.json');
            if (!response.ok) {
                throw new Error(`Failed to load blog posts: ${response.status}`);
            }
            const blogPosts = await response.json();

            // Sort posts by date
            blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Update recent posts sidebar
            recentPostsList.innerHTML = blogPosts
                .slice(0, 5)
                .map(post => `
                    <li>
                        <a href="/post.html?id=${encodeURIComponent(post.url)}">
                            ${post.title}
                        </a>
                    </li>`)
                .join('');
            
            // Create blog post preview elements
            for (const post of blogPosts) {
                const postElement = document.createElement('article');
                postElement.classList.add('blog-post');
                postElement.innerHTML = `
                <div class="post-preview">
                    <h2>${post.title}</h2>
                    <div class="post-meta">
                        <time datetime="${post.date}">
                            ${new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </div>
                    <div class="blog-content">
                        <p>${post.excerpt}</p>
                    </div>
                    <a href="/post.html?id=${encodeURIComponent(post.url)}" 
                       class="read-more-link">
                        Read More →
                    </a>
                </div>
            `;
                
                blogPostsContainer.appendChild(postElement);
            }
        } catch (error) {
            console.error('Error loading blog posts:', error);
            blogPostsContainer.innerHTML = `
                <div class="error-message">
                    <h2>Unable to load blog posts</h2>
                    <p>We're sorry, but there was an error loading the blog posts. Please try again later.</p>
                </div>
            `;
        }
    }

    await loadBlogPosts();
});