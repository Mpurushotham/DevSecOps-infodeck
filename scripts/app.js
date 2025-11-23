// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('DevSecOps Guide Loaded');
    
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
            z-index: 10;
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
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = code;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                copyButton.style.background = 'var(--success-color)';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="far fa-copy"></i>';
                    copyButton.style.background = '#333';
                }, 2000);
            }
        });
    });

    // Progress Tracking for Checklists
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        // Load saved state from localStorage
        const savedState = localStorage.getItem(`devsecops-${checkbox.closest('.stage-card').dataset.stage}-${checkbox.nextSibling.textContent.trim()}`);
        if (savedState === 'true') {
            checkbox.checked = true;
        }
        
        // Save state on change
        checkbox.addEventListener('change', function() {
            const key = `devsecops-${this.closest('.stage-card').dataset.stage}-${this.nextSibling.textContent.trim()}`;
            localStorage.setItem(key, this.checked);
            updateProgress();
        });
    });

    function updateProgress() {
        const checkedItems = document.querySelectorAll('.checklist input[type="checkbox"]:checked').length;
        const totalItems = document.querySelectorAll('.checklist input[type="checkbox"]').length;
        
        if (totalItems > 0) {
            const progress = (checkedItems / totalItems) * 100;
            console.log(`DevSecOps Progress: ${progress.toFixed(1)}%`);
        }
    }

    // Initialize progress
    updateProgress();

    // Scroll to top functionality
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.style.cssText = `
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
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
        } else {
            scrollToTopBtn.style.opacity = '0';
        }
    });

    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add some interactive animations
    const animatedElements = document.querySelectorAll('.stage-card, .impl-card, .tool-category');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
