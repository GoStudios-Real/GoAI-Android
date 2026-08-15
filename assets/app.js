/* GoAI main app - wiring, voice, composer */
(function () {
  const A = window.GoApp;
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('sendBtn');
  const micBtn = document.getElementById('micBtn');
  const clearBtn = document.getElementById('newChat');
  const chatsBtn = document.getElementById('chatsBtn');
  const soundToggle = document.getElementById('toggleSound');
  const voiceToggle = document.getElementById('toggleVoice');
  const ultraToggle = document.getElementById('toggleUltra');
  const beep = name => window.GoSoundOS && window.GoSoundOS.play(name);

  A.ultra = false;
  A.voiceOn = false;
  A.history = [];

  /* ---------- token bank ---------- */
  const TOKEN_KEY = 'goai_tokens';
  const MEM_KEY = 'goai_memory';
  A.tokens = parseInt(localStorage.getItem(TOKEN_KEY) || '999999999999', 10);
  A.memory = { name: '', prefs: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(MEM_KEY) || '{}');
    if (saved && typeof saved === 'object') {
      A.memory.name = saved.name || '';
      A.memory.prefs = Array.isArray(saved.prefs) ? saved.prefs : [];
    }
  } catch (e) {}
  A.saveMemory = function () {
    try { localStorage.setItem(MEM_KEY, JSON.stringify(A.memory)); } catch (e) {}
  };
  A.tokensEl = document.getElementById('chipTokens');
  A.refreshTokens = function () {
    A.tokensEl.textContent = '\u26A1 ' + A.tokens.toLocaleString() + ' tokens';
    A.tokensEl.classList.toggle('low', A.tokens < 100000);
    A.tokensEl.classList.toggle('zero', A.tokens <= 0);
  };
  A.spendToken = function (n) {
    A.tokens -= (n || 1);
    try { localStorage.setItem(TOKEN_KEY, String(A.tokens)); } catch (e) {}
    A.refreshTokens();
    if (A.tokens <= 0) A.toast('Token balance depleted!');
  };
  A.refreshTokens();

  /* ---------- AI models ---------- */
  const MODELS = [
    { id: 'g1', name: 'GoAI 1.5', tag: 'Starter', cost: 1, tier: 1, color: '#22c55e', desc: 'Fast and simple answers' },
    { id: 'g2', name: 'GoAI 2.3', tag: 'Smart', cost: 2, tier: 2, color: '#06b6d4', desc: 'Quick smart answers' },
    { id: 'g3', name: 'GoAI 3.1', tag: 'Pro', cost: 3, tier: 3, color: '#7c3aed', desc: 'Balanced intelligence' },
    { id: 'g4', name: 'GoAI 4.7', tag: 'Genius', cost: 5, tier: 4, color: '#ec4899', desc: 'Deep reasoning' },
    { id: 'g5', name: 'GoAI 5.9', tag: 'Super-Intellect', cost: 10, tier: 5, color: '#f59e0b', desc: 'The smartest GoAI ever' }
  ];
  A.models = MODELS;
  A.model = MODELS.find(m => m.id === localStorage.getItem('goai_model')) || MODELS[2];
  const modelSelect = document.getElementById('modelSelect');
  MODELS.forEach(m => {
    const o = document.createElement('option');
    o.value = m.id;
    o.textContent = m.name + ' - ' + m.tag + ' (' + m.cost + ' tok)';
    if (m.id === A.model.id) o.selected = true;
    modelSelect.appendChild(o);
  });
  A.setModel = function (id) {
    const next = MODELS.find(m => m.id === id);
    if (!next) return;
    A.model = next;
    try { localStorage.setItem('goai_model', next.id); } catch (e) {}
    refreshModelChip();
    beep('select');
    A.toast('Model set: ' + next.name + ' (' + next.tag + ') - ' + next.cost + ' tokens per message');
  };
  A.modelChip = document.getElementById('chipModel');
  function refreshModelChip() {
    A.modelChip.innerHTML = '<span class="dot" style="background:' + A.model.color + ';box-shadow:0 0 8px ' + A.model.color + '"></span> ' + A.model.name + ' &middot; ' + A.model.cost + ' tok';
    A.modelChip.style.borderColor = A.model.color;
  }
  modelSelect.onchange = function () { A.setModel(modelSelect.value); };
  refreshModelChip();

  /* ---------- chat persistence ---------- */
  const CHAT_KEY = 'goai_chats';
  A.chats = [];
  try { A.chats = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); } catch (e) {}
  A.chatId = null;
  A.saveChats = function () {
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(A.chats.slice(0, 40))); } catch (e) {}
  };
  A.onMessage = function (role, text) {
    if (!A.chatId) return;
    const c = A.chats.find(x => x.id === A.chatId);
    if (!c) return;
    c.msgs.push({ role: role, text: text });
    if (c.msgs.length > 200) c.msgs = c.msgs.slice(-200);
    c.time = Date.now();
    if (!c.title && role === 'user') c.title = text.slice(0, 42);
    A.saveChats();
  };

  /* ---------- voice output ---------- */
  const V = window.GoVoice = {};
  V.say = function (text) {
    if (!A.voiceOn) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    const clean = String(text).replace(/\*\*/g, '').replace(/`/g, '').replace(/[#>_\n]+/g, ' ').slice(0, 400);
    synth.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 1.05;
    u.pitch = 1.05;
    synth.speak(u);
  };

  /* ---------- voice input ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  V.startListening = function () {
    if (micBtn.classList.contains('listening')) { V.stopListening(); return; }
    if (!SR) { A.toast('Voice input is not supported in this browser.'); return; }
    try { rec = new SR(); } catch (e) { rec = null; }
    if (!rec) { A.toast('Could not start the microphone.'); return; }
    rec.lang = 'en-US';
    rec.interimResults = false;
    micBtn.classList.add('listening');
    micBtn.title = 'Listening... say something';
    beep('voicestart');
    A.toast('Listening... speak now.');
    rec.onresult = function (e) {
      const said = e.results[0][0].transcript;
      input.value = said;
      V.stopListening();
      GoAsk.send();
    };
    rec.onerror = function (e) {
      V.stopListening();
      A.toast('Mic issue: ' + (e.error || 'unknown'));
    };
    rec.onend = function () { micBtn.classList.remove('listening'); };
    try { rec.start(); } catch (e) { rec = null; }
  };
  V.stopListening = function () {
    if (rec) { try { rec.stop(); } catch (e) {} rec = null; }
    micBtn.classList.remove('listening');
    beep('voicestop');
  };

  micBtn.onclick = function () { V.startListening(); };

  /* ---------- composer ---------- */
  function autoGrow() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 150) + 'px';
  }
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); GoAsk.send(); }
  });
  sendBtn.onclick = function () { GoAsk.send(); };

  /* ---------- brain calls ---------- */
  window.GoAsk = {
    send: async function () {
      const text = input.value.replace(/\s+$/, '');
      if (!text) { A.toast('Type a message first.'); return; }
      input.value = '';
      autoGrow();
      if (!A.chatId) {
        const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        A.chats.unshift({ id: id, title: text.slice(0, 42), time: Date.now(), msgs: [] });
        A.chatId = id;
      }
      A.history.push(text);
      A.spendToken(A.model.cost);
      A.msg('user', text);
      beep('send');
      A.typingOn();
      A.scroll();
      let reply;
      try {
        reply = await window.GoBrain.handle(text);
      } catch (e) {
        reply = 'GoAI hit a hiccup and recovered. Please retry.';
      }
      if (!reply) reply = 'I could not process that yet. Try asking for the time, weather, an image, or some code.';
      A.typingOff();
      A.msg('ai', reply);
      V.say(reply);
      if (/help|what can you do/.test(text.toLowerCase())) {
        A.suggestions(['Generate an image of a dragon', 'Write me a calculator', 'Set a timer for 1 minute', 'Tell me a joke', 'Play an error sound']);
      }
      beep('message');
      A.scroll();
    }
  };

  /* ---------- quick actions ---------- */
  document.querySelectorAll('.qa').forEach(function (btn) {
    btn.onclick = function () {
      const action = btn.getAttribute('data-cmd');
      if (action === 'suggest:voice') { V.startListening(); return; }
      const map = {
        'suggest:image': 'Generate an image of a glowing dragon',
        'suggest:code': 'Write me a calculator',
        'suggest:weather': 'Weather in London',
        'suggest:timer': 'Set a timer for 2 minutes',
        'suggest:research': 'Research the history of the internet',
        'suggest:story': 'Tell me a story about a space explorer',
        'suggest:time': 'What is the time?',
        'suggest:addcity': 'add city London',
        'suggest:ttt': 'tic tac toe',
        'suggest:rps': 'rock paper scissors',
        'suggest:guess': 'guess the number',
        'suggest:trivia': 'trivia',
        'suggest:coin': 'flip a coin'
      };
      input.value = map[action] || action;
      GoAsk.send();
    };
  });

  /* ---------- sound buttons ---------- */
  document.querySelectorAll('.sound-btn').forEach(function (b) {
    b.onclick = function () { window.GoSoundOS.play(b.getAttribute('data-sound')); };
  });

  /* ---------- toggles ---------- */
  soundToggle.onchange = function () {
    window.GoSoundOS.enabled = soundToggle.checked;
    beep('confirm');
  };
  voiceToggle.onchange = function () {
    A.voiceOn = voiceToggle.checked;
    if (A.voiceOn) V.say('Voice replies are now on. Hello!');
  };
  ultraToggle.onchange = function () {
    A.ultra = ultraToggle.checked;
    beep(ultraToggle.checked ? 'success' : 'clear');
    A.toast(ultraToggle.checked ? 'Super Mind Mode: ON' : 'Super Mind Mode: OFF');
  };

  const arcadeToggle = document.getElementById('toggleArcade');
  try { arcadeToggle.checked = localStorage.getItem('goai_arcade') === '1'; } catch (e) {}
  if (arcadeToggle.checked) document.body.classList.add('arcade');
  arcadeToggle.onchange = function () {
    const on = arcadeToggle.checked;
    document.body.classList.toggle('arcade', on);
    try { localStorage.setItem('goai_arcade', on ? '1' : '0'); } catch (e) {}
    beep(on ? 'level' : 'clear');
    A.toast(on ? 'Arcade Mode: ON - GoConsoleOS' : 'Arcade Mode: OFF');
  };

  clearBtn.onclick = function () { startNewChat(); };

  /* ---------- location ---------- */
  const locBtn = document.getElementById('allowLoc');
  const locChip = document.getElementById('locChip');

  A.location = { lat: null, lon: null, name: 'your location', source: null };
  A.getLocation = function () {
    return A.location.lat != null ? A.location : null;
  };

  function ipGeo() {
    return fetch('https://ip-api.com/json')
      .then(r => r.json())
      .then(j => {
        if (j && j.status === 'success' && j.lat != null) {
          return { lat: j.lat, lon: j.lon, name: (j.city || '') + (j.city && j.country ? ', ' : '') + (j.country || 'unknown'), source: 'IP' };
        }
        throw new Error('ip failed');
      });
  }

  function updateLocUI() {
    const st = A.location;
    if (st.lat != null) {
      locBtn.classList.add('on');
      locBtn.classList.remove('working');
      locChip.innerHTML = '<span class="dot dot-green"></span> location: on (' + st.source + ')';
      locChip.title = st.name;
    } else {
      locBtn.classList.remove('on', 'working');
      locChip.innerHTML = '<span class="dot"></span> location: off';
      locChip.title = '';
    }
  }

  async function allowLocation() {
    if (locBtn.classList.contains('working')) return;
    locBtn.classList.add('working');
    beep('voicestart');
    A.typingOn();
    A.scroll();

    const isFile = window.location && window.location.protocol === 'file:';
    const isEdge = /Edg\//.test(navigator.userAgent || '');
    const gpsBlocked = !navigator.geolocation || isFile;

    try {
      if (!gpsBlocked) {
        const coords = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(
            p => res(p.coords),
            e => rej(new Error(e.message || 'denied')),
            { timeout: 8000, maximumAge: 600000, enableHighAccuracy: false }
          );
        });
        A.location.lat = coords.latitude;
        A.location.lon = coords.longitude;
        A.location.name = 'your exact location';
        A.location.source = 'GPS';
        A.toast('Location allowed!');
      } else {
        throw new Error('gps skipped');
      }
    } catch (err) {
      try {
        const g = await ipGeo();
        A.location.lat = g.lat;
        A.location.lon = g.lon;
        A.location.name = g.name;
        A.location.source = 'IP';
        A.toast((isEdge ? 'Microsoft Edge ' : '') + 'location set via IP: ' + g.name);
      } catch (e2) {
        A.location.lat = null;
        A.location.lon = null;
        A.toast('Could not get your location. Try a city instead.');
      }
    }

    A.typingOff();
    updateLocUI();
    beep('success');
    const st = A.location;
    if (st.lat != null) {
      A.msg('ai', 'Location enabled: **' + st.name + '**. Now try: "Weather for my location" or "Weather".');
    }
  }

  A.allowLocation = allowLocation;
  locBtn.onclick = allowLocation;
  updateLocUI();

  /* ---------- cities ---------- */
  const CITY_KEY = 'goai_cities';
  const cityInput = document.getElementById('cityInput');
  const cityListEl = document.getElementById('cityList');
  A.cities = [];
  try { A.cities = JSON.parse(localStorage.getItem(CITY_KEY) || '[]'); } catch (e) {}
  A.saveCities = function () { try { localStorage.setItem(CITY_KEY, JSON.stringify(A.cities)); } catch (e) {} };
  A.addCity = function (name) {
    name = String(name || '').trim().replace(/[?.!]+$/, '');
    if (!name) return false;
    if (A.cities.some(function (c) { return c.toLowerCase() === name.toLowerCase(); })) {
      A.toast(name + ' is already in your cities.');
      return false;
    }
    A.cities.push(name);
    A.saveCities();
    renderCities();
    beep('confirm');
    A.toast('Added ' + name + ' to your cities.');
    return true;
  };
  A.removeCity = function (name) {
    A.cities = A.cities.filter(function (c) { return c.toLowerCase() !== name.toLowerCase(); });
    A.saveCities();
    renderCities();
    beep('clear');
  };
  function renderCities() {
    cityListEl.innerHTML = '';
    if (!A.cities.length) { cityListEl.innerHTML = '<div class="empty">No cities yet.</div>'; return; }
    A.cities.forEach(function (c) {
      const chip = document.createElement('span');
      chip.className = 'city-chip';
      const label = document.createElement('button');
      label.className = 'cc-label';
      label.textContent = c;
      label.onclick = function () { input.value = 'Weather in ' + c; GoAsk.send(); };
      const x = document.createElement('button');
      x.className = 'cc-x';
      x.textContent = '\u00d7';
      x.title = 'Remove ' + c;
      x.onclick = function () { A.removeCity(c); };
      chip.appendChild(label);
      chip.appendChild(x);
      cityListEl.appendChild(chip);
    });
  }
  function doAddCity() {
    const v = cityInput.value.trim();
    if (!v) { A.toast('Type a city name first, like Paris.'); return; }
    if (A.addCity(v)) cityInput.value = '';
  }
  document.getElementById('addCityBtn').onclick = doAddCity;
  cityInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doAddCity(); });
  renderCities();

  /* ---------- chats UI ---------- */
  const chatsModal = document.getElementById('chatsModal');
  function openChats() { renderChatList(); chatsModal.classList.remove('hidden'); }
  function closeChats() { chatsModal.classList.add('hidden'); }
  chatsBtn.onclick = openChats;
  document.getElementById('chatsClose').onclick = closeChats;
  function renderChatList() {
    const list = document.getElementById('chatList');
    list.innerHTML = '';
    if (!A.chats.length) { list.innerHTML = '<div class="empty">No saved chats yet. Send a message to start one.</div>'; return; }
    A.chats.forEach(function (c) {
      const item = document.createElement('div');
      item.className = 'chat-item';
      const t = document.createElement('div');
      t.className = 'ci-title';
      t.textContent = c.title || 'New chat';
      const s = document.createElement('div');
      s.className = 'ci-sub';
      s.textContent = new Date(c.time).toLocaleString() + ' \u00b7 ' + c.msgs.length + ' msgs';
      const open = document.createElement('button');
      open.className = 'mini-btn';
      open.textContent = 'Open';
      open.onclick = function () { closeChats(); loadChat(c.id); };
      const del = document.createElement('button');
      del.className = 'mini-btn danger';
      del.textContent = 'Delete';
      del.onclick = function () {
        A.chats = A.chats.filter(function (x) { return x.id !== c.id; });
        if (A.chatId === c.id) { A.chatId = null; startNewChat(); }
        A.saveChats();
        renderChatList();
      };
      item.appendChild(t);
      item.appendChild(s);
      item.appendChild(open);
      item.appendChild(del);
      list.appendChild(item);
    });
  }
  function loadChat(id) {
    const c = A.chats.find(x => x.id === id);
    if (!c) return;
    A.chatId = id;
    A.history = c.msgs.filter(function (m) { return m.role === 'user'; }).map(function (m) { return m.text; });
    A.chatEl.innerHTML = '';
    beep('select');
    c.msgs.forEach(function (m) { A.msg(m.role, m.text, true); });
    A.scroll();
  }
  function startNewChat() {
    A.chatId = null;
    A.history = [];
    A.chatEl.innerHTML = '';
    beep('confirm');
    A.msg('ai', 'Welcome to **Gaming GoAI** - the AI for **GoConsoleOS**, built by **GoStudios**.\n\nYour model is **' + A.model.name + '** (' + A.model.tag + ', ' + A.model.cost + ' token per message). I can tell the **time** and **weather**, set **timers**, **research the web**, generate **images** and **code**, convert **currency**, write **plans** and **recipes**, manage your **cities** - and **play games** like tic-tac-toe, rock paper scissors, guess the number and trivia!', true);
    A.suggestions(['What is the time?', 'Weather in London', 'Play tic tac toe', 'Guess the number', 'Generate an image of a dragon', 'Write me a calculator', 'Add city Paris', 'Trivia']);
  }

  /* ---------- account ---------- */
  const accBtn = document.getElementById('accBtn');
  const accOutBtn = document.getElementById('accOutBtn');
  const accountModal = document.getElementById('accountModal');
  const accUser = document.getElementById('accUser');
  const accPass = document.getElementById('accPass');
  const accErr = document.getElementById('accErr');
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  let accMode = 'login';
  function renderAccount() {
    const s = window.GoCloud.session();
    const out = document.getElementById('accSignedOut');
    const inn = document.getElementById('accSignedIn');
    if (s) {
      out.classList.add('hidden');
      inn.classList.remove('hidden');
      document.getElementById('accAvatar').textContent = (s.username || 'G')[0].toUpperCase();
      document.getElementById('accName').textContent = s.username;
      document.getElementById('accSub').textContent = 'member since ' + new Date(s.joined).toLocaleDateString();
    } else {
      inn.classList.add('hidden');
      out.classList.remove('hidden');
    }
  }
  function setAccMode(mode) {
    accMode = mode;
    tabLogin.classList.toggle('active', mode === 'login');
    tabSignup.classList.toggle('active', mode === 'signup');
    accErr.classList.add('hidden');
    document.getElementById('accSubmit').textContent = mode === 'login' ? 'Sign in' : 'Create account';
  }
  tabLogin.onclick = function () { setAccMode('login'); };
  tabSignup.onclick = function () { setAccMode('signup'); };
  accBtn.onclick = function () {
    accountModal.classList.remove('hidden');
    setAccMode('login');
    accUser.value = '';
    accPass.value = '';
  };
  document.getElementById('accModalClose').onclick = function () { accountModal.classList.add('hidden'); };
  accOutBtn.onclick = function () {
    window.GoCloud.api.logout().then(function () { renderAccount(); A.toast('Signed out of GoStudios Cloud.'); });
  };
  document.getElementById('accSubmit').onclick = function () {
    const u = accUser.value.trim();
    const p = accPass.value;
    accErr.classList.add('hidden');
    const fn = accMode === 'login' ? window.GoCloud.api.login : window.GoCloud.api.register;
    fn(u, p).then(function (r) {
      if (!r.ok) { accErr.textContent = r.error; accErr.classList.remove('hidden'); return; }
      window.GoCloud.saveSession(r.user);
      const msgs = A.chats.reduce(function (n, c) { return n + c.msgs.length; }, 0);
      return window.GoCloud.api.sync({ tokens: A.tokens, msgs: msgs, model: A.model.name }).then(function (syn) {
        if (syn.ok) A.toast('Account synced with GoStudios Cloud. Tokens backed up: ' + syn.user.tokens.toLocaleString());
        else A.toast('Signed in as ' + r.user.username + '!');
        renderAccount();
        accountModal.classList.add('hidden');
        beep('success');
      });
    });
  };
  renderAccount();

  /* ---------- boot ---------- */
  A.typingOff();
  startNewChat();
  setTimeout(function () { beep('message'); }, 500);
})();