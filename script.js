// Video Carousel Class
class VideoCarousel {
    constructor() {
        this.videos = document.querySelectorAll('.background-video');
        this.indicators = document.querySelectorAll('.indicator');
        this.captionElements = document.querySelectorAll('.video-caption');
        this.descriptionElements = document.querySelectorAll('.video-description');
        this.captionContainer = document.querySelector('.caption-container');
        this.progressFill = document.querySelector('.progress-fill');
        this.currentVideoSpan = document.querySelector('.current-video');
        this.totalVideosSpan = document.querySelector('.total-videos');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.playOverlay = document.getElementById('videoPlayOverlay');
        this.playBtn = document.getElementById('videoPlayBtn');
        
        this.currentIndex = 0;
        this.totalVideos = this.videos.length;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 6000; // 6 seconds per video
        this.isTransitioning = false;
        this.hasUserInteracted = false;
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        // Fallback captions in case data attributes fail
        this.captions = [
            {
                title: "AGO & Lubricants Supply",
                description: "Reliable procurement and supply of AGO and industrial lubricants"
            },
            {
                title: "Electrical & Solar Accessories", 
                description: "Complete sourcing of electrical equipment and solar lighting solutions"
            },
            {
                title: "Facility Maintenance",
                description: "Comprehensive maintenance services for your business premises"
            },
            {
                title: "Horticulture Services",
                description: "Professional landscaping and garden maintenance solutions"
            },
            {
                title: "Personnel Sourcing",
                description: "Recruitment of qualified cleaners, chefs, and support staff"
            }
        ];
        
        if (this.videos.length > 0) {
            this.init();
        }
    }
    
    init() {
        // Set total videos count
        if (this.totalVideosSpan) {
            this.totalVideosSpan.textContent = this.totalVideos;
        }
        
        // Initialize first video
        this.updateProgressBar();
        this.updateCounter();
        
        // Set initial caption
        this.setInitialCaption();
        
        // Add event listeners
        this.addEventListeners();
        
        // Handle Safari autoplay restrictions
        this.handleAutoplayRestrictions();
        
        // Ensure videos are ready
        this.preloadVideos();
    }
    
    handleAutoplayRestrictions() {
        // Check if autoplay is supported
        const testVideo = this.videos[0];
        if (testVideo) {
            const playPromise = testVideo.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Autoplay worked
                    this.hasUserInteracted = true;
                    this.startAutoPlay();
                }).catch(() => {
                    // Autoplay blocked - show play button
                    this.showPlayButton();
                });
            } else {
                // No play promise support - likely older browser
                this.showPlayButton();
            }
        }
    }
    
    showPlayButton() {
        if (this.playOverlay) {
            this.playOverlay.classList.add('show');
        }
        
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => {
                this.enableVideoPlayback();
            });
        }
    }
    
    enableVideoPlayback() {
        this.hasUserInteracted = true;
        
        // Hide play button
        if (this.playOverlay) {
            this.playOverlay.classList.remove('show');
        }
        
        // Start playing the current video
        const currentVideo = this.videos[this.currentIndex];
        if (currentVideo) {
            currentVideo.play().then(() => {
                this.startAutoPlay();
            }).catch(console.error);
        }
    }
    
    setInitialCaption() {
        if (this.captions.length > 0 && this.captionElements.length > 0 && this.descriptionElements.length > 0) {
            const firstCaption = this.captions[0];
            
            console.log(`Setting initial caption: ${firstCaption.title}`); // Debug log
            
            // Update all caption elements (desktop and mobile)
            this.captionElements.forEach(element => {
                element.textContent = firstCaption.title;
                element.style.opacity = '1';
            });
            
            this.descriptionElements.forEach(element => {
                element.textContent = firstCaption.description;
                element.style.opacity = '1';
            });
        }
    }
    
    addEventListeners() {
        // Navigation buttons
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.previousVideo());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextVideo());
        
        // Indicator buttons
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToVideo(index));
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousVideo();
            if (e.key === 'ArrowRight') this.nextVideo();
            if (e.key === ' ') {
                e.preventDefault();
                this.toggleAutoPlay();
            }
        });
        
        // Touch/swipe support
        this.addTouchSupport();
        
        // Pause autoplay on hover (desktop only)
        if (!this.isTouchDevice()) {
            const container = document.querySelector('.video-carousel-container');
            if (container) {
                container.addEventListener('mouseenter', () => this.pauseAutoPlay());
                container.addEventListener('mouseleave', () => this.startAutoPlay());
            }
        }
        
        // Video load events
        this.videos.forEach((video, index) => {
            video.addEventListener('canplay', () => {
                console.log(`Video ${index + 1} ready to play`);
            });
            
            video.addEventListener('error', (e) => {
                console.error(`Error loading video ${index + 1}:`, e);
                this.handleVideoError(index);
            });
        });
    }
    
    preloadVideos() {
        this.videos.forEach((video) => {
            video.load(); // Preload video
        });
    }
    
    handleVideoError(index) {
        // Create a fallback colored background if video fails to load
        const video = this.videos[index];
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'video-fallback';
        fallbackDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #d4a574, #b8935a);
            opacity: 0;
            z-index: 1;
        `;
        
        video.parentNode.insertBefore(fallbackDiv, video);
        video.style.display = 'none';
    }
    
    addTouchSupport() {
        let startX = 0;
        let startY = 0;
        const container = document.querySelector('.video-carousel-container');
        
        if (!container) return;
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        container.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Check if horizontal swipe is more significant than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextVideo(); // Swipe left - next video
                } else {
                    this.previousVideo(); // Swipe right - previous video
                }
            }
            
            startX = 0;
            startY = 0;
        });
    }
    
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    updateCaption() {
        if (this.captionElements.length === 0 || this.descriptionElements.length === 0) return;
        
        // Use fallback captions to ensure they always work
        const captionData = this.captions[this.currentIndex];
        
        if (captionData) {
            console.log(`Updating caption to: ${captionData.title} (index: ${this.currentIndex})`); // Debug log
            
            // Update all caption elements (desktop and mobile)
            this.captionElements.forEach(element => {
                element.textContent = captionData.title;
            });
            
            this.descriptionElements.forEach(element => {
                element.textContent = captionData.description;
            });
        }
    }
    
    switchVideo(newIndex) {
        if (this.isTransitioning || newIndex === this.currentIndex) return;
        
        this.isTransitioning = true;
        console.log(`Switching from video ${this.currentIndex} to video ${newIndex}`); // Debug log
        
        const currentVideo = this.videos[this.currentIndex];
        const nextVideo = this.videos[newIndex];
        
        // Update index first
        this.currentIndex = newIndex;
        
        // Update all UI elements immediately
        this.updateCaption();
        this.updateIndicators();
        this.updateProgressBar();
        this.updateCounter();
        
        // Handle video transition
        if (currentVideo) {
            currentVideo.classList.remove('active');
            currentVideo.pause();
        }
        
        if (nextVideo) {
            nextVideo.classList.add('active');
            nextVideo.currentTime = 0;
            
            // Only try to play if user has interacted
            if (this.hasUserInteracted) {
                nextVideo.play().catch(console.error);
            }
        }
        
        // Reset transitioning flag after a short delay
        setTimeout(() => {
            this.isTransitioning = false;
        }, 100);
    }
    
    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    updateProgressBar() {
        if (this.progressFill) {
            const progress = ((this.currentIndex + 1) / this.totalVideos) * 100;
            this.progressFill.style.width = `${progress}%`;
        }
    }
    
    updateCounter() {
        if (this.currentVideoSpan) {
            this.currentVideoSpan.textContent = this.currentIndex + 1;
        }
    }
    
    nextVideo() {
        const nextIndex = (this.currentIndex + 1) % this.totalVideos;
        this.switchVideo(nextIndex);
        this.resetAutoPlay();
    }
    
    previousVideo() {
        const prevIndex = (this.currentIndex - 1 + this.totalVideos) % this.totalVideos;
        this.switchVideo(prevIndex);
        this.resetAutoPlay();
    }
    
    goToVideo(index) {
        if (index >= 0 && index < this.totalVideos) {
            this.switchVideo(index);
            this.resetAutoPlay();
        }
    }
    
    startAutoPlay() {
        // Only start autoplay if user has interacted
        if (!this.hasUserInteracted) return;
        
        this.pauseAutoPlay(); // Clear any existing interval
        console.log('Starting autoplay with', this.autoPlayDelay, 'ms delay'); // Debug log
        this.autoPlayInterval = setInterval(() => {
            console.log('Auto-advancing to next video'); // Debug log
            this.nextVideo();
        }, this.autoPlayDelay);
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    resetAutoPlay() {
        this.startAutoPlay();
    }
    
    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            this.pauseAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }
}

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target) || navToggle.contains(event.target);
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
    
    // Smooth scroll behavior for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form handling
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Show success message (in a real app, you'd send this to your server)
            showNotification('Thank you for your message! We will get back to you soon.', 'success');
            
            // Reset form
            this.reset();
        });
    });
    
    // Initialize Video Carousel
    const videoCarousel = new VideoCarousel();
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation (excluding service rows which have their own animation)
    const animateElements = document.querySelectorAll('.about-stats .stat');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    // Scroll-based unwrapping animation for service rows
    function handleServiceRowsUnwrapping() {
        const serviceRows = document.querySelectorAll('.service-row');
        const servicesSection = document.getElementById('services');
        
        if (!servicesSection || serviceRows.length === 0) return;
        
        const sectionTop = servicesSection.offsetTop;
        const sectionHeight = servicesSection.offsetHeight;
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        // Calculate how far through the services section we've scrolled
        const sectionProgress = Math.max(0, Math.min(1, 
            (scrollTop + windowHeight - sectionTop) / (sectionHeight + windowHeight)
        ));
        
        // Unwrap rows based on scroll progress
        serviceRows.forEach((row, index) => {
            const rowProgress = (index + 1) / serviceRows.length;
            const shouldBeUnwrapped = sectionProgress >= rowProgress * 0.8; // Start unwrapping at 80% of the way to each row
            
            if (shouldBeUnwrapped) {
                row.classList.add('unstacked');
            } else {
                row.classList.remove('unstacked');
            }
        });
    }
    
    // Add scroll event listener for continuous unwrapping
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        // Use requestAnimationFrame for smooth performance
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(handleServiceRowsUnwrapping);
    });
    
    // Initial call to set correct state on page load
    handleServiceRowsUnwrapping();

    // Special observer for the about image zoom effect
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('zoom-in');
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    });

    // Observe the about image
    const aboutImage = document.querySelector('.about-image img');
    if (aboutImage) {
        imageObserver.observe(aboutImage);
    }

    // Handle visibility change (pause video carousel when tab is not active)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            videoCarousel.pauseAutoPlay();
        } else {
            videoCarousel.startAutoPlay();
        }
    });

    // Optimize videos for device
    function optimizeVideoForDevice() {
        const videos = document.querySelectorAll('.background-video');
        const isMobile = window.innerWidth <= 768;
        
        videos.forEach(video => {
            // Reduce quality on mobile devices for better performance
            if (isMobile) {
                video.style.filter = 'brightness(0.9)'; // Slightly reduce brightness on mobile
            }
            
            // Ensure videos are muted (some browsers require this for autoplay)
            video.muted = true;
            video.playsInline = true;
        });
    }

    // Call optimization on load and resize
    optimizeVideoForDevice();
    window.addEventListener('resize', optimizeVideoForDevice);
});

// Notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Smooth scroll to about section
function scrollToAbout() {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = aboutSection.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // Optional: Add some visual feedback
    const scrollBtn = document.querySelector('.scroll-down-btn');
    if (scrollBtn) {
        scrollBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            scrollBtn.style.transform = '';
        }, 150);
    }
}

// Add CSS for hamburger animation
const style = document.createElement('style');
style.textContent = `
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(style); 