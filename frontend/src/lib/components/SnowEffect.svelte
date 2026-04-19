<script>
  import { onMount } from 'svelte';
  
  let canvas;
  let ctx;
  let snowflakes = [];
  let animationId;
  
  class Snowflake {
    constructor() {
      this.reset();
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speed = Math.random() * 1 + 0.5;
      this.sway = Math.random() * 2 - 1;
      this.swaySpeed = Math.random() * 0.02 + 0.01;
      this.opacity = Math.random() * 0.5 + 0.3;
    }
    
    update() {
      this.y += this.speed;
      this.x += Math.sin(this.y * this.swaySpeed) * 0.5;
      
      if (this.y > canvas.height) {
        this.reset();
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.fill();
    }
  }
  
  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    snowflakes.forEach(flake => {
      flake.update();
      flake.draw();
    });
    
    animationId = requestAnimationFrame(animate);
  }
  
  onMount(() => {
    ctx = canvas.getContext('2d');
    resize();
    
    // Create 150 snowflakes
    for (let i = 0; i < 150; i++) {
      snowflakes.push(new Snowflake());
    }
    
    animate();
    
    window.addEventListener('resize', resize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  });
</script>

<canvas bind:this={canvas} class="snow-canvas"></canvas>

<style>
  .snow-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }
</style>
