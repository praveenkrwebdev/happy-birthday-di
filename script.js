/* ============================================
   MILKY WAY CANVAS
============================================ */

const canvas = document.getElementById("galaxy");
const ctx    = canvas.getContext("2d");

let W, H;

function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const isMobile = window.innerWidth <= 768;

/* --- star field --- */
const STAR_COUNT = isMobile ? 500 : 1100;
const starField  = [];

for(let i = 0; i < STAR_COUNT; i++){
    const r = Math.random();
    starField.push({
        x: Math.random(),
        y: Math.random(),
        size: r > .97 ? Math.random()*1.6+1.4
            : r > .85 ? Math.random()*.8+.7
            :            Math.random()*.5+.2,
        base: Math.random()*.55+.1,
        speed: Math.random()*.6+.4,
        phase: Math.random()*Math.PI*2,
        // subtle color: blue-white, warm-white, or cool-white
        hue: [0,210,260,30][Math.floor(Math.random()*4)],
        sat: Math.random()*30
    });
}

/* --- nebula dust clouds (drawn once to offscreen) --- */
const offscreen = document.createElement("canvas");
let oCtx;

function buildNebula(){
    offscreen.width  = W;
    offscreen.height = H;
    oCtx = offscreen.getContext("2d");

    // deep space base
    oCtx.fillStyle = "#00000f";
    oCtx.fillRect(0,0,W,H);

    // galactic band — diagonal milky way strip
    const band = oCtx.createLinearGradient(0, H*.7, W, H*.1);
    band.addColorStop(0,   "rgba(10,6,40,0)");
    band.addColorStop(.2,  "rgba(60,40,120,.18)");
    band.addColorStop(.38, "rgba(100,70,180,.28)");
    band.addColorStop(.5,  "rgba(140,100,220,.22)");
    band.addColorStop(.62, "rgba(80,60,160,.2)");
    band.addColorStop(.8,  "rgba(40,30,100,.12)");
    band.addColorStop(1,   "rgba(10,6,40,0)");

    oCtx.fillStyle = band;
    oCtx.fillRect(0,0,W,H);

    // nebula blobs
    const blobs = [
        {x:.18,y:.65,rx:W*.38,ry:H*.28,c:"rgba(80,40,180,.14)"},
        {x:.72,y:.28,rx:W*.32,ry:H*.22,c:"rgba(180,60,120,.1)"},
        {x:.5, y:.5, rx:W*.5, ry:H*.18,c:"rgba(60,80,200,.09)"},
        {x:.85,y:.75,rx:W*.25,ry:H*.2, c:"rgba(120,40,200,.1)"},
        {x:.1, y:.2, rx:W*.22,ry:H*.18,c:"rgba(40,100,200,.08)"},
    ];

    blobs.forEach(b=>{
        const g = oCtx.createRadialGradient(b.x*W,b.y*H,0,b.x*W,b.y*H,Math.max(b.rx,b.ry));
        g.addColorStop(0, b.c);
        g.addColorStop(1, "transparent");
        oCtx.save();
        oCtx.scale(1, b.ry/b.rx);
        oCtx.fillStyle = g;
        oCtx.beginPath();
        oCtx.arc(b.x*W, b.y*H*(b.rx/b.ry), b.rx, 0, Math.PI*2);
        oCtx.fill();
        oCtx.restore();
    });

    // dense core glow
    const core = oCtx.createRadialGradient(W*.5,H*.55,0,W*.5,H*.55,W*.35);
    core.addColorStop(0,  "rgba(160,120,255,.12)");
    core.addColorStop(.4, "rgba(80,60,180,.07)");
    core.addColorStop(1,  "transparent");
    oCtx.fillStyle = core;
    oCtx.fillRect(0,0,W,H);
}

buildNebula();
window.addEventListener("resize",()=>{ resize(); buildNebula(); });

/* --- animation loop --- */
let t = 0;

function drawGalaxy(){
    ctx.clearRect(0,0,W,H);

    // draw nebula offscreen
    ctx.drawImage(offscreen,0,0);

    // draw stars with twinkle
    starField.forEach(s=>{
        const twinkle = .5 + .5*Math.sin(t*s.speed + s.phase);
        const alpha   = s.base * (.4 + .6*twinkle);
        const glow    = s.size > 1.2;

        if(glow){
            const g = ctx.createRadialGradient(s.x*W,s.y*H,0,s.x*W,s.y*H,s.size*3.5);
            g.addColorStop(0, `hsla(${s.hue},${s.sat}%,100%,${alpha})`);
            g.addColorStop(1, "transparent");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(s.x*W, s.y*H, s.size*3.5, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.fillStyle = `hsla(${s.hue},${s.sat}%,100%,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x*W, s.y*H, s.size, 0, Math.PI*2);
        ctx.fill();
    });

    t += .012;
    requestAnimationFrame(drawGalaxy);
}

drawGalaxy();


/* ============================================
   PER-LETTER ANIMATION HELPER
============================================ */

function animateText(el, baseDelay = 0){
    // collect child nodes, preserving <br>
    const nodes = Array.from(el.childNodes);
    el.innerHTML = "";
    let charIndex = 0;

    nodes.forEach(node=>{
        if(node.nodeType === Node.ELEMENT_NODE && node.tagName === "BR"){
            el.appendChild(document.createElement("br"));
        } else {
            const text = (node.textContent || "").trim();
            if(!text) return;
            // add a space before if needed
            if(el.childNodes.length > 0) el.appendChild(document.createTextNode(" "));
            [...text].forEach(ch=>{
                const span = document.createElement("span");
                span.className = "letter";
                span.textContent = ch === " " ? "\u00A0" : ch;
                span.style.animationDelay = (baseDelay + charIndex * 90) + "ms";
                el.appendChild(span);
                charIndex++;
            });
        }
    });

    return charIndex;
}


/* ============================================
   SCENES
============================================ */

const scenes = document.querySelectorAll(".scene");

function showScene(index){
    scenes.forEach(s => s.classList.remove("active"));
    const scene = scenes[index];
    scene.classList.add("active");

    let delay = 300;
    scene.querySelectorAll("h1,h2,h3,p,.small-title").forEach(el=>{
        const count = animateText(el, delay);
        delay += count * 90 + 400;
    });
}

showScene(0);

setTimeout(()=>{ showScene(1); }, 6000);
setTimeout(()=>{ showScene(2); }, 12000);


/* ============================================
   FLOATING PARTICLES
============================================ */

const particleContainer = document.getElementById("particles");

function createParticle(){
    const p = document.createElement("div");
    p.className = "particle";

    const size = isMobile
        ? Math.random()*2+1
        : Math.random()*3+1.5;

    // galaxy-tinted particles
    const colors = ["255,255,255","200,180,255","255,220,180","180,210,255"];
    const c = colors[Math.floor(Math.random()*colors.length)];

    p.style.cssText = `
        width:${size}px;
        height:${size}px;
        left:${Math.random()*100}vw;
        bottom:-8px;
        background:rgb(${c});
        animation-duration:${12+Math.random()*14}s;
        opacity:${Math.random()*.5+.1};
    `;

    particleContainer.appendChild(p);
    setTimeout(()=>p.remove(), 26000);
}

setInterval(createParticle, isMobile ? 800 : 300);


/* ============================================
   PARALLAX (desktop only)
============================================ */

if(!isMobile){
    document.addEventListener("mousemove",(e)=>{
        const x = (e.clientX/W - .5) * 18;
        const y = (e.clientY/H - .5) * 18;
        document.querySelector(".aurora").style.transform = `translate(${x}px,${y}px)`;
    });
}
