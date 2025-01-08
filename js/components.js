// js/components.js
document.addEventListener('DOMContentLoaded', async () => {
    const components = [
        { id: 'header', path: 'components/header.html' },
        { id: 'hero', path: 'components/hero.html' },
        { id: 'features', path: 'components/features.html' },
        { id: 'integrations', path: 'components/integrations.html' },
        { id: 'pricing', path: 'components/pricing.html' },
        { id: 'cta', path: 'components/cta.html' },
        { id: 'footer', path: 'components/footer.html' }
    ];

    async function loadComponent(id, path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const content = await response.text();
            document.getElementById(id).innerHTML = content;
        } catch (error) {
            console.error(`Error loading component ${id}:`, error);
        }
    }

    // Load all components
    await Promise.all(components.map(comp => loadComponent(comp.id, comp.path)));

    // Reinitialize Lucide icons after loading components
    lucide.createIcons();

    // Initialize event listeners
    initializeEventListeners();

    // Handle footer policy links if we're on the main page
    if (!window.location.pathname.includes('policies.html')) {
        const policyLinks = document.querySelectorAll('.footer-links a');
        
        policyLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                // Normal navigation will work fine here
                // The policies.html page has its own JavaScript for handling the sections
            });
        });
    }
});

function initializeEventListeners() {
    // Dropdown functionality
    const dropdown = document.querySelector('.dropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');

    if (dropdownToggle) {
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
    }

    // Tab Switching Functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

// Helper function for switching tabs
function switchTab(tabId) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((btn) => btn.classList.remove('active'));
    tabContents.forEach((content) => content.classList.remove('active'));

    const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(tabId);

    if (activeButton && activeContent) {
        activeButton.classList.add('active');
        activeContent.classList.add('active');
    }
}