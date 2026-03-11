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
// Real 2D Physics for liquid leveling
const canvas = document.getElementById('boba-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

let wave1Count = 0;
let wave2Count = 0;
let wave2Spawned = 0;
let wave2StartTime = 0;
let wave2Duration = 60000; // 1 minute in ms

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Calculate total capacity for ~25% filled area
    // A circle packs efficiently at roughly ~90% density in 2D
    const avgRadius = 8;
    const bobaArea = Math.PI * avgRadius * avgRadius;
    let totalCapacity = Math.floor((width * height * 0.25 * 0.9) / bobaArea);

    // Strict cap for performance (600 particles is very smooth for O(N^2) in JS)
    totalCapacity = Math.min(600, totalCapacity);

    // Wave 1 is exactly 50%
    wave1Count = Math.floor(totalCapacity / 2);
    wave2Count = totalCapacity - wave1Count;
}

class Boba {
    constructor(isWave1 = false) {
        this.size = Math.random() * 4 + 6; // Radius
        this.isWave1 = isWave1;

        if (this.isWave1) {
            this.x = Math.random() * (width - 40) + 20;
            // Spawn way off screen so they fall like a uniform wave
            this.y = -Math.random() * height * 0.8 - 50;
            // Slower, dispersed fall
            this.vy = Math.random() * 1.5 + 1;
            this.vx = (Math.random() - 0.5) * 4;
        } else {
            // Wave 2: slower overall drift
            this.x = Math.random() * (width - 40) + 20;
            this.y = -50;
            // 50% of the speed of Wave 1
            this.vy = Math.random() * 0.5 + 0.5;
            this.vx = (Math.random() - 0.5) * 1;
        }

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;

        // Visuals
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
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const grad = ctx.createRadialGradient(-this.size / 3, -this.size / 3, this.size / 10, 0, 0, this.size);
        grad.addColorStop(0, this.color1);
        grad.addColorStop(1, this.color2);

        ctx.fillStyle = grad;
        // Keep alpha slightly transparent so they look like jelly
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialization and start
window.addEventListener('resize', resize);
resize();

// Start Wave 1 (50% initially)
for (let i = 0; i < wave1Count; i++) {
    particles.push(new Boba(true));
}

function updatePhysics() {
    const gravity = 0.15;
    const bounceFriction = 0.3; // retain 30% speed on bounce
    const floorFriction = 0.8; // horizontal slowdown on floor

    // 1. Apply gravity, velocity, and boundary constraints
    for (let p of particles) {
        p.vy += gravity;

        // Terminal velocity
        if (p.vy > 12) p.vy = 12;

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Floor constraint
        if (p.y + p.size > height) {
            p.y = height - p.size;
            p.vy *= -bounceFriction;
            p.vx *= floorFriction;
            p.rotationSpeed *= 0.8;
        }

        // Wall constraints
        if (p.x - p.size < 0) {
            p.x = p.size;
            p.vx *= -bounceFriction;
        } else if (p.x + p.size > width) {
            p.x = width - p.size;
            p.vx *= -bounceFriction;
        }
    }

    // 2. Resolve particle-to-particle collisions (Liquid Granular Effect)
    // 2 iterations helps to settle them nicely like a fluid without spaces
    for (let iter = 0; iter < 2; iter++) {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let p1 = particles[i];
                let p2 = particles[j];

                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                let distSq = dx * dx + dy * dy;
                let minDist = p1.size + p2.size;

                if (distSq < minDist * minDist) {
                    let dist = Math.sqrt(distSq);
                    if (dist === 0) dist = 0.1; // prevent divide by zero

                    let overlap = minDist - dist;
                    let nx = dx / dist;
                    let ny = dy / dist;

                    // Push apart evenly
                    let pushX = nx * overlap * 0.5;
                    let pushY = ny * overlap * 0.5;

                    p1.x -= pushX;
                    p1.y -= pushY;
                    p2.x += pushX;
                    p2.y += pushY;

                    // Transfer momentum slightly / Dampen to simulate viscosity
                    p1.vx *= 0.9;
                    p1.vy *= 0.9;
                    p2.vx *= 0.9;
                    p2.vy *= 0.9;

                    p1.rotationSpeed *= 0.9;
                    p2.rotationSpeed *= 0.9;
                }
            }
        }
    }
}

function animate(timestamp) {
    ctx.clearRect(0, 0, width, height);

    // Wave 2 Spawning Logic (Immediate parallel start, 50% drifting over 1 minute)
    if (wave2StartTime === 0) {
        wave2StartTime = timestamp;
    }

    const elapsed = timestamp - wave2StartTime;
    if (elapsed < wave2Duration) {
        const expectedSpawn = Math.floor((elapsed / wave2Duration) * wave2Count);
        const toSpawn = expectedSpawn - wave2Spawned;

        for (let i = 0; i < toSpawn; i++) {
            particles.push(new Boba(false));
            wave2Spawned++;
        }
    }

    // Process real 2D physics
    updatePhysics();

    // Draw all
    for (let p of particles) {
        p.draw();
    }

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

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
