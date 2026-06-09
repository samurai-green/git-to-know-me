import React, { useEffect, useRef } from 'react';

const TYPES = { ROCK: 'ROCK', PAPER: 'PAPER', SCISSORS: 'SCISSORS' };
const BEATS = { [TYPES.ROCK]: TYPES.SCISSORS, [TYPES.PAPER]: TYPES.ROCK, [TYPES.SCISSORS]: TYPES.PAPER };
const COLORS = { [TYPES.ROCK]: '#f87171', [TYPES.PAPER]: '#38bdf8', [TYPES.SCISSORS]: '#a3e635' }; // Red, Blue, Lime

const BOID_COUNT = 150; // Increased count
const SPEED = 1.5;
const PERCEPTION_RADIUS = 50;

class Boid {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * SPEED * 2;
    this.vy = (Math.random() - 0.5) * SPEED * 2;
    this.type = Object.values(TYPES)[Math.floor(Math.random() * 3)];
    this.color = COLORS[this.type];
    this.width = 4; // Rectangular
    this.height = 1.5;
  }

  update(width, height, boids) {
    // Basic flocking/interaction logic
    let steeringX = 0;
    let steeringY = 0;

    for (let other of boids) {
      if (other === this) continue;
      
      const dist = Math.hypot(this.x - other.x, this.y - other.y);
      if (dist < PERCEPTION_RADIUS) {
        if (BEATS[this.type] === other.type) {
          // Predator: Move towards prey
          steeringX += (other.x - this.x) * 0.05;
          steeringY += (other.y - this.y) * 0.05;
        } else if (BEATS[other.type] === this.type) {
          // Prey: Flee predator
          steeringX -= (other.x - this.x) * 0.05;
          steeringY -= (other.y - this.y) * 0.05;
        } else {
          // Cohesion (Same type): Move together
          steeringX += (other.x - this.x) * 0.001;
          steeringY += (other.y - this.y) * 0.001;
        }
      }
    }

    this.vx += steeringX * 0.1;
    this.vy += steeringY * 0.1;
    
    // Cap speed
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > SPEED) {
      this.vx = (this.vx / speed) * SPEED;
      this.vy = (this.vy / speed) * SPEED;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Boundary wrap
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw(ctx) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0; // Reset
  }
}

export default function RockPaperScissorsBoids() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight;
    
    const boids = Array.from({ length: BOID_COUNT }, () => new Boid(width, height));

    let animationFrameId;

    const render = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);
      for (let boid of boids) {
        boid.update(width, height, boids);
        boid.draw(ctx);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
