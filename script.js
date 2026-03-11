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
    WAVE1: 'WAVE1', // Initial drop
    WAVE2: 'WAVE2', // Slow filling over 1 minute
    DONE: 'DONE'    // 25% full
};
let currentState = STATES.WAVE1;

let wave1Count = 0;
let wave2Count = 0;
let wave2Spawned = 0;
let wave2StartTime = 0;
let wave2Duration = 60000; // 1 minute in ms

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    accumulationMap.length = 0;
    for (let i = 0; i < width; i++) {
        accumulationMap[i] = height;
    }

    // Calculate total capacity for ~25% filled area
    const bobaArea = 300;
    let totalCapacity = Math.floor((width * height * 0.25) / bobaArea);
    totalCapacity = Math.min(800, totalCapacity); // Performance cap

    // Wave 1 is exactly 50%
    wave1Count = Math.floor(totalCapacity / 2);
    wave2Count = totalCapacity - wave1Count;
}

class Boba {
    constructor(isWave1 = false) {
        this.size = Math.random() * 8 + 6;
        this.isWave1 = isWave1;

        if (this.isWave1) {
            this.x = Math.random() * (width - 40) + 20;
            // Sitting roughly at the same height at the top
            this.y = -50 - Math.random() * 40;
            // Fall slower initially, disperse horizontally
            this.vy = Math.random() * 1.5 + 2;
            this.vx = (Math.random() - 0.5) * 5;
            this.gravity = 0.15;
        } else {
            // Wave 2: slower overall drift
            this.x = Math.random() * (width - 40) + 20;
            this.y = -30;
            // 50% of the speed of Wave 1
            this.vy = Math.random() * 0.75 + 1;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.gravity = 0.05; // Lower gravity for a drifty feel
        }

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;

        this.bounceCount = 0;
        this.maxBounces = 2;
        this.isSettling = false;

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

    getSurfaceY(xPos) {
        const radius = Math.floor(this.size * 0.8);
        let maxSurfaceY = height;
        if (xPos >= radius && xPos < width - radius) {
            for (let i = -radius; i <= radius; i++) {
                const checkX = Math.floor(xPos) + i;
                if (checkX >= 0 && checkX < width) {
                    const h = Math.sqrt(radius * radius - i * i);
                    const surfaceY = accumulationMap[checkX] - h;
                    if (surfaceY < maxSurfaceY) {
                        maxSurfaceY = surfaceY;
                    }
                }
            }
        }
        return maxSurfaceY;
    }

    update() {
        if (this.isSettling) {
            // "Liquid" flow: evaluate surface slope by checking left and right envelope
            const yLeft = this.getSurfaceY(this.x - 3);
            const yRight = this.getSurfaceY(this.x + 3);
            const yCenter = this.getSurfaceY(this.x);

            // Note: Canvas Y goes down. So a larger Y means it's lower/deeper.
            if (yLeft > yCenter + 0.5) {
                this.vx -= 0.6; // Accelerate left towards lower gap
            } else if (yRight > yCenter + 0.5) {
                this.vx += 0.6; // Accelerate right towards lower gap
            } else {
                this.vx *= 0.6; // Apply friction at local minimum
            }

            // Cap the rolling speed
            if (this.vx > 3) this.vx = 3;
            if (this.vx < -3) this.vx = -3;

            this.x += this.vx;

            // Follow the contour of the gathered bobas
            const newSurfaceY = this.getSurfaceY(this.x);

            // If the drop is huge, it fell off a cliff, transition back to falling
            if (this.y < newSurfaceY - 4) {
                this.isSettling = false;
            } else {
                this.y = newSurfaceY;
            }

            // If we are settled horizontally, we can finalize to map
            if (Math.abs(this.vx) < 0.1 && this.isSettling) {
                this.finalizeSettle();
                return false;
            }
            return true;
        }

        // Falling physics
        this.y += this.vy;
        this.x += this.vx;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;

        // Bounce off walls
        if (this.x < this.size || this.x > width - this.size) {
            this.vx = -this.vx * 0.8;
            this.x = Math.max(this.size, Math.min(width - this.size, this.x));
        }

        const maxSurfaceY = this.getSurfaceY(this.x);

        // Collision with floor or other boba
        if (this.y >= maxSurfaceY) {
            this.y = maxSurfaceY;

            if (this.bounceCount < this.maxBounces && this.vy > 1.5) {
                // Bounce
                this.vy = -this.vy * 0.4;
                // Scatter outward horizontally
                this.vx += (Math.random() - 0.5) * 4;
                this.bounceCount++;
            } else {
                // Enter liquid rolling state
                this.isSettling = true;
                this.vy = 0;
            }
        }

        if (this.y > height + 20) {
            this.finalizeSettle();
            return false; // Escaped screen, remove
        }
        return true;
    }

    finalizeSettle() {
        const radius = Math.floor(this.size * 0.8);
        const ix = Math.floor(this.x);

        if (this.y <= height) {
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
        }

        if (settledParticles.length > 3000) {
            settledParticles.shift();
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
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialization and start
window.addEventListener('resize', resize);
resize();

// Start Wave 1 (50% all at once)
for (let i = 0; i < wave1Count; i++) {
    particles.push(new Boba(true));
}

function animate(timestamp) {
    ctx.clearRect(0, 0, width, height);

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

    // Clean trigger for Phase 2:
    // Once Phase 1 falls and every local minimum is settled
    if (currentState === STATES.WAVE1 && particles.length === 0) {
        currentState = STATES.WAVE2;
        wave2StartTime = timestamp;
    }

    // Wave 2 Spawning Logic (50% drifting over 1 minute)
    if (currentState === STATES.WAVE2) {
        const elapsed = timestamp - wave2StartTime;
        if (elapsed < wave2Duration) {
            const expectedSpawn = Math.floor((elapsed / wave2Duration) * wave2Count);
            const toSpawn = expectedSpawn - wave2Spawned;

            for (let i = 0; i < toSpawn; i++) {
                particles.push(new Boba(false));
                wave2Spawned++;
            }
        } else {
            if (particles.length === 0) {
                currentState = STATES.DONE;
            }
        }
    }

    // Update and filter active particles
    particles = particles.filter(p => {
        const active = p.update();
        if (active) p.draw();
        return active;
    });

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
