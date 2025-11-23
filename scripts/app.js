// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Stage Card Toggle
    const stageCards = document.querySelectorAll('.stage-card');
    
    stageCards.forEach(card => {
        const header = card.querySelector('.stage-header');
        const toggle = card.querySelector('.stage-toggle');
        
        header.addEventListener('click', () => {
            const isActive = card.classList.contains('active');
            
            // Close all other cards
            stageCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('active');
                }
            });
            
            // Toggle current card
            card.classList.toggle('active');
        });
    });

    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Pipeline Stage Hover Effects
    const pipelineStages = document.querySelectorAll('.pipeline-stage');
    
    pipelineStages.forEach(stage => {
        stage.addEventListener('mouseenter', function() {
            const stageType = this.getAttribute('data-stage');
            highlightRelatedContent(stageType);
        });
        
        stage.addEventListener('mouseleave', function() {
            removeHighlights();
        });
    });

    function highlightRelatedContent(stageType) {
        // Remove previous highlights
        removeHighlights();
        
        // Highlight corresponding stage card
        const correspondingCard = document.querySelector(`.stage-card[data-stage="${stageType}"]`);
        if (correspondingCard) {
            correspondingCard.style.transform = 'scale(1.02)';
            correspondingCard.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
        }
    }

    function removeHighlights() {
        stageCards.forEach(card => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    }

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.principle-card, .stage-card, .impl-card, .roadmap-phase');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Checklist Functionality
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        // Load saved state from localStorage
        const savedState = localStorage.getItem(checkbox.id || checkbox.name);
        if (savedState === 'true') {
            checkbox.checked = true;
        }
        
        // Save state on change
        checkbox.addEventListener('change', function() {
            const key = this.id || this.name;
            localStorage.setItem(key, this.checked);
        });
    });

    // Copy Code Snippet Functionality
    const codeSnippets = document.querySelectorAll('.code-snippet');
    
    codeSnippets.forEach(snippet => {
        const copyButton = document.createElement('button');
        copyButton.innerHTML = '<i class="far fa-copy"></i>';
        copyButton.className = 'copy-btn';
        copyButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #333;
            border: none;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        
        snippet.style.position = 'relative';
        snippet.appendChild(copyButton);
        
        copyButton.addEventListener('click', async function() {
            const code = snippet.querySelector('code').textContent;
            
            try {
                await navigator.clipboard.writeText(code);
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                copyButton.style.background = 'var(--success-color)';
                
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="far fa-copy"></i>';
                    copyButton.style.background = '#333';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });
    });

    // Progress Tracking
    function updateProgress() {
        const checkedItems = document.querySelectorAll('.checklist input[type="checkbox"]:checked').length;
        const totalItems = document.querySelectorAll('.checklist input[type="checkbox"]').length;
        
        if (totalItems > 0) {
            const progress = (checkedItems / totalItems) * 100;
            console.log(`DevSecOps Progress: ${progress.toFixed(1)}%`);
            
            // You could add a progress bar to the UI here
            updateProgressBar(progress);
        }
    }

    function updateProgressBar(progress) {
        let progressBar = document.getElementById('progress-bar');
        
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'progress-bar';
            progressBar.style.cssText = `
                position: fixed;
                top: 70px;
                left: 0;
                width: 100%;
                height: 4px;
                background: #e5e7eb;
                z-index: 999;
            `;
            
            const progressFill = document.createElement('div');
            progressFill.id = 'progress-fill';
            progressFill.style.cssText = `
                height: 100%;
                background: var(--success-color);
                width: 0%;
                transition: width 0.3s ease;
            `;
            
            progressBar.appendChild(progressFill);
            document.body.appendChild(progressBar);
        }
        
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = `${progress}%`;
    }

    // Initialize progress tracking
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateProgress);
    });
    
    updateProgress();

    // Theme Toggle (Optional)
    const themeToggle = document.createElement('button');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.className = 'theme-toggle';
    themeToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: var(--shadow);
        z-index: 1000;
    `;
    
    document.body.appendChild(themeToggle);
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const icon = this.querySelector('i');
        
        if (document.body.classList.contains('dark-theme')) {
            icon.className = 'fas fa-sun';
            // You would add dark theme CSS variables here
        } else {
            icon.className = 'fas fa-moon';
        }
    });
});

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Scroll to top functionality
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: var(--shadow);
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
`;

document.body.appendChild(scrollToTopBtn);

window.addEventListener('scroll', debounce(function() {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.opacity = '1';
    } else {
        scrollToTopBtn.style.opacity = '0';
    }
}, 100));

scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
