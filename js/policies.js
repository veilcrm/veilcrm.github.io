document.addEventListener('DOMContentLoaded', () => {
    // Handle smooth scrolling for anchor links
    document.querySelectorAll('.sidebar-nav a').forEach(anchor => {
        
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                // Update URL hash without scrolling
                history.pushState(null, null, targetId);
                // Update active state
                updateActiveLink(targetId);
            }
        });
    });

    function updateActiveLink(hash) {
        const activeHash = hash || window.location.hash || '#contact';
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === activeHash) {
                link.classList.add('active');
            }
        });
    }

    // Update active state in sidebar based on scroll position
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.policy-section');
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 100 && 
                window.scrollY < sectionTop + sectionHeight - 100) {
                currentSection = '#' + section.id;
            }
        });

        if (currentSection) {
            updateActiveLink(currentSection);
            // Update URL hash without scrolling
            history.replaceState(null, null, currentSection);
        }
    });

    // Handle initial load
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView();
                updateActiveLink(window.location.hash);
            }, 100);
        }
    } else {
        updateActiveLink('#contact');
    }
});