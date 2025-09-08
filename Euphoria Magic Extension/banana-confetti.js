/**
 * Custom Banana Confetti Animation
 * Creates falling banana particles with physics similar to confetti
 */

class BananaConfetti {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.isActive = false;
  }

  createCanvas() {
    if (this.canvas) return;
    
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);
  }

  removeCanvas() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
  }

  drawBanana(x, y, rotation, scale, opacity) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.scale(scale, scale);
    
    // Draw banana shape
    this.ctx.beginPath();
    
    // Banana body (yellow)
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Banana curve (more realistic banana shape)
    this.ctx.fillStyle = '#FFA500';
    this.ctx.beginPath();
    this.ctx.ellipse(-2, 0, 8, 3, 0.2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Banana tip (brown)
    this.ctx.fillStyle = '#8B4513';
    this.ctx.beginPath();
    this.ctx.ellipse(10, 0, 2, 1, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Banana stem (green)
    this.ctx.fillStyle = '#228B22';
    this.ctx.beginPath();
    this.ctx.ellipse(-10, 0, 1.5, 0.8, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  createParticle(x, y, angle, velocity) {
    return {
      x: x,
      y: y,
      vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * 3, // horizontal velocity with spread
      vy: Math.sin(angle) * velocity + (Math.random() - 0.5) * 2, // vertical velocity with variation
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      scale: Math.random() * 0.6 + 0.3, // smaller size variation
      opacity: 1,
      life: 1,
      decay: Math.random() * 0.008 + 0.004, // slower fade for longer visibility
      gravity: 0.15, // lighter gravity for more floating effect
      bounce: Math.random() * 0.2 + 0.1,
      drift: (Math.random() - 0.5) * 0.02 // horizontal drift like real confetti
    };
  }

  fire(options = {}) {
    const {
      particleCount = 80, // more particles for better coverage
      origin = { x: 0.5, y: 0.5 },
      spread = 120, // wider spread angle
      colors = ['#FFD700', '#FFA500', '#FF8C00']
    } = options;

    this.createCanvas();
    
    const centerX = origin.x * window.innerWidth;
    const centerY = origin.y * window.innerHeight;
    
    // Create particles with traditional confetti spread pattern
    for (let i = 0; i < particleCount; i++) {
      // Create a wider, more natural spread pattern
      const spreadAngle = (spread * Math.PI / 180);
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadAngle; // upward with spread
      const velocity = Math.random() * 12 + 8; // higher initial velocity
      
      const particle = this.createParticle(centerX, centerY, angle, velocity);
      this.particles.push(particle);
    }
    
    if (!this.isActive) {
      this.isActive = true;
      this.animate();
    }
  }

  animate() {
    if (!this.ctx || !this.canvas) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update physics with more realistic confetti motion
      particle.vy += particle.gravity;
      particle.vx += particle.drift; // horizontal drift
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;
      
      // Air resistance for more realistic motion
      particle.vx *= 0.998;
      particle.vy *= 0.998;
      
      // Update life
      particle.life -= particle.decay;
      particle.opacity = Math.max(0, particle.life);
      
      // Bounce off bottom with less energy loss
      if (particle.y > window.innerHeight - 10) {
        particle.y = window.innerHeight - 10;
        particle.vy *= -particle.bounce;
        particle.vx *= 0.9; // less friction
      }
      
      // Remove particles that are off-screen or dead
      if (particle.life <= 0 || particle.x < -100 || particle.x > window.innerWidth + 100 || particle.y > window.innerHeight + 50) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Draw banana
      this.drawBanana(
        particle.x,
        particle.y,
        particle.rotation,
        particle.scale,
        particle.opacity
      );
    }
    
    // Continue animation if particles exist
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.stop();
    }
  }

  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Clean up after a delay
    setTimeout(() => {
      if (this.particles.length === 0) {
        this.removeCanvas();
      }
    }, 1000);
  }

  reset() {
    this.particles = [];
    this.stop();
    this.removeCanvas();
  }
}

// Create global instance
window.bananaConfetti = new BananaConfetti();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BananaConfetti;
}