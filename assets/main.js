// Initialize ScrollReveal with global settings
ScrollReveal({
    reset: false,
    duration: 1200,
    easing: 'ease-in-out', // Smooth easing
    distance: '50px',      // Adds a nice slide effect
    viewOffset: { top: 20, bottom: 20 } // Trigger animations slightly earlier
});

// Hero area
ScrollReveal().reveal('.hero-img', { delay: 200, origin: 'bottom' });
ScrollReveal().reveal('.hero-title', { delay: 600, origin: 'bottom' });
ScrollReveal().reveal('.hero-desc', { delay: 900, origin: 'bottom' });
ScrollReveal().reveal('.hero-slider', { delay: 1200, origin: 'right' });
ScrollReveal().reveal('.hero-next', { delay: 1500, origin: 'top' });

// About area
ScrollReveal().reveal('.about-title', { delay: 200, origin: 'bottom' });
ScrollReveal().reveal('.about-desc', { delay: 400, origin: 'bottom' });
ScrollReveal().reveal('.about-gallery', { delay: 600, origin: 'bottom' });

// Experience area
ScrollReveal().reveal('.experience-title', { delay: 200, origin: 'left' });

const experienceItems = document.querySelectorAll('.experience-item');
experienceItems.forEach((item, index) => {
    ScrollReveal().reveal(item, { delay: 200 + index * 250, origin: 'left' });
});

// Projects area
ScrollReveal().reveal('.project-title', { delay: 200, origin: 'bottom' });

const projectItems = document.querySelectorAll('.project_card');
projectItems.forEach((item, index) => {
    ScrollReveal().reveal(item, { delay: 200 + index * 250, origin: 'bottom' });
});

ScrollReveal().reveal('.project-more', { delay: 1800, origin: 'top' });

// Contact area
ScrollReveal().reveal('.contact-title', { delay: 200, origin: 'bottom' });
ScrollReveal().reveal('.contact-desc', { delay: 400, origin: 'bottom' });

const contactIcons = document.querySelectorAll('.contact-icon');
contactIcons.forEach((icon, index) => {
    ScrollReveal().reveal(icon, { delay: 200 + index * 200, origin: 'bottom' });
});
