const translations = {
    en: {
        "t-hero-title": "Sip the Sweetness",
        "t-hero-subtitle": "Premium Bubble Tea lovingly crafted in Tbilisi.",
        "t-hero-cta": "View Menu",
        "t-menu-title": "Our Top Picks",
        "t-dish1-name": "Brown Sugar Boba",
        "t-dish1-desc": "Rich caramel notes with our signature chewy tapioca.",
        "t-dish2-name": "Taro Milk Tea",
        "t-dish2-desc": "Creamy, nutty, and vibrant purple perfection.",
        "t-dish3-name": "Matcha Latte",
        "t-dish3-desc": "Earthy premium matcha layered with fresh milk.",
        "t-order-wolt-1": "Order on Wolt",
        "t-order-wolt-2": "Order on Wolt",
        "t-order-wolt-3": "Order on Wolt",
        "t-links-title": "Find Us Here",
        "t-map-title": "Visit Us",
        "t-built-by": "Built with"
    },
    ge: {
        "t-hero-title": "დააგემოვნე სიტკბო",
        "t-hero-subtitle": "პრემიუმ ბაბლ თი, სიყვარულით დამზადებული თბილისში.",
        "t-hero-cta": "ნახეთ მენიუ",
        "t-menu-title": "ჩვენი რჩეულები",
        "t-dish1-name": "ბრაუნ შუგარ ბობა",
        "t-dish1-desc": "მდიდარი კარამელის ნოტები ჩვენს საფირმო ტაპიოკასთან ერთად.",
        "t-dish2-name": "ტაროს რძიანი ჩაი",
        "t-dish2-desc": "კრემოვანი, თხილამური და იდეალური იასამნისფერი.",
        "t-dish3-name": "მატჩა ლატე",
        "t-dish3-desc": "პრემიუმ მატჩა ახალი რძის ფენით.",
        "t-order-wolt-1": "შეუკვეთეთ Wolt-ზე",
        "t-order-wolt-2": "შეუკვეთეთ Wolt-ზე",
        "t-order-wolt-3": "შეუკვეთეთ Wolt-ზე",
        "t-links-title": "გვიპოვეთ აქ",
        "t-map-title": "გვესტუმრეთ",
        "t-built-by": "შექმნილია"
    }
};

const langToggle = document.getElementById('langToggle');
const langEn = document.getElementById('lang-en');
const langGe = document.getElementById('lang-ge');

// Default is Georgian as per instructions: "App should be in georgian by default"
let currentLang = 'ge';

function setLanguage(lang) {
    currentLang = lang;

    // Update labels
    if (lang === 'en') {
        langEn.classList.add('active');
        langGe.classList.remove('active');
        langToggle.checked = false;
        document.querySelector('.hero-title').removeAttribute('lang');
    } else {
        langGe.classList.add('active');
        langEn.classList.remove('active');
        langToggle.checked = true;
        document.querySelector('.hero-title').setAttribute('lang', 'ge');
    }

    // Update texts
    for (const key in translations[lang]) {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = translations[lang][key];
        }
    }
}

// Initialize with Georgian
setLanguage('ge');

langToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        setLanguage('ge');
    } else {
        setLanguage('en');
    }
});

// Interactive Boba Particles
const container = document.getElementById('boba-particles');

function createBoba() {
    const boba = document.createElement('div');
    boba.classList.add('boba');

    // Randomize properties
    const size = Math.random() * 15 + 10; // 10px to 25px
    const left = Math.random() * 100; // 0% to 100%
    const duration = Math.random() * 10 + 5; // 5s to 15s

    boba.style.width = `${size}px`;
    boba.style.height = `${size}px`;
    boba.style.left = `${left}vw`;
    boba.style.animationDuration = `${duration}s`;

    container.appendChild(boba);

    // Remove after animation completes
    setTimeout(() => {
        boba.remove();
    }, duration * 1000);
}

// Create new boba particles periodically
setInterval(createBoba, 300);

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
