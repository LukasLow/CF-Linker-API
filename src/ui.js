export function serveUI() {
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Linker API - URL Shortener</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            width: 100%;
            max-width: 500px;
        }
        h1 {
            color: #333;
            margin-bottom: 8px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
            font-size: 14px;
        }
        input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.2s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        input::placeholder {
            color: #999;
        }
        .required::after {
            content: " *";
            color: #e74c3c;
        }
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .result {
            margin-top: 24px;
            padding: 20px;
            border-radius: 12px;
            display: none;
        }
        .result.success {
            display: block;
            background: #d4edda;
            border: 1px solid #c3e6cb;
        }
        .result.error {
            display: block;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
        }
        .result-title {
            font-weight: 600;
            margin-bottom: 12px;
            font-size: 14px;
        }
        .success .result-title { color: #155724; }
        .error .result-title { color: #721c24; }
        .short-url {
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .short-url code {
            flex: 1;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            color: #333;
        }
        .copy-btn {
            padding: 8px 16px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            width: auto;
        }
        .copy-btn:hover {
            background: #5a6fd6;
        }
        .copy-btn.copied {
            background: #28a745;
        }
        .info {
            margin-top: 20px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 13px;
            color: #666;
            line-height: 1.6;
        }
        .info strong {
            color: #333;
        }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-left: 10px;
            vertical-align: middle;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .footer {
            margin-top: 24px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔗 Linker API</h1>
        <p class="subtitle">URL Shortener mit automatischer Key-Generierung</p>
        
        <form id="linkForm">
            <div class="form-group">
                <label for="password" class="required">Passwort</label>
                <input type="password" id="password" placeholder="Dein Auth Password" required>
            </div>
            
            <div class="form-group">
                <label for="url" class="required">URL</label>
                <input type="url" id="url" placeholder="https://example.com" required>
            </div>
            
            <div class="form-group">
                <label for="key">Custom Key (optional)</label>
                <input type="text" id="key" placeholder="z.B. 'github' (leer = auto-generiert)">
            </div>
            
            <button type="submit" id="submitBtn">Link erstellen</button>
        </form>
        
        <div id="result" class="result">
            <div class="result-title" id="resultTitle"></div>
            <div id="resultContent"></div>
        </div>
        
        <div class="info">
            <strong>ℹ️ Hinweise:</strong><br>
            • Ohne Custom Key wird ein 6-stelliger Code generiert<br>
            • Bei Konflikten wird automatisch <code>-a</code>, <code>-b</code>, etc. angehängt<br>
            • Links laufen nach 180 Tagen automatisch ab
        </div>
        
        <div class="footer">
            Powered by Cloudflare Workers
        </div>
    </div>

    <script>
        const form = document.getElementById('linkForm');
        const result = document.getElementById('result');
        const resultTitle = document.getElementById('resultTitle');
        const resultContent = document.getElementById('resultContent');
        const submitBtn = document.getElementById('submitBtn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const url = document.getElementById('url').value;
            const key = document.getElementById('key').value;
            
            result.className = 'result';
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Wird erstellt... <span class="loading"></span>';
            
            try {
                const body = { url };
                if (key) body.key = key;
                
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
                    const shortUrl = window.location.origin + '/' + data.key;
                    
                    result.className = 'result success';
                    resultTitle.textContent = '✅ Link erstellt!';
                    resultContent.innerHTML = \`
                        <div class="short-url">
                            <code id="shortUrl">\${shortUrl}</code>
                            <button class="copy-btn" onclick="copyUrl()">Kopieren</button>
                        </div>
                    \`;
                } else {
                    result.className = 'result error';
                    resultTitle.textContent = '❌ Fehler';
                    resultContent.innerHTML = '<p>' + (data.message || 'Unbekannter Fehler') + '</p>';
                }
            } catch (error) {
                result.className = 'result error';
                resultTitle.textContent = '❌ Fehler';
                resultContent.innerHTML = '<p>' + error.message + '</p>';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Link erstellen';
            }
        });

        function copyUrl() {
            const url = document.getElementById('shortUrl').textContent;
            navigator.clipboard.writeText(url).then(() => {
                const btn = document.querySelector('.copy-btn');
                btn.textContent = 'Kopiert!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = 'Kopieren';
                    btn.classList.remove('copied');
                }, 2000);
            });
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
