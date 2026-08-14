document.addEventListener("DOMContentLoaded", () => {
    let lastScrollTop = window.scrollY || document.documentElement.scrollTop;
    const header = document.getElementById("site-header");
    
    if (!header) return;

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
            // Scrolling down
            header.classList.add("hidden-nav");
        } else {
            // Scrolling up
            header.classList.remove("hidden-nav");
        }
        
        // Add scrolled background if past top
        if (scrollTop > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        
        lastScrollTop = scrollTop;
    });
});
