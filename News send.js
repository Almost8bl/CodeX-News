document.addEventListener('DOMContentLoaded', function() {

    // --- Preloader Logic ---
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        preloader.classList.add('hidden');
    });

    // --- Scroll Animation Logic (Intersection Observer) ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing after the animation has played once
                // observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // --- Typing Effect Logic ---
    const typingElement = document.getElementById('typing-slogan');
    const slogans = ["نحن لا نبحث عن الصدى بل عن الحقيقة.", "نحن نبني إعلام المستقبل.", "WE BRING ONLY THE FACTS"];
    let sloganIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentSlogan = slogans[sloganIndex];
        let displayText = '';

        if (isDeleting) {
            // Deleting text
            displayText = currentSlogan.substring(0, charIndex - 1);
            charIndex--;
        } else {
            // Typing text
            displayText = currentSlogan.substring(0, charIndex + 1);
            charIndex++;
        }

        typingElement.innerHTML = displayText;

        let typeSpeed = isDeleting ? 50 : 150;

        if (!isDeleting && charIndex === currentSlogan.length) {
            // Pause at the end of the word
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            sloganIndex = (sloganIndex + 1) % slogans.length;
            typeSpeed = 500; // Pause before typing the new word
        }

        setTimeout(type, typeSpeed);
    }

    // Start typing effect after a short delay for the main header to fade in
    setTimeout(type, 1500);

});