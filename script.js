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
    WAVE1: 'WAVE1', // Dense initial drop sitting at top
    WAVE2: 'WAVE2', // Slow filling over 1 minute
    DONE: 'DONE'    // 25% full
};
let currentState = STATES.WAVE1;

let wave1Count = 0;
let wave1Settled = 0;

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
    
    // Estimate counts based on screen area to hit 15% and 10%
    const bobaArea = 300; // rough area taken by one boba in the pile including gaps
    wave1Count = Math.floor((width * height * 0.15) / bobaArea);
    wave1Count = Math.min(600, wave1Count); // Cap it to ensure performance
    
    wave2Count = Math.floor((width * height * 0.10) / bobaArea);
    wave2Count = Math.min(400, wave2Count);
}

class Boba {
    constructor(isWave1 = false) {
        this.size = Math.random() * 8 + 6; 
        this.isWave1 = isWave1;
        
        if (this.isWave1) {
            // Sitting together at the top, drop together
            this.x = Math.random() * (width - 40) + 20;
            // Clumped vertically right above the screen bounds
            this.y = -50 - Math.random() * 150;
            this.vy = Math.random() * 2 + 5; // Fall fast together
            this.vx = (Math.random() - 0.5) * 0.5;
        } else {
            // Wave 2: spawn at top, fall slowly
            this.x = Math.random() * (width - 40) + 20;
            this.y = -50;
            this.vy = Math.random() * 1.5 + 1.5; // Slower fall
            this.vx = (Math.random() - 0.5) * 1.5;
        }
        
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
    }

    update() {
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
            this.settle(); // Count as settled if it completely falls off bounds to prevent infinite active particles
            return false;
        }
        return true;
    }

    settle() {
        const radius = Math.floor(this.size * 0.8);
        const ix = Math.floor(this.x);
        
        // Only add to map if it's within bounds
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
        
        if (this.isWave1) {
            wave1Settled++;
            if (wave1Settled >= wave1Count && currentState === STATES.WAVE1) {
                currentState = STATES.WAVE2;
                wave2StartTime = performance.now();
            }
        }
        
        if (settledParticles.length > 3000) { // Safety cap
            settledParticles.shift();
        }
        
        return false; // Particle is done
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

// Start Wave 1 (All at once)
for (let i = 0; i < wave1Count; i++) {
    particles.push(new Boba(true));
}

function animate(timestamp) {
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

    // Wave 2 Spawning Logic
    if (currentState === STATES.WAVE2) {
        const elapsed = timestamp - wave2StartTime;
        if (elapsed < wave2Duration) {
            const expectedSpawn = Math.floor((elapsed / wave2Duration) * wave2Count);
            const toSpawn = expectedSpawn - wave2Spawned;
            
            for(let i=0; i < toSpawn; i++) {
                particles.push(new Boba(false));
                wave2Spawned++;
            }
        } else {
            currentState = STATES.DONE;
        }
    }

    // Check strict 25% height limit globally just in case
    if (currentState !== STATES.DONE) {
        const minHeight = Math.min(...accumulationMap);
        if (height - minHeight > height * 0.25) {
            currentState = STATES.DONE;
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
