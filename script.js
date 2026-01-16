/**
 * Iteratim Studios - Main JavaScript
 * Handles navigation, scroll effects, form handling, and dynamic content
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initContactForm();
    renderProjects();
    renderServices();
});

// ========================================
// Navigation
// ========================================

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect for navbar
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}

// ========================================
// Scroll Effects
// ========================================

function initScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.project-card, .service-card, .section-header, .about-content, .contact-info').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = `
        .visible { opacity: 1 !important; transform: translateY(0) !important; }
        .project-card:nth-child(1) { transition-delay: 0s !important; }
        .project-card:nth-child(2) { transition-delay: 0.1s !important; }
        .project-card:nth-child(3) { transition-delay: 0.2s !important; }
        .project-card:nth-child(4) { transition-delay: 0.3s !important; }
        .project-card:nth-child(5) { transition-delay: 0.4s !important; }
        .project-card:nth-child(6) { transition-delay: 0.5s !important; }
        .service-card:nth-child(1) { transition-delay: 0s !important; }
        .service-card:nth-child(2) { transition-delay: 0.1s !important; }
        .service-card:nth-child(3) { transition-delay: 0.2s !important; }
        .service-card:nth-child(4) { transition-delay: 0.3s !important; }
    `;
    document.head.appendChild(style);
}

// ========================================
// Contact Form
// ========================================

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Formspree endpoint for contact@iteratim.io
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xnnebzpo';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const button = form.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;

        // Show loading state
        button.innerHTML = '<span>Sending...</span>';
        button.disabled = true;

        try {
            // Get form data
            const formData = new FormData(form);

            // Submit to Formspree
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success
                button.innerHTML = '<span>Message Sent! ✓</span>';
                button.style.background = '#10b981';
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            // Show error
            button.innerHTML = '<span>Error - Try Again</span>';
            button.style.background = '#ef4444';
            console.error('Form submission error:', error);
        }

        // Reset button after delay
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 3000);
    });
}

// ========================================
// Projects Data & Rendering
// ========================================

const projects = [
    {
        category: 'Coming Soon',
        title: 'TrainAdapt',
        description: 'Your personal AI fitness architect. Intelligent workout programs that evolve with you — adapting to your progress, goals, and lifestyle.',
        colors: ['#0a1f1a', '#0d2f28', '#00d4aa'],
        image: 'assets/images/trainadapt-icon.png'
    },
    {
        category: 'Coming Soon',
        title: 'Project Beta',
        description: 'Intelligent automation meets beautiful design. Leveraging AI to create seamless user experiences.',
        colors: ['#0d1b2a', '#1b263b', '#415a77'],
        image: 'assets/images/project-beta-preview.png'
    },
    {
        category: 'Coming Soon',
        title: 'Project Gamma',
        description: 'A fresh take on AI-assisted productivity. Smart features that adapt to how you work.',
        colors: ['#1a1423', '#2d2136', '#44384f'],
        image: 'assets/images/project-gamma-preview.png'
    }
];

function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = projects.map((project, index) => {
        const hasImage = !!project.image;
        return `
            <article class="project-card coming-soon" data-category="coming-soon">
                <div class="project-image ${hasImage ? 'has-full-image' : ''}">
                    ${hasImage ?
                `<img src="${project.image}" alt="${project.title}" class="project-full-image">` :
                `<div class="project-mockup">${renderComingSoonMockup(project, index)}</div>`
            }
                    <div class="project-overlay">
                        <span class="project-view">Coming Soon</span>
                    </div>
                </div>
                <div class="project-info">
                    <span class="project-category">${project.category}</span>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-desc">${project.description}</p>
                </div>
            </article>
        `;
    }).join('');
}

function renderComingSoonMockup(project, index) {
    // Unique icons for each project
    const icons = [
        // TrainArc - Fitness/Dumbbell icon
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6.5 6.5h-2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2"/>
            <path d="M17.5 6.5h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2"/>
            <rect x="6.5" y="4" width="3" height="16" rx="1"/>
            <rect x="14.5" y="4" width="3" height="16" rx="1"/>
            <path d="M9.5 12h5"/>
        </svg>`,
        // Project Beta - AI/Brain icon
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="3"/>
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="19" r="2"/>
            <circle cx="5" cy="12" r="2"/>
            <circle cx="19" cy="12" r="2"/>
            <path d="M12 7v2M12 15v2M7 12h2M15 12h2"/>
        </svg>`,
        // Project Gamma - Productivity/Tasks icon
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="16" rx="2"/>
            <path d="M7 8h4M7 12h10M7 16h6"/>
            <circle cx="16" cy="8" r="1" fill="currentColor"/>
        </svg>`
    ];

    const iconHtml = project.image ?
        `<img src="${project.image}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: contain;">` :
        (icons[index] || icons[0]);

    return `
        <div class="mockup-phone">
            <div class="mockup-screen" style="background: linear-gradient(180deg, ${project.colors[0]}, ${project.colors[1]});">
                <div class="coming-soon-ui">
                    <div class="coming-soon-icon">
                        ${iconHtml}
                    </div>
                    <div class="coming-soon-bars">
                        <div class="bar" style="background: ${project.colors[2]}; width: 80%;"></div>
                        <div class="bar" style="background: ${project.colors[2]}; width: 60%;"></div>
                        <div class="bar" style="background: ${project.colors[2]}; width: 70%;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderPhoneMockup(project, index) {
    const patterns = [
        `<div class="app-ui">
            <div class="app-header" style="background: linear-gradient(135deg, ${project.colors[1]}, ${project.colors[2]});"></div>
            <div class="app-cards">
                <div class="app-card" style="background: ${project.colors[1]};"></div>
                <div class="app-card small" style="background: ${project.colors[2]};"></div>
            </div>
        </div>`,
        `<div class="app-ui">
            <div class="app-ring" style="border-color: ${project.colors[2]};"></div>
            <div class="app-stats">
                <div class="stat" style="background: ${project.colors[1]};"></div>
                <div class="stat" style="background: ${project.colors[2]};"></div>
                <div class="stat" style="background: ${project.colors[1]};"></div>
            </div>
        </div>`,
        `<div class="app-ui">
            <div class="app-list">
                <div class="list-item" style="background: ${project.colors[1]};"></div>
                <div class="list-item" style="background: ${project.colors[2]};"></div>
                <div class="list-item" style="background: ${project.colors[1]};"></div>
            </div>
        </div>`
    ];

    return `
        <div class="mockup-phone">
            <div class="mockup-screen" style="background: linear-gradient(180deg, ${project.colors[0]}, ${project.colors[1]});">
                ${patterns[index % patterns.length]}
            </div>
        </div>
    `;
}

function renderBrowserMockup(project, index) {
    return `
        <div class="mockup-browser">
            <div class="browser-bar">
                <div class="browser-dot" style="background: #ff5f56;"></div>
                <div class="browser-dot" style="background: #ffbd2e;"></div>
                <div class="browser-dot" style="background: #27ca40;"></div>
            </div>
            <div class="browser-content" style="background: linear-gradient(180deg, ${project.colors[0]}, ${project.colors[1]});">
                <div class="web-preview">
                    <div class="web-nav" style="background: ${project.colors[1]};"></div>
                    <div class="web-hero" style="background: linear-gradient(135deg, ${project.colors[1]}, ${project.colors[2]});"></div>
                    <div class="web-cards">
                        <div class="web-card" style="background: ${project.colors[2]};"></div>
                        <div class="web-card" style="background: ${project.colors[2]};"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// Services Data & Rendering
// ========================================

const services = [
    {
        title: 'iOS Apps',
        description: 'Native iOS applications built with Swift, SwiftUI, and on-device AI capabilities',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="5" y="2" width="14" height="20" rx="3"/>
            <line x1="12" y1="18" x2="12" y2="18" stroke-linecap="round" stroke-width="2"/>
        </svg>`
    },
    {
        title: 'Android Apps',
        description: 'Native Android applications with Kotlin, Jetpack Compose, and ML Kit integration',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="5" y="2" width="14" height="20" rx="2"/>
            <line x1="9" y1="18" x2="15" y2="18" stroke-linecap="round"/>
        </svg>`
    },
    {
        title: 'AI Integration',
        description: 'Machine learning, LLMs, computer vision, and intelligent features built into your app',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="3"/>
            <circle cx="12" cy="4" r="2"/>
            <circle cx="12" cy="20" r="2"/>
            <circle cx="4" cy="12" r="2"/>
            <circle cx="20" cy="12" r="2"/>
            <path d="M12 6v3M12 15v3M6 12h3M15 12h3"/>
        </svg>`
    },
    {
        title: 'App Store Ready',
        description: 'From development to deployment — optimized for App Store and Play Store success',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9 12l2 2 4-4"/>
        </svg>`
    }
];

function renderServices() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    grid.innerHTML = services.map(service => `
        <div class="service-card">
            <div class="service-icon">${service.icon}</div>
            <h4>${service.title}</h4>
            <p>${service.description}</p>
        </div>
    `).join('');
}
