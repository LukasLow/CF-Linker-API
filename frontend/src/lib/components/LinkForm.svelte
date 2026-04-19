<script>
  import { slide, fade, scale } from 'svelte/transition';
  import { quintOut, elasticOut } from 'svelte/easing';
  
  let password = '';
  let url = '';
  let customKey = '';
  let useCustomKey = false;
  let loading = false;
  let result = null;
  let copied = false;
  
  function normalizeUrl(inputUrl) {
    // Wenn URL schon :// enthält, ist sie vollständig
    if (inputUrl.includes('://')) {
      return inputUrl;
    }
    // Sonst https:// voranstellen
    return 'https://' + inputUrl;
  }
  
  function getFullDomain() {
    // Vollständige Domain mit https://
    return 'https://' + window.location.host;
  }
  
  async function handleSubmit() {
    loading = true;
    result = null;
    
    try {
      // URL normalisieren
      const normalizedUrl = normalizeUrl(url);
      
      const body = { url: normalizedUrl };
      if (useCustomKey && customKey) body.key = customKey;
      
      const response = await fetch('/create', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + password,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Vollständige URL mit https://
        const shortUrl = getFullDomain() + '/' + data.key;
        result = { success: true, shortUrl, key: data.key };
      } else {
        result = { success: false, message: data.message || 'Unbekannter Fehler' };
      }
    } catch (error) {
      result = { success: false, message: error.message };
    } finally {
      loading = false;
    }
  }
  
  async function copyUrl() {
    if (!result?.shortUrl) {
      console.error('No URL to copy');
      return;
    }
    
    const textToCopy = result.shortUrl;
    
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        copied = true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          copied = true;
        } else {
          throw new Error('execCommand failed');
        }
      }
      
      // Reset copied state after 2 seconds
      setTimeout(() => copied = false, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Show error feedback
      alert('Konnte nicht kopieren. Bitte manuell kopieren: ' + textToCopy);
    }
  }
  
  function reset() {
    result = null;
    url = '';
    customKey = '';
    useCustomKey = false;
  }
</script>

<div class="form-container">
  <form on:submit|preventDefault={handleSubmit}>
    <!-- URL Input (Hauptfeld) -->
    <div class="url-box-main" class:focused={url}>
      <div class="url-icon">🔗</div>
      <input 
        type="url" 
        id="url"
        bind:value={url}
        required
        placeholder="Gib deine URL ein..."
      />
    </div>
    
    <!-- Password Input -->
    <div class="input-group" class:filled={password}>
      <input 
        type="password" 
        id="password"
        bind:value={password}
        required
        placeholder=" "
      />
      <label for="password">🔐 Passwort *</label>
    </div>
    
    <!-- Toggle für Custom Key -->
    <div class="toggle-container">
      <button 
        type="button" 
        class="toggle-btn" 
        class:active={useCustomKey}
        on:click={() => useCustomKey = !useCustomKey}
      >
        <span class="toggle-slider" class:on={useCustomKey}></span>
        <span class="toggle-label">
          {useCustomKey ? '🎨 Custom Key an' : '✨ Custom Key?'}
        </span>
      </button>
    </div>
    
    <!-- Custom Key Input (nur wenn Toggle an) -->
    {#if useCustomKey}
      <div 
        class="input-group custom-key-group" 
        class:filled={customKey}
        transition:slide={{ duration: 300, easing: quintOut }}
      >
        <input 
          type="text" 
          id="key"
          bind:value={customKey}
          placeholder=" "
          maxlength="20"
        />
        <label for="key">🏷️ Dein Custom Key</label>
        <span class="hint">z.B. "mylink" oder "promo2024"</span>
      </div>
    {/if}
    
    <button type="submit" class="submit-btn" disabled={loading}>
      {#if loading}
        <span class="spinner"></span>
        <span>Wird erstellt...</span>
      {:else}
        <span>🚀 Link erstellen</span>
      {/if}
    </button>
  </form>
  
  {#if result}
    <div 
      class="result {result.success ? 'success' : 'error'}"
      in:fade={{ duration: 200 }}
    >
      {#if result.success}
        <div class="success-content">
          <div class="success-icon">🎉</div>
          <h3>Link erstellt!</h3>
          <div class="result-box">
            <a href={result.shortUrl} target="_blank" rel="noopener" class="short-link">
              <span class="link-emoji">🔗</span>
              <span class="link-text">{result.shortUrl}</span>
            </a>
            <button class="copy-btn" on:click={copyUrl} class:copied>
              {copied ? '✅ Kopiert!' : '📋 Kopieren'}
            </button>
            <div class="qr-section">
              <p class="qr-label">📱 Oder scanne den QR-Code:</p>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(result.shortUrl)}`}
                alt="QR Code"
                class="qr-code"
              />
            </div>
          </div>
          <button class="reset-btn" on:click={reset}>➕ Neuen Link erstellen</button>
        </div>
      {:else}
        <div class="error-content">
          <div class="error-icon">😕</div>
          <h3>Oops!</h3>
          <p>{result.message}</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .form-container {
    width: 100%;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .input-group {
    position: relative;
  }
  
  input {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  input:focus {
    outline: none;
    border-color: #06b6d4;
    background: rgba(255, 255, 255, 0.15);
  }
  
  input::placeholder {
    color: transparent;
  }
  
  label {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.6);
    font-size: 1rem;
    pointer-events: none;
    transition: all 0.3s ease;
  }
  
  input:focus + label,
  input:not(:placeholder-shown) + label,
  .filled label {
    top: -0.6rem;
    left: 0.8rem;
    font-size: 0.75rem;
    color: #06b6d4;
    background: var(--bg);
    padding: 0 0.4rem;
  }
  
  .submit-btn {
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
  }
  
  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .result {
    margin-top: 1.5rem;
    padding: 1.5rem;
    border-radius: 16px;
    animation: glow 2s ease-in-out infinite alternate;
  }
  
  @keyframes glow {
    from {
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
    }
    to {
      box-shadow: 0 0 30px rgba(6, 182, 212, 0.5);
    }
  }
  
  .result.success {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%);
    border: 1px solid rgba(6, 182, 212, 0.3);
  }
  
  .result.error {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(248, 113, 113, 0.2) 100%);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  
  .success-content, .error-content {
    text-align: center;
  }
  
  .success-icon, .error-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    animation: bounce 1s ease infinite;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  .success-content h3 {
    color: #06b6d4;
    margin-bottom: 1rem;
  }
  
  .error-content h3 {
    color: #ef4444;
    margin-bottom: 0.5rem;
  }
  
  .url-box {
    display: flex;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.75rem;
    border-radius: 10px;
    margin: 1rem 0;
    align-items: center;
  }
  
  .url-box code {
    flex: 1;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9rem;
    color: #67e8f9;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .copy-btn {
    padding: 0.5rem 1rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  
  .copy-btn:hover {
    background: #5a6fd6;
  }
  
  .copy-btn.copied {
    background: #10b981;
  }
  
  .reset-btn {
    margin-top: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .reset-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  /* Neue coole URL Box */
  .url-box-main {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(8, 145, 178, 0.2) 100%);
    border: 2px solid rgba(6, 182, 212, 0.3);
    border-radius: 16px;
    transition: all 0.3s ease;
  }
  
  .url-box-main:focus-within,
  .url-box-main.focused {
    border-color: #06b6d4;
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
    transform: scale(1.02);
  }
  
  .url-icon {
    font-size: 1.5rem;
    animation: wiggle 2s ease-in-out infinite;
  }
  
  @keyframes wiggle {
    0%, 100% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
  }
  
  .url-box-main input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 0;
    font-size: 1rem;
  }
  
  .url-box-main input:focus {
    background: transparent;
    outline: none;
  }
  
  .url-box-main input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  /* Toggle Switch Styles */
  .toggle-container {
    display: flex;
    justify-content: center;
  }
  
  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
  }
  
  .toggle-btn.active {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(8, 145, 178, 0.3) 100%);
    border-color: #06b6d4;
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
  }
  
  .toggle-slider {
    width: 44px;
    height: 24px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .toggle-slider::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .toggle-slider.on {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  }
  
  .toggle-slider.on::after {
    transform: translateX(20px);
  }
  
  .toggle-label {
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  /* Custom Key Group */
  .custom-key-group {
    animation: slideDown 0.3s ease;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .custom-key-group input {
    border-color: #06b6d4;
    background: rgba(6, 182, 212, 0.1);
  }
  
  .hint {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    padding-left: 0.5rem;
  }
  
  /* Enhanced Submit Button */
  .submit-btn {
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #06b6d4 100%);
    background-size: 200% 200%;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    animation: gradientMove 3s ease infinite;
  }
  
  @keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(6, 182, 212, 0.5);
  }
  
  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    animation: none;
  }
  
  /* Enhanced Result Box */
  .result-box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
    padding: 1rem;
    border-radius: 12px;
    margin: 1rem 0;
    border: 1px solid rgba(6, 182, 212, 0.2);
  }
  
  .short-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(6, 182, 212, 0.1);
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s ease;
    margin-bottom: 0.75rem;
    cursor: pointer;
  }
  
  .short-link:hover {
    background: rgba(6, 182, 212, 0.2);
    border-color: rgba(6, 182, 212, 0.5);
    transform: translateY(-1px);
  }
  
  .link-emoji {
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  .link-text {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9rem;
    color: #67e8f9;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    user-select: all;
    -webkit-user-select: all;
    cursor: text;
  }
  
  .copy-btn {
    padding: 0.75rem 1.2rem;
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    position: relative;
    z-index: 10;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }
  
  .copy-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(6, 182, 212, 0.4);
  }
  
  .copy-btn:active {
    transform: translateY(0);
  }
  
  .copy-btn.copied {
    background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  }
  
  .qr-section {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(6, 182, 212, 0.2);
    text-align: center;
  }
  
  .qr-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 0.5rem;
  }
  
  .qr-code {
    width: 150px;
    height: 150px;
    border-radius: 8px;
    background: white;
    padding: 8px;
  }
  
  .reset-btn {
    margin-top: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }
  
  .reset-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.02);
  }
</style>
