/**
 * Lauren Koenig Speaker Website MVP
 * Main JavaScript - Mobile Navigation & Form Handling
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
    }

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navbarHeight = navbar.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Form Handling
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            // Simple validation
            const required = ['firstName', 'lastName', 'email', 'eventDate', 'topic'];
            let isValid = true;
            let firstError = null;
            
            required.forEach(field => {
                const input = document.getElementById(field);
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#e94560';
                    if (!firstError) firstError = input;
                } else {
                    input.style.borderColor = '';
                }
            });
            
            if (!isValid) {
                if (firstError) {
                    firstError.focus();
                }
                // Could show error message here
                return;
            }
            
            // Show success message
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            // Simulate form submission (in production, this would send to a server)
            setTimeout(() => {
                submitBtn.textContent = 'Request Sent!';
                submitBtn.style.background = '#10b981';
                
                // Create success message
                const successMsg = document.createElement('div');
                successMsg.className = 'form-success';
                successMsg.innerHTML = `
                    <div style="background: #10b981; color: white; padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: center;">
                        <strong>Thank you for your interest!</strong><br>
                        Lauren's team will contact you within 24 hours to discuss your event.
                    </div>
                `;
                
                bookingForm.appendChild(successMsg);
                
                // Reset form
                bookingForm.reset();
                
                // Reset button after delay
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    if (successMsg.parentNode) {
                        successMsg.remove();
                    }
                }, 5000);
                
                // Log for tracking (in production, this would be analytics)
                console.log('Booking inquiry submitted:', {
                    timestamp: new Date().toISOString(),
                    topic: data.topic,
                    eventDate: data.eventDate,
                    organization: data.organization || 'Not provided'
                });
            }, 1500);
        });
        
        // Clear error states on input
        bookingForm.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', function() {
                this.style.borderColor = '';
            });
        });
    }

    // Initialize Intersection Observer for scroll animations
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe topic cards and award cards for animation
        document.querySelectorAll('.topic-card, .award-card, .highlight').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Add animation class
        document.head.insertAdjacentHTML('beforeend', `
            <style>
                .fade-in {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
            </style>
        `);
    }

    // Lazy load images (when images are added)
    if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }

    // Add current date to footer copyright (if needed)
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.innerHTML = yearElement.innerHTML.replace('2026', currentYear);
    }

    console.log('%c Lauren Koenig Speaker Website ', 'background: #e94560; color: white; padding: 4px 8px; border-radius: 4px;');
    console.log('%c Ready for your next event! ', 'background: #1a1a2e; color: white; padding: 4px 8px; border-radius: 4px;');
});

// Handle window resize (close mobile menu on desktop)
window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    }
});

// Keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    }
});