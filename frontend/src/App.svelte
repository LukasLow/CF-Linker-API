<script>
  import SnowEffect from './lib/components/SnowEffect.svelte';
  import LinkForm from './lib/components/LinkForm.svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
</script>

<SnowEffect />

<main>
  <div class="gradient-bg"></div>
  
  <div class="content" in:fly={{ y: 30, duration: 800, easing: quintOut }}>
    <div class="card">
      <div class="header">
        <div class="logo">
          <span class="link-icon">🔗</span>
          <span class="pulse"></span>
        </div>
        <h1>echter.link</h1>
        <p class="subtitle">Der echte Link Shortener</p>
      </div>
      
      <LinkForm />
      
      <div class="footer">
        <div class="info-badges">
          <span class="badge">⚡ Schnell</span>
          <span class="badge">🎨 Cyan</span>
          <span class="badge">📱 Responsive</span>
        </div>
        <p class="powered-by">Powered by Cloudflare Workers</p>
      </div>
    </div>
  </div>
</main>

<style>
  :global(:root) {
    --primary: #06b6d4;
    --primary-dark: #0891b2;
    --secondary: #ef4444;
    --secondary-light: #f87171;
    --bg: #000000;
    --card-bg: #0a0a0a;
  }
  
  main {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    background: #000000;
  }
  
  .gradient-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(ellipse at top, rgba(6, 182, 212, 0.25) 0%, transparent 50%),
      radial-gradient(ellipse at bottom, rgba(239, 68, 68, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at left, rgba(6, 182, 212, 0.1) 0%, transparent 40%);
    z-index: 0;
    animation: gradientShift 15s ease-in-out infinite;
  }
  
  @keyframes gradientShift {
    0%, 100% {
      transform: scale(1) rotate(0deg);
    }
    50% {
      transform: scale(1.1) rotate(2deg);
    }
  }
  
  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 480px;
  }
  
  .card {
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(6, 182, 212, 0.2);
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.8),
      0 0 100px rgba(6, 182, 212, 0.15);
  }
  
  .header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .logo {
    position: relative;
    display: inline-block;
    margin-bottom: 1rem;
  }
  
  .link-icon {
    font-size: 3rem;
    display: block;
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(5deg); }
  }
  
  .pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
  }
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.95rem;
  }
  
  .footer {
    margin-top: 2rem;
    text-align: center;
  }
  
  .info-badges {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  
  .badge {
    padding: 0.4rem 0.8rem;
    background: rgba(6, 182, 212, 0.15);
    border: 1px solid rgba(6, 182, 212, 0.2);
    border-radius: 20px;
    font-size: 0.75rem;
    color: rgba(6, 182, 212, 0.9);
  }
  
  .powered-by {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.3);
  }
  
  @media (max-width: 480px) {
    .card {
      padding: 1.5rem;
    }
    
    h1 {
      font-size: 1.5rem;
    }
  }
</style>
