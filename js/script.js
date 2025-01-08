// Initialize main document functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.warn('Lucide icons library not loaded');
    }

    // Initialize core functionalities
    initializeDropdown();
    initializeTabSwitching();
    initializePolicyLinks();
    initializeHeaderScroll();
    initializeNewsletterForm();
    initializeMobileMenu();
});

// Header scroll functionality
function initializeHeaderScroll() {
    const header = document.querySelector('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (header) {
            // Add background when scrolled
            header.style.backgroundColor = 
                currentScroll > 50 ? 'rgba(30, 41, 59, 0.95)' : 'var(--background-light)';
            
            // Add shadow when scrolled
            header.style.boxShadow =
                currentScroll > 50 ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none';
            
            // Hide header when scrolling down, show when scrolling up
            header.style.transform =
                currentScroll > lastScroll && currentScroll > 100
                    ? 'translateY(-100%)'
                    : 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

// Dropdown functionality
function initializeDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');

    if (dropdown && dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });

        // Close dropdown when pressing escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('active');
            }
        });
    }
}

// Tab switching functionality
function initializeTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            if (!tabId) return;

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const activeContent = document.getElementById(tabId);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });
}

// Policy links handling
function initializePolicyLinks() {
    const policyLinks = document.querySelectorAll('.footer-links a');
    
    policyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Split the href into page and section
            const [page, section] = href.split('#');
            
            // If we're already on the policies page and there's a section,
            // just scroll to it
            if (window.location.pathname.includes('policies.html') && section) {
                e.preventDefault();
                const element = document.querySelector(`#${section}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    // Update URL without scrolling
                    history.pushState(null, null, `#${section}`);
                }
            }
            // Otherwise, let the normal navigation happen
        });
    });

    // Handle initial policy page load
    if (window.location.pathname.includes('policies.html')) {
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }
}

// Newsletter form functionality
function initializeNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    const newsletterInput = document.querySelector('.newsletter-input');
    const newsletterButton = document.querySelector('.newsletter-button');

    if (newsletterForm && newsletterInput && newsletterButton) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterInput.value.trim();
            
            if (isValidEmail(email)) {
                // Here you would typically send this to your backend
                console.log('Newsletter signup:', email);
                newsletterInput.value = '';
                alert('Thank you for subscribing!');
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }
}

// Utility function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle page load
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// For Newsletter form submission
async function submitNewsletterForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('sib-form');
    const email = form.querySelector('#EMAIL').value;
    const errorPanel = document.getElementById('error-message');
    const successPanel = document.getElementById('success-message');
    
    // Hide any existing messages
    errorPanel.style.display = 'none';
    successPanel.style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('EMAIL', email);
        formData.append('email_address_check', '');
        formData.append('locale', 'en');

        const response = await fetch('https://24b281c9.sibforms.com/serve/MUIFANpO14jtBpSKBXQ0qHbpEIUTSSUFiizrwVTeO8flKdmLLQLIHDUDqxd0pQsoifwSJP07tON8dy856jq26PwniUPBGMURxp_6DWRRgGaDjyY8aSuvoIFFk9yJcJ4Lz8w461mdJ2Ix4s7ugJUPQxAObIufQyvVMTfELGFBThK_-zu6ZLlD4rIeoqz8qbYH9yHMiUH5NLqPdxhS', {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // This is important for cross-origin requests
        });

        // Since we're using no-cors, we can't actually check the response
        // We'll show success message and clear the form
        form.reset();
        successPanel.style.display = 'block';
        setTimeout(() => {
            successPanel.style.display = 'none';
        }, 5000);

    } catch (error) {
        console.error('Newsletter signup error:', error);
        errorPanel.style.display = 'block';
        setTimeout(() => {
            errorPanel.style.display = 'none';
        }, 5000);
    }
}
