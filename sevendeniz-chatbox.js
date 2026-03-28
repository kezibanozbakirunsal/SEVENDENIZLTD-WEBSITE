(function () {
  const PROXY_URL = 'https://sevendeniz-ai-proxy.kezibanozbakirunsal.workers.dev';

  const style = document.createElement('style');
  style.textContent = `
    #sz-chat-btn{position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;background:#1a1a2e;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.18);transition:transform 0.2s}
    #sz-chat-btn:hover{transform:scale(1.08)}
    #sz-chat-btn svg{width:26px;height:26px;fill:#fff}
    #sz-chat-window{position:fixed;bottom:92px;right:24px;z-index:9998;width:340px;max-height:520px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15);display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    #sz-chat-window.open{display:flex}
    #sz-chat-header{background:#1a1a2e;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}
    #sz-chat-header .avatar{width:36px;height:36px;border-radius:50%;background:#2e4057;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;color:#fff;flex-shrink:0}
    #sz-chat-header .info{flex:1}
    #sz-chat-header .name{font-size:14px;font-weight:600}
    #sz-chat-header .status{font-size:11px;opacity:0.7;margin-top:1px}
    #sz-chat-header .close-btn{background:none;border:none;color:#fff;cursor:pointer;font-size:20px;line-height:1;padding:0;opacity:0.7}
    #sz-chat-header .close-btn:hover{opacity:1}
    #sz-chat-messages{flex:1;overflow-y:auto;padding:14px 14px 8px;display:flex;flex-direction:column;gap:10px;background:#f8f8f8}
    .sz-msg{max-width:82%;padding:9px 13px;border-radius:14px;font-size:13.5px;line-height:1.5;word-break:break-word}
    .sz-msg.bot{background:#fff;color:#1a1a2e;align-self:flex-start;border:1px solid #e8e8e8;border-bottom-left-radius:4px}
    .sz-msg.user{background:#1a1a2e;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
    .sz-msg.typing{background:#fff;border:1px solid #e8e8e8;align-self:flex-start}
    .sz-dots{display:flex;gap:4px;align-items:center;padding:2px 0}
    .sz-dots span{width:7px;height:7px;border-radius:50%;background:#999;animation:sz-bounce 1.2s infinite}
    .sz-dots span:nth-child(2){animation-delay:0.2s}
    .sz-dots span:nth-child(3){animation-delay:0.4s}
    @keyframes sz-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
    #sz-chat-footer{padding:10px 12px;background:#fff;border-top:1px solid #eee;display:flex;gap:8px;align-items:flex-end}
    #sz-chat-input{flex:1;border:1px solid #ddd;border-radius:20px;padding:8px 14px;font-size:13.5px;resize:none;outline:none;max-height:80px;line-height:1.5;font-family:inherit;color:#1a1a2e;background:#f8f8f8}
    #sz-chat-input:focus{border-color:#1a1a2e;background:#fff}
    #sz-send-btn{width:36px;height:36px;border-radius:50%;border:none;background:#1a1a2e;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.2s}
    #sz-send-btn:hover{background:#2e4057}
    #sz-send-btn svg{width:16px;height:16px;fill:#fff}
    #sz-quick-btns{padding:6px 12px 4px;background:#fff;display:flex;flex-wrap:wrap;gap:6px}
    .sz-quick{font-size:12px;padding:5px 11px;border-radius:20px;border:1px solid #ccc;background:#fff;cursor:pointer;color:#1a1a2e;transition:background 0.15s;font-family:inherit;white-space:nowrap}
    .sz-quick:hover{background:#f0f0f0}
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
    <button id="sz-chat-btn" aria-label="Open chat">
      <svg viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V10h12v2zm0-3H6V7h12v2z"/></svg>
    </button>
    <div id="sz-chat-window">
      <div id="sz-chat-header">
        <div class="avatar">SD</div>
        <div class="info">
          <div class="name">SEVENDENIZ Assistant</div>
          <div class="status">Online — usually replies instantly</div>
        </div>
        <button class="close-btn" id="sz-close-btn">&#x2715;</button>
      </div>
      <div id="sz-chat-messages"></div>
      <div id="sz-quick-btns">
        <button class="sz-quick" data-q="What services do you offer?">Services</button>
        <button class="sz-quick" data-q="What areas do you cover?">Coverage</button>
        <button class="sz-quick" data-q="How do I get a quote?">Get a quote</button>
        <button class="sz-quick" data-q="Do you assemble IKEA furniture?">IKEA assembly</button>
      </div>
      <div id="sz-chat-footer">
        <textarea id="sz-chat-input" rows="1" placeholder="Type a message..."></textarea>
        <button id="sz-send-btn" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  `);

  const btn = document.getElementById('sz-chat-btn');
  const win = document.getElementById('sz-chat-window');
  const closeBtn = document.getElementById('sz-close-btn');
  const input = document.getElementById('sz-chat-input');
  const sendBtn = document.getElementById('sz-send-btn');
  const messages = document.getElementById('sz-chat-messages');
  const quickBtns = document.querySelectorAll('.sz-quick');

  const history = [
    { role: 'user', content: 'SYSTEM INSTRUCTIONS: You are a friendly assistant for SEVENDENIZ LIMITED, a Manchester-based interior design company. Location: Manchester City Centre, M4 4EF. Phone/WhatsApp: +44 7884 110661. Email: info@sevendenizuk@gmail.com. Hours: Monday to Saturday 09:00-18:00. Services: 1) Fitted Wardrobes and Dressing Rooms - made to measure for any space. 2) TV Units and Media Walls - modern units with hidden cable management. 3) Kitchen Cabinets and Utility Areas - installation and upgrades. 4) IKEA and Flat-Pack Assembly - professional assembly and mounting. For quotes direct to WhatsApp: https://wa.me/447884110661. Keep answers short, warm and helpful. Never invent prices.' },
    { role: 'assistant', content: 'Understood! I am the SEVENDENIZ assistant.' }
  ];

  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = 'sz-msg ' + type;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'sz-msg typing';
    div.innerHTML = '<div class="sz-dots"><span></span><span></span><span></span></div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function setInputEnabled(enabled) {
    input.disabled = !enabled;
    sendBtn.disabled = !enabled;
    sendBtn.style.opacity = enabled ? '1' : '0.5';
  }

  async function sendMessage(text) {
    text = text.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';
    input.style.height = 'auto';
    setInputEnabled(false);

    history.push({ role: 'user', content: text });

    const typingEl = showTyping();

    try {
      const res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
messages: history
        })
      });

      typingEl.remove();

      if (!res.ok) {
        addMessage('Sorry, something went wrong. Please try again.', 'bot');
        history.pop();
      } else {
        const data = await res.json();
        const reply = data.content[0].text;
        addMessage(reply, 'bot');
        history.push({ role: 'assistant', content: reply });
      }
    } catch (err) {
      typingEl.remove();
      addMessage('Sorry, I could not connect. Please try again.', 'bot');
      history.pop();
    }

    setInputEnabled(true);
    input.focus();
  }

  btn.addEventListener('click', function () {
    win.classList.toggle('open');
    if (win.classList.contains('open') && messages.children.length === 0) {
      addMessage('Hi! How can I help you today?', 'bot');
    }
  });

  closeBtn.addEventListener('click', function () {
    win.classList.remove('open');
  });

  sendBtn.addEventListener('click', function () {
    sendMessage(input.value);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });

  input.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });

  quickBtns.forEach(function (qBtn) {
    qBtn.addEventListener('click', function () {
      sendMessage(this.getAttribute('data-q'));
    });
  });
})();
