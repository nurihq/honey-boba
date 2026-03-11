const translations = {
    en: {
        "t-hero-title": "Sip the Sweetness",
        "t-hero-subtitle": "Premium Bubble Tea lovingly crafted in Tbilisi.",
        "t-hero-cta": "View Menu",
        "t-menu-title": "Our Top Picks",
        "t-dish1-name": "Taro Lava",
        "t-dish1-desc": "Creamy taro with purple lava swirls and chewy boba.",
        "t-dish2-name": "Tiger Boba",
        "t-dish2-desc": "Signature brown sugar stripes with fresh milk and pearls.",
        "t-dish3-name": "Oreo Cheesecake",
        "t-dish3-desc": "Indulgent cheesecake flavor with crunchy Oreo bits.",
        "t-order-wolt-1": "Order on Wolt",
        "t-order-wolt-2": "Order on Wolt",
        "t-order-wolt-3": "Order on Wolt",
        "t-links-title": "Find Us Here",
        "t-map-title": "Visit Us",
        "t-footer-prefix": "Built with",
        "t-footer-suffix": "by"
    },
    ge: {
        "t-hero-title": "დააგემოვნე სიტკბო",
        "t-hero-subtitle": "პრემიუმ ბაბლ თი, სიყვარულით დამზადებული თბილისში.",
        "t-hero-cta": "ნახეთ მენიუ",
        "t-menu-title": "ჩვენი რჩეულები",
        "t-dish1-name": "ტარო ლავა",
        "t-dish1-desc": "კრემოვანი ტარო იასამნისფერი ლავის ეფექტით და ბობით.",
        "t-dish2-name": "ტაიგერ ბობა",
        "t-dish2-desc": "საფირმო ყავისფერი შაქრის ზოლები ახალი რძით და მარგალიტებით.",
        "t-dish3-name": "ორეო ჩიზქეიქი",
        "t-dish3-desc": "მდიდარი ჩიზქეიქის გემო ხრაშუნა ორეოს ნამცხვრებით.",
        "t-order-wolt-1": "შეუკვეთეთ Wolt-ზე",
        "t-order-wolt-2": "შეუკვეთეთ Wolt-ზე",
        "t-order-wolt-3": "შეუკვეთეთ Wolt-ზე",
        "t-links-title": "გვიპოვეთ აქ",
        "t-map-title": "გვესტუმრეთ",
        "t-footer-prefix": "შექმნილია",
        "t-footer-suffix": "-ით"
    }
};

const langBtn = document.getElementById('langToggle');
let currentLang = 'ge'; // Default to Georgian

function updateLanguage(lang) {
    currentLang = lang;
    langBtn.textContent = lang === 'en' ? '🇬🇪' : '🇺🇸';
    for (const key in translations[lang]) {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = translations[lang][key];
        }
    }
    document.documentElement.lang = lang;
}

langBtn.addEventListener('click', () => {
    const nextLang = currentLang === 'en' ? 'ge' : 'en';
    updateLanguage(nextLang);
});

updateLanguage('ge');

// Boba Particle Accumulation Animation (Canvas)
const canvas = document.getElementById('boba-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let settledParticles = [];
const accumulationMap = [];

// Wave States
const STATES = {
    POUR: 'POUR', // Clumped initial pour
    TRICKLE: 'TRICKLE', // Slower, decaying flow
    DONE: 'DONE' // 20% full, stop falling
};
let currentState = STATES.POUR;
let wave1Count = 120; // Denser pour
let wave1Settled = 0;
const HEIGHT_LIMIT_PERCENT = 0.22; // Slightly more than 20% for safety cushion

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    accumulationMap.length = 0;
    for (let i = 0; i < width; i++) {
        accumulationMap[i] = height;
    }
}

window.addEventListener('resize', resize);
resize();

class Boba {
    constructor(index = 0) {
        this.reset(true, index);
    }

    reset(isInitial = false, index = 0) {
        // Height check - stop spawning if full
        const minHeight = Math.min(...accumulationMap);
        if (height - minHeight > height * HEIGHT_LIMIT_PERCENT) {
            currentState = STATES.DONE;
            return false;
        }

        this.size = Math.random() * 8 + 6;

        if (currentState === STATES.POUR) {
            // "Pouring" physics: centralized clumps, fast fall
            // Use index to stagger start positions for the "pour" effect
            const clumpX = width / 2 + (Math.random() - 0.5) * (width * 0.6);
            this.x = clumpX;
            this.y = -50 - (index * 15) - (Math.random() * 200);
            this.vy = (Math.random() * 2.5 + 4); // Fast "pour" speed
        } else if (currentState === STATES.TRICKLE) {
            // "Trickle" physics: wide spread, slow fall
            this.x = Math.random() * (width - 40) + 20;
            this.y = -50 - Math.random() * 500;
            this.vy = (Math.random() * 1.5 + 0.5) * 0.5; // Very slow
        } else {
            return false;
        }

        this.vx = (Math.random() - 0.5) * 1.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;

        const rand = Math.random();
        if (rand < 0.05) {
            this.color1 = '#ffc0cb';
            this.color2 = '#ff758f';
        } else if (rand < 0.10) {
            this.color1 = '#add8e6';
            this.color2 = '#00c2e8';
        } else {
            this.color1 = '#4a2e1b';
            this.color2 = '#21130b';
        }
        return true;
    }

    update() {
        if (currentState === STATES.DONE) return false;

        this.y += this.vy;
        this.x += this.vx;
        this.rotation += this.rotationSpeed;

        const radius = Math.floor(this.size * 0.8);
        const ix = Math.floor(this.x);

        if (ix >= radius && ix < width - radius) {
            let maxSurfaceY = height;
            for (let i = -radius; i <= radius; i++) {
                const checkX = ix + i;
                const h = Math.sqrt(radius * radius - i * i);
                const surfaceY = accumulationMap[checkX] - h;
                if (surfaceY < maxSurfaceY) {
                    maxSurfaceY = surfaceY;
                }
            }

            if (this.y >= maxSurfaceY) {
                this.y = maxSurfaceY;
                this.settle();
                return false;
            }
        }

        if (this.y > height + 20) {
            if (currentState === STATES.POUR) {
                wave1Settled++;
            }
            return this.reset();
        }
        return true;
    }

    settle() {
        const radius = Math.floor(this.size * 0.8);
        const ix = Math.floor(this.x);

        for (let i = -radius; i <= radius; i++) {
            const checkX = ix + i;
            if (checkX >= 0 && checkX < width) {
                const h = Math.sqrt(radius * radius - i * i);
                const surfaceY = this.y - h;
                if (surfaceY < accumulationMap[checkX]) {
                    accumulationMap[checkX] = surfaceY;
                }
            }
        }
        settledParticles.push({
            x: this.x,
            y: this.y,
            size: this.size,
            color1: this.color1,
            color2: this.color2,
            rotation: this.rotation
        });

        if (currentState === STATES.POUR) {
            wave1Settled++;
            if (wave1Settled >= wave1Count) {
                currentState = STATES.TRICKLE;
                // Transition Wave 1 to Wave 2: Slice down to keep it sparse
                particles = particles.slice(0, 15);
            }
            return false; // Wave 1 particles are consumed after settling
        }

        if (settledParticles.length > 2500) {
            settledParticles.shift();
        }

        // Trickle wave density decay
        if (currentState === STATES.TRICKLE && Math.random() < 0.1) {
            // Gradually cull particles to make it less dense
            return false;
        }

        return this.reset();
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const grad = ctx.createRadialGradient(-this.size / 3, -this.size / 3, this.size / 10, 0, 0, this.size);
        grad.addColorStop(0, this.color1);
        grad.addColorStop(1, this.color2);

        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Start Wave 1 (The Pour)
for (let i = 0; i < wave1Count; i++) {
    particles.push(new Boba(i));
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw all settled boba
    settledParticles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        const grad = ctx.createRadialGradient(-p.size / 3, -p.size / 3, p.size / 10, 0, 0, p.size);
        grad.addColorStop(0, p.color1);
        grad.addColorStop(1, p.color2);
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // Update and filter active particles
    particles = particles.filter(p => {
        const active = p.update();
        if (active) p.draw();
        return active;
    });

    requestAnimationFrame(animate);
}

animate();

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
