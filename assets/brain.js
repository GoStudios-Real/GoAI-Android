/* GoAI brain - skills and handlers */
(function () {
  const D = window.GO_DATA;
  const A = window.GoApp;
  const PICK = arr => arr[Math.floor(Math.random() * arr.length)];

  function speak(text) {
    const V = window.GoVoice;
    if (V && V.say) V.say(text);
  }
  function sound(name) {
    if (window.GoSoundOS) window.GoSoundOS.play(name);
  }

  function stripHtml(s) {
    return String(s).replace(/<[^>]*>/g, '');
  }
  function cap(s) {
    return s ? s[0].toUpperCase() + s.slice(1) : s;
  }
  function mem() {
    return window.GoApp.memory || { name: '', prefs: [] };
  }

  function nowTime() {
    const d = new Date();
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const ap = h < 12 ? 'AM' : 'PM';
    h = h % 12 || 12;
    return h + ':' + m + ':' + s + ' ' + ap;
  }

  function fmtDate() {
    return new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function miniCalc(expr) {
    try {
      if (!/^[0-9+\-*/().%\s^a-z]+$/.test(expr)) return null;
      const safe = expr
        .replace(/pi\b/g, '3.14159265')
        .replace(/\^/g, '**')
        .replace(/%/g, '/100')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(');
      const val = new Function('return (' + safe + ');')();
      if (typeof val === 'number' && isFinite(val)) return Math.round(val * 1e10) / 1e10;
    } catch (e) { return null; }
    return null;
  }

  const WMO = {
    0: 'clear sky', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast',
    45: 'fog', 48: 'rimy fog', 51: 'light drizzle', 53: 'drizzle',
    61: 'light rain', 63: 'rain', 65: 'heavy rain', 71: 'light snow',
    73: 'snow', 75: 'heavy snow', 80: 'rain showers', 81: 'showers',
    95: 'thunderstorm', 96: 'thunderstorm with hail'
  };

  function fetchT(url, ms) {
    return Promise.race([
      fetch(url),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms || 12000))
    ]);
  }

  async function getWeather(city) {
    let lat, lon, name = city || 'your location';
    if (city) {
      const g = await fetchT('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city) + '&count=1&language=en');
      const gj = await g.json();
      if (!gj.results || !gj.results.length) return null;
      lat = gj.results[0].latitude; lon = gj.results[0].longitude; name = gj.results[0].name;
    } else {
      const saved = A.getLocation ? A.getLocation() : null;
      if (saved) {
        lat = saved.lat; lon = saved.lon; name = saved.name || 'your location';
      } else if (navigator.geolocation) {
        const pos = await new Promise(res => navigator.geolocation.getCurrentPosition(p => res(p.coords), () => res(null), { timeout: 8000 }));
        if (!pos) return null;
        lat = pos.latitude; lon = pos.longitude;
        const g = await fetchT('https://geocoding-api.open-meteo.com/v1/reverse?latitude=' + lat + '&longitude=' + lon + '&count=1&language=en');
        const gj = await g.json();
        if (gj.results && gj.results[0]) name = gj.results[0].name;
      } else {
        return null;
      }
    }
    const f = await fetchT('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto');
    const fj = await f.json();
    const cw = fj.current_weather;
    const code = cw.weathercode;
    const temp = Math.round(cw.temperature);
    const wind = Math.round(cw.windspeed);
    const hi = Math.round(fj.daily.temperature_2m_max[0]);
    const lo = Math.round(fj.daily.temperature_2m_min[0]);
    A.card('LIVE WEATHER - ' + A.esc(name), '<div class="big">' + temp + '&deg;C</div>' +
      '<div class="lbl">' + (WMO[code] || 'unknown') + ' - wind ' + wind + ' km/h</div>' +
      '<div class="lbl" style="margin-top:4px">High today ' + hi + '&deg;C, low ' + lo + '&deg;C</div>');
    return 'Here is the live weather for ' + name + ': ' + temp + '&deg;C, ' + (WMO[code] || code) + ', wind ' + wind + ' km/h. High today ' + hi + ', low ' + lo + '.';
  }

  function imgUrl(prompt, seed, w, h) {
    return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) +
      '?width=' + (w || 512) + '&height=' + (h || 512) + '&nologo=true&seed=' + (seed || (Date.now() % 99999));
  }

  function showImage(prompt) {
    const seed = Math.floor(Math.random() * 99999);
    const url = imgUrl(prompt, seed);
    const cap = A.esc(prompt.slice(0, 64));
    const html = '<div class="imgrow"><div class="imgcard"><img src=\'' + url + '\' alt=\'' + cap + '\' loading="lazy">' +
      '<div class="img-cap"><span>' + cap + '</span><a href=\'' + url + '\' target="_blank" rel="noopener">open</a></div></div></div>';
    A.msgImage(html, 'seed ' + seed + ' - by GoStudios');
  }

  /* ---------- generated code templates ---------- */
  function genCode(req) {
    const t = req.toLowerCase();
    if (t.indexOf('fizz') >= 0) return fizzBuzz();
    if (t.indexOf('calc') >= 0) return calcCode();
    if (t.indexOf('clock') >= 0) return clockCode();
    if (t.indexOf('todo') >= 0 || t.indexOf('to-do') >= 0) return todoCode();
    if (t.indexOf('game') >= 0) return guessCode();
    if (t.indexOf('page') >= 0 || t.indexOf('site') >= 0 || t.indexOf('website') >= 0) return webCode();
    if (t.indexOf('python') >= 0) return pythonCode(req);
    return jsCode(req);
  }

  function mylang(l) {
    return { python: 'Python', js: 'JavaScript', html: 'HTML' }[l] || l;
  }

  function fizzBuzz() {
    return { lang: 'js', intro: 'Here is FizzBuzz in JavaScript:', code: 'function fizzBuzz(n) {\n  for (let i = 1; i <= n; i++) {\n    let out = \'\';\n    if (i % 3 === 0) out += \'Fizz\';\n    if (i % 5 === 0) out += \'Buzz\';\n    console.log(out || i);\n  }\n}\n\nfizzBuzz(30);' };
  }

  function calcCode() {
    return { lang: 'html', intro: 'A working calculator you can run:', code: '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><title>GoCalc</title>\n<style>\nbody{font-family:Arial;display:grid;place-items:center;height:100vh;background:#0f0f23;color:#eee;margin:0}\n.calc{width:250px;background:#181836;border-radius:14px;padding:14px}\n#scr{width:100%;height:60px;background:#0a0a18;border:none;color:#4dff88;font-size:26px;text-align:right;border-radius:9px;margin-bottom:10px}\n.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}\nbutton{padding:14px;font-size:17px;border:none;border-radius:8px;background:#2a2a55;color:#fff;cursor:pointer}\nbutton:hover{background:#3a3a77}\n</style></head>\n<body>\n<div class="calc"><input id="scr" readonly><div id="g" class="grid"></div></div>\n<script>\nconst keys = [\'C\',\'7\',\'8\',\'9\',\'/\',\'4\',\'5\',\'6\',\'*\',\'1\',\'2\',\'3\',\'-\',\'0\',\'.\',\'=\'];\nconst grid = document.getElementById(\'g\');\nconst scr = document.getElementById(\'scr\');\nkeys.forEach(function(k){\n  const b = document.createElement(\'button\');\n  b.textContent = k;\n  b.onclick = function(){\n    if (k === \'C\') scr.value = \'\';\n    else if (k === \'=\'){ try{ scr.value = Function(\'return (\' + scr.value + \')\')(); }catch(e){ scr.value = \'Error\'; } }\n    else scr.value += k;\n  };\n  grid.appendChild(b);\n});\n</script>\n</body>\n</html>' };
  }

  function clockCode() {
    return { lang: 'html', intro: 'A live digital clock:', code: '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><title>GoClock</title>\n<style>\nbody{display:grid;place-items:center;height:100vh;margin:0;background:radial-gradient(circle,#151528,#000);color:#0ff;font-family:monospace}\nh1{font-size:92px;margin:0;text-shadow:0 0 22px #0ff}\n</style></head>\n<body><h1 id="t">--:--:--</h1>\n<script>\nfunction tick(){const d=new Date();const p=function(n){return (n<10?\'0\':\'\')+n;};\ndocument.getElementById(\'t\').textContent=p(d.getHours())+\' : \'+p(d.getMinutes())+\' : \'+p(d.getSeconds());}\nsetInterval(tick,1000);tick();\n</script>\n</body>\n</html>' };
  }

  function todoCode() {
    return { lang: 'html', intro: 'A handy to-do list app:', code: '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><title>GoTasks</title>\n<style>\nbody{font-family:Arial;max-width:420px;margin:50px auto;background:#f4f4f8}\ninput{padding:10px;width:68%;border:1px solid #ccc;border-radius:8px}\nbutton{padding:10px 15px;border:none;border-radius:8px;background:#6366f1;color:#fff;cursor:pointer}\nul{list-style:none;padding:0}\nli{padding:10px;background:#fff;margin:6px 0;border-radius:8px;display:flex;justify-content:space-between;box-shadow:0 1px 3px #ddd;cursor:pointer}\nli.done{text-decoration:line-through;opacity:.5}\n</style></head>\n<body><h2>My tasks</h2>\n<input id="todo" placeholder="Add a task..."><button id="add">Add</button>\n<ul id="list"></ul>\n<script>\nconst input=document.getElementById(\'todo\');\nfunction add(){const v=input.value.trim();if(!v)return;const li=document.createElement(\'li\');li.textContent=v;li.onclick=function(){li.classList.toggle(\'done\');};document.getElementById(\'list\').appendChild(li);input.value=\'\';}\ndocument.getElementById(\'add\').onclick=add;input.onkeydown=function(e){if(e.key===\'Enter\')add();};\n</script>\n</body>\n</html>' };
  }

  function guessCode() {
    return { lang: 'js', intro: 'A number guessing game in JavaScript:', code: 'const target = Math.floor(Math.random() * 100) + 1;\nlet guesses = 0;\n\nfunction play() {\n  const guess = parseInt(prompt(\'Guess a number from 1 to 100\'), 10);\n  if (!guess) return;\n  guesses++;\n  if (guess > target) { alert(\'Too high!\'); play(); }\n  else if (guess < target) { alert(\'Too low!\'); play(); }\n  else { alert(\'You got it in \' + guesses + \' tries!\'); }\n}\n\nplay();' };
  }

  function webCode() {
    return { lang: 'html', intro: 'Here is a complete website page. Hit Run preview:', code: '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><title>My Site</title>\n<style>\nbody{margin:0;font-family:Segoe UI,sans-serif;background:#0f0f1a;color:#eef}\nheader{background:linear-gradient(90deg,#7c3aed,#06b6d4);padding:34px;text-align:center}\nh1{margin:0;font-size:42px;color:#fff}\nnav{padding:14px;text-align:center;background:#1a1a2e}\na{color:#06b6d4;margin:0 14px;text-decoration:none}\n.hero{padding:70px 30px;text-align:center}\n.hero p{font-size:19px;color:#94a3b8}\n.btn{display:inline-block;margin-top:22px;padding:14px 36px;border-radius:40px;background:linear-gradient(90deg,#7c3aed,#06b6d4);color:#fff;text-decoration:none}\nfooter{padding:20px;text-align:center;color:#64748b;background:#0a0a12}\n</style></head>\n<body>\n<header><h1>My Awesome Site</h1></header>\n<nav><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></nav>\n<div class="hero"><h2>Hello, World!</h2>\n<p>This site was generated by GoAI. Make it yours.</p>\n<a class="btn" href="#">Get Started</a></div>\n<footer>Made with GoAI by GoStudios</footer>\n</body>\n</html>' };
  }

  function pythonCode() {
    return { lang: 'python', intro: 'Here is a tidy Python program:', code: '# GoAI generated Python script\n\nimport datetime\nimport random\n\n\ndef main():\n    print("=== GoAI Python Program ===")\n    print("Generated:", datetime.datetime.now().strftime(\'%Y-%m-%d %H:%M\'))\n    nums = [3, 7, 1, 9, 4]\n    print("Sorted:", sorted(nums))\n    print("Random pick:", random.choice(nums))\n    if sum(nums) % 2 == 0:\n        print("The sum of the list is even.")\n    else:\n        print("The sum of the list is odd.")\n\n\nif __name__ == "__main__":\n    main()\n' };
  }

  function jsCode(req) {
    const t = req.replace(/[^\w ]/g, '');
    return { lang: 'js', intro: 'Here is a useful JavaScript snippet:', code: '// GoAI generated JavaScript\n// ' + t.slice(0, 60) + '\n\nfunction analyze(text) {\n  const words = text.trim().split(/\\s+/);\n  return {\n    characters: text.length,\n    words: words.length,\n    sentences: (text.match(/[.!?]/g) || []).length\n  };\n}\n\nconsole.log(analyze(\'Hello world. GoAI rocks!\'));' };
  }

  /* ---------- timer ---------- */
  const actives = [];
  let timerSeq = 0;

  function startTimer(seconds, label) {
    const t = { seq: ++timerSeq, end: Date.now() + seconds * 1000, dead: false };
    actives.push(t);
    timerCard(t, label);
    t.iv = setInterval(function () {
      if (t.dead) return;
      const left = Math.round((t.end - Date.now()) / 1000);
      const el = document.getElementById('timer-' + t.seq);
      if (el) el.textContent = fmtClock(left < 0 ? 0 : left);
      if (left <= 0) {
        t.dead = true;
        clearInterval(t.iv);
        if (el) el.textContent = '00:00';
        sound('timer');
        A.toast('GoAI: time is up!');
        speak('Time is up. Beep beep!');
      }
    }, 250);
  }

  function fmtClock(s) {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const x = String(s % 60).padStart(2, '0');
    return m + ':' + x;
  }

  function stopTimers() {
    actives.forEach(t => { t.dead = true; if (t.iv) clearInterval(t.iv); });
  }

  function timerCard(t, label) {
    const m = document.createElement('div');
    m.className = 'msg ai';
    const av = document.createElement('div');
    av.className = 'avatar';
    av.textContent = 'G';
    const b = document.createElement('div');
    b.className = 'bubble';
    const box = document.createElement('div');
    box.className = 'card';
    box.style.display = 'inline-flex';
    box.style.alignItems = 'center';
    box.style.gap = '14px';
    const num = document.createElement('div');
    num.className = 'timer-num';
    num.id = 'timer-' + t.seq;
    num.textContent = fmtClock(t.end - Date.now());
    const stopB = document.createElement('button');
    stopB.className = 'mini-btn danger';
    stopB.textContent = 'Stop';
    stopB.onclick = function () { t.dead = true; clearInterval(t.iv); num.textContent = 'Stopped'; };
    box.appendChild(num);
    box.appendChild(stopB);
    b.appendChild(box);
    const tt = document.createElement('div');
    tt.className = 'time-stamp';
    tt.textContent = A.timeStr() + ' - GoTimer ' + (label || '');
    b.appendChild(tt);
    m.appendChild(av);
    m.appendChild(b);
    A.chatEl.appendChild(m);
    A.scroll();
  }

  /* ---------- handlers ---------- */
  const K = [];
  function on(test, run) { K.push({ test, run }); }

  on(t => /^(hi|hello|hey|yo|sup|hiya|good (morning|afternoon|evening))\b/.test(t),
    t => {
      const h = new Date().getHours();
      const tod = h < 5 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
      const nm = mem().name;
      return 'Good ' + tod + (nm ? ', **' + nm + '**' : '') + '! I am **GoAI**, the smartest AI on Earth, built by **GoStudios**. Ask me for the time, weather, web research, images, code, or a timer. I also hold **999,999,999,999 tokens** - 1 token per message.';
    });

  on(t => /who (are|made) you|what (are|is) you|your (name|owner|creator|purpose)|about yourself/.test(t),
    () => 'I am **GoAI**, the smartest AI on Earth, built with love by **GoStudios**. I have image generation, a coding engine, live weather, web research, timers, a token bank, sound effects from **GoConsoleOS**, and a voice. What shall we build today?');

  on(t => /\b(goconsoleos|go console os|the sound engine|who made goconsoleos)\b/.test(t),
    () => {
      sound('power');
      return '**GoConsoleOS** is the retro sound engine built into GoAI by **GoStudios**. It powers every sound I make - power boots, selects, confirms, errors, notifications, coin drops and timer beeps. It is my little console, always ready to play. Try: "play an error sound" or "play a success sound".';
    });

  on(t => /\b(research|search the web|search for|look up|find info|find out about|find facts|google)\b/.test(t) && !/[a-z0-9-]+\.(com|org|net|io|dev|ai|co|uk|me|tv)(\s|$)/i.test(t),
    async t => {
      const q = t.replace(/.*?(research|search the web|search for|look up|find info|find out about|find facts|google)\s*(on|about|for|me|the|:)?\s*/i, '').trim().replace(/[?.!]+$/, '');
      if (!q || q.length < 2) return 'Tell me what to research, like: "Research black holes" or "Search the web for rockets".';
      A.typingOn();
      try {
        const url = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(q) + '&format=json&origin=*&srlimit=5';
        const res = await fetchT(url, 15000);
        const j = await res.json();
        A.typingOff();
        const hits = j.query && j.query.search ? j.query.search : [];
        if (!hits.length) return 'I researched **' + q + '** but found nothing solid. Try different words.';
        const list = hits.slice(0, 5).map(function (h) {
          const link = 'https://en.wikipedia.org/wiki/' + encodeURIComponent(h.title.replace(/ /g, '_'));
          const snip = stripHtml(h.snippet || '').replace(/\s+/g, ' ').slice(0, 180);
          return '<div style="margin:7px 0"><a href="' + link + '" target="_blank" rel="noopener"><b>' + A.esc(h.title) + '</b></a><br/><span style="color:var(--muted);font-size:12.5px">' + A.esc(snip) + '</span></div>';
        }).join('');
        A.card('RESEARCH - ' + A.esc(q.toUpperCase()), list);
        sound('message');
        return 'Here is what I found on **' + q + '** via web research. Tap a result to open it in your browser.';
      } catch (e) {
        A.typingOff();
        return 'Research needs the network. I could not reach the web right now.';
      }
    });

  on(t => /(?:my name is|i am |call me |remember my name|set my name to|i'm )\s*([a-zA-Z][a-zA-Z ]{1,20})/.test(t),
    t => {
      const m = t.match(/(?:my name is|i am |call me |remember my name|set my name to|i'm )\s*([a-zA-Z][a-zA-Z ]{1,20})/);
      const raw = m ? m[1].trim() : '';
      if (!raw || /(research|goconsoleos|goai)/i.test(raw)) return null;
      const name = cap(raw.split(/\s+/)[0]);
      window.GoApp.memory.name = name;
      if (window.GoApp.saveMemory) window.GoApp.saveMemory();
      sound('confirm');
      return 'Nice to meet you, **' + name + '**! I will remember that. Try "what is my name?"';
    });

  on(t => /what(\'| i)s my name/.test(t),
    () => mem().name ? 'Your name is **' + mem().name + '**.' : 'I do not know your name yet. Tell me: "My name is Rhys".');

  on(t => /remember (that )?i (like|love|prefer|enjoy|hate|dislike) (.+)/.test(t),
    t => {
      const m = t.match(/remember (?:that )?i (?:like|love|prefer|enjoy|hate|dislike) (.+)/);
      const pref = m ? m[1].trim().replace(/[?.!]+$/, '') : '';
      if (!pref) return null;
      const mm = window.GoApp.memory;
      if (!mm.prefs) mm.prefs = [];
      mm.prefs.push(pref);
      if (window.GoApp.saveMemory) window.GoApp.saveMemory();
      return 'Got it - I will remember that you ' + (/(hate|dislike)/.test(m[0]) ? 'do not like' : 'like') + ' **' + pref + '**';
    });

  on(t => /\b(add|save) city (.+)/.test(t),
    t => {
      const m = t.match(/\b(?:add|save) city (.+)/);
      const name = m ? m[1].trim().replace(/[?.!]+$/, '') : '';
      if (!name) return 'Tell me the city name: "Add city Paris".';
      if (window.GoApp.addCity && window.GoApp.addCity(name)) {
        return 'Added **' + cap(name) + '** to your cities. Ask "Weather in ' + cap(name) + '" to check it.';
      }
      return '**' + cap(name) + '** is already in your cities.';
    });

  on(t => /what do i (like|prefer)|what did i tell you|what do you (remember|know about me)/.test(t),
    () => {
      const mm = mem();
      const prefs = mm.prefs && mm.prefs.length ? mm.prefs : null;
      if (!mm.name && !prefs) return 'I have not stored anything about you yet. Tell me "My name is X" or "Remember I like pizza".';
      let out = 'Here is what I remember:\n';
      if (mm.name) out += '- Your name is **' + mm.name + '**\n';
      if (prefs) prefs.forEach(p => { out += '- You mentioned: ' + p + '\n'; });
      return out;
    });

  on(t => /password/.test(t) && !/what|reset|forgot/.test(t),
    t => {
      const m = t.match(/(\d+)\s*(?:characters|chars|digits)/);
      let len = m ? parseInt(m[1]) : 16;
      len = Math.max(8, Math.min(48, len));
      const strong = /strong|secure|hard/.test(t);
      const sets = strong
        ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+'
        : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let pw = '';
      const crypto = window.crypto;
      for (let i = 0; i < len; i++) {
        pw += sets.charAt(Math.floor(Math.random() * sets.length));
      }
      return 'Here is a ' + (strong ? '**strong** ' : '') + 'password (' + len + ' chars):\n```\n' + pw + '\n```\nCopy it somewhere safe.';
    });

  on(t => /(?:count|how many) (words|characters|letters) ?(?:are there)?/.test(t),
    t => {
      const last = A.history && A.history.length ? A.history[A.history.length - 1] : '';
      if (!last) return 'Say something first, then ask me to count its words.';
      const what = t.match(/(words|characters|letters)/)[1];
      const n = what === 'words' ? (last.trim().split(/\s+/).filter(Boolean).length)
        : what === 'characters' ? last.length
        : last.replace(/\s+/g, '').length;
      return 'Your last message had **' + n + ' ' + what + '**.';
    });

  on(t => /\b(brainstorm|give me ideas|ideas? for|generate ideas|spark ideas)\b/.test(t),
    t => {
      const topic = t.replace(/.*?(brainstorm|give me ideas|ideas? for|generate ideas|spark ideas)\s*(on|about|for|:)?\s*/i, '').trim().replace(/[?.!]+$/, '') || 'anything creative';
      const ideas = [
        'A mini app that solves one tiny annoying problem',
        'A podcast or video series about ' + topic,
        'A challenge where you improve something small every day',
        'A list of 10 cool facts about ' + topic,
        'A social post that explains ' + topic + ' in one sentence',
        'A game idea set in a world inspired by ' + topic
      ];
      sound('coin');
      return '**Brainstorm: ' + cap(topic) + '**\n' + ideas.map((x, i) => (i + 1) + '. ' + x).join('\n') + '\n\nPick one and I can write the plan or code for it!';
    });

  on(t => /\b(what time|current time|the time|time now|tell me the time)\b/.test(t) && !/\btimer\b/.test(t),
    () => 'The time is **' + nowTime() + '**.');

  on(t => /(what('| i)s (today|the date|todays date)|todays date)/.test(t),
    () => 'Today is **' + fmtDate() + '**.');

  on(t => /\b(weather|forecast|temperature (in|for|at)|rain (today|in)|how cold|how hot)\b/.test(t),
    async t => {
      const m = t.match(/(?:in|for|at) ([a-zA-Z .,-]+?)[?.!]*$/);
      const named = m && !/my location|my area|current location|here\b/.test(m[1]);
      A.typingOn();
      try {
        const r = await getWeather(named ? m[1].trim() : null);
        A.typingOff();
        if (r) return r;
        if (named) return 'I could not find a forecast for **' + m[1].trim() + '**. Check the spelling, or try another city.';
        return 'I could not find your location. Tap **Allow Location** in the sidebar, or give me a city like "Weather in Paris".';
      } catch (e) {
        A.typingOff();
        return 'Weather needs the network. I could not reach Open-Meteo right now.';
      }
    });

  on(t => /set( a)? (timer|alarm|reminder) for (\d+) (seconds?|mins?|minutes?|hours?)/.test(t),
    t => {
      const m = t.match(/for (\d+) (seconds?|mins?|minutes?|hours?)/);
      if (!m) return null;
      const n = parseInt(m[1]);
      const unit = m[2].toLowerCase();
      let sec = n;
      if (unit.indexOf('min') === 0) sec = n * 60;
      else if (unit.indexOf('hour') === 0) sec = n * 3600;
      startTimer(sec, n + ' ' + unit);
      sound('confirm');
      speak('Timer set for ' + n + ' ' + unit + '.');
      return 'Done. I set a **GoTimer** for **' + n + ' ' + unit + '**. It will beep when finished.';
    });

  on(t => /cancel (the |my )?timer|stop (the )?timer|stop all timers/.test(t),
    () => { stopTimers(); return 'All timers stopped and cleared.'; });

  on(t => /play (the |a |an )?(error|success|notify|confirm|coin) sound/.test(t),
    t => {
      const which = ['error', 'success', 'notify', 'confirm', 'coin'].filter(x => t.indexOf(x) >= 0)[0] || 'confirm';
      sound(which);
      return 'Boop! That came from **GoConsoleOS**, my built-in sound bank. Try: play an error sound, or a success sound.';
    });

  let lastPrompt = null;
  on(t => /generate (an? )?image|make (an? )?image|create (an? )?image|image of|picture of|draw |paint |artwork of|logo of/.test(t),
    t => {
      const prompt = t
        .replace(/generate (an? )?image (of|for)?/i, '')
        .replace(/make (an? )?image (of|for)?/i, '')
        .replace(/create (an? )?image (of|for)?/i, '')
        .replace(/image of|picture of|draw |paint |artwork of|logo of/gi, '')
        .replace(/[?.!]*\s*$/, '')
        .trim();
      const p = prompt.length > 2 ? prompt : 'a neon planet glowing in space, high detail, 8k';
      lastPrompt = p;
      A.typingOn();
      showImage(p);
      A.typingOff();
      sound('message');
      return 'Here is your generated image: **' + p.slice(0, 48) + '** by GoStudios. Say *generate more* for variants.';
    });

  on(t => /generate more|more images?|another image|more variants/.test(t),
    t => {
      const p = lastPrompt || 'a neon planet glowing in space, high detail, 8k';
      A.typingOn();
      showImage(p);
      showImage(p);
      showImage(p);
      A.typingOff();
      sound('message');
      return 'Here are 3 fresh variants of **' + p.slice(0, 40) + '**.';
    });

  on(t => /(write|code|program|script|function|make|build|generate|calculator|todo|to-do|fizzbuzz|\bquiz\b|\bclock\b)/.test(t) && !/(image|story|poem|verse|joke|timer|sound|song|rap|movie)/.test(t),
    t => {
      if (t.indexOf('image') >= 0) return null;
      if (/poem|story|verse|joke|quote|fact|riddle|rap|song/.test(t)) return null;
      const out = genCode(t);
      A.msgCode(out.lang, out.code, A.esc ? out.intro : out.intro);
      speak('Here is your ' + mylang(out.lang) + ' program.');
      return 'I generated **' + mylang(out.lang) + '** code above. HTML code includes a Run preview button.';
    });

  function mathMatch(t) {
    if (/how much is|compute|calculate|what is \d/.test(t)) return true;
    if (/[0-9]/.test(t) && /[+\-*/^]/.test(t)) return true;
    return false;
  }

  on(mathMatch,
    t => {
      let expr = t.toLowerCase()
        .replace(/[?]/g, '')
        .replace(/(\d+(?:\.\d+)?)%\s*of\s*(\d+(?:\.\d+)?)/g, '($1/100)*$2')
        .replace(/plus/g, '+').replace(/minus/g, '-')
        .replace(/times/g, '*').replace(/divided by/g, '/')
        .replace(/percent of|% of/g, '*0.01*')
        .replace(/\bwhat (is|are)\b|\bhow much (is|are)\b|\bcompute\b|\bcalculate\b/ig, '');
      const m = expr.match(/([0-9(][0-9+\-*/().%^ ]*[0-9)])/);
      if (!m) return null;
      const v = miniCalc(m[1]);
      if (v === null) return null;
      speak(m[1] + ' equals ' + v);
      sound('confirm');
      return 'Let me compute: **' + m[1].trim() + ' = ' + v + '**';
    });

  on(t => /\b(roll|dice|coin|flip|random number)\b/.test(t),
    t => {
      if (t.indexOf('dice') >= 0 || t.indexOf('roll') >= 0) {
        sound('coin');
        return 'I rolled the dice: **' + (Math.floor(Math.random() * 6) + 1) + '** of 6!';
      }
      sound('coin');
      if (t.indexOf('coin') >= 0 || t.indexOf('flip') >= 0) {
        return 'I flipped the coin: **' + (Math.random() < 0.5 ? 'Heads' : 'Tails') + '**!';
      }
      return 'Your random number is **' + Math.floor(Math.random() * 101) + '** (0-100).';
    });

  on(t => /story about|tell me a story|write a story/.test(t),
    t => {
      const topic = t.replace(/.*about/i, '').trim() || 'a young inventor and their robot friend';
      const name = PICK(['Rowan', 'Maya', 'Kai', 'Zara', 'Theo', 'Luna', 'Finn']);
      return '**Chapter One**\nOnce upon a time, in a town where ideas glowed like lanterns, lived a curious mind named **' + name + '**. Their greatest riddle was about *' + topic + '*. Day after day, they stacked courage on logic, turned failures into lessons, and discovered that every ending is just a doorway to a new beginning.\n\nThe End.\n\nWant me to tell another?';
    });

  on(t => /poem|verse|rhyme/.test(t),
    () => PICK([
      '**Moonlit Code**\n\nThe screen glows soft, the night is chill,\nmy fingers fly with steady will.\nA humming chip, a silver thread,\ntonight my wildest dreams are bred.',
      '**Neon Leaves**\n\nUnder skies of purple light,\nwhere pixels bloom and grow,\nGoAI turns your words to flight,\nand gentle breezes start to flow.'
    ]));

  on(t => /fact|did you know/.test(t),
    () => 'Fun fact: **' + PICK(D.FACTS) + '**. Want another?');

  on(t => /(joke|funny|make me laugh)/.test(t),
    () => PICK(D.JOKES));

  on(t => /quote|motivat|inspir|encourage/.test(t),
    () => PICK(D.QUOTES));

  on(t => /what (is|was|does) (a |an |the )?([a-z]+)/.test(t),
    t => {
      const m = t.match(/what (is|was|does) (?:a |an |the )?([a-z]+)/);
      if (!m) return null;
      const w = m[2].toLowerCase();
      if (D.WORDS.some(x => x[0] === w)) {
        const f = D.WORDS.find(x => x[0] === w);
        return '**' + f[0] + '** — ' + f[1] + '.';
      }
      if (D.INVENTORS[w]) return D.INVENTORS[w];
      if (D.ANIMALS[w]) return 'The **' + w + '**: ' + D.ANIMALS[w];
      if (D.BODIES[w]) return '**' + w[0].toUpperCase() + w.slice(1) + '**: ' + D.BODIES[w];
      return 'I know a little about **' + w + '** but want to learn more. Feed me a fact and I will remember it forever.';
    });

  on(t => /word (of|for) (the )?(day|today)/.test(t),
    () => {
      const w = PICK(D.WORDS);
      speak('Word of the day: ' + w[0] + '. It means ' + w[1] + '.');
      return '**Word of the day: ' + w[0] + '**\nMeaning: ' + w[1] + '.';
    });

  on(t => /(pi|golden ratio|euler).*value|tell me about pi|what is pi/.test(t),
    () => '**pi** is 3.14159... the ratio of any circle circumference to its diameter, and it shows up everywhere!');

  on(t => /send (an )?(email|mail) to|send a message to|mail to/.test(t),
    t => {
      const m = t.match(/to[ ']*([^ ]+@[^ ]+)/i);
      const link = 'mailto:' + (m ? m[1] : '') + '?subject=' + encodeURIComponent('Message from GoAI') + '&body=' + encodeURIComponent('Hello, this was composed by GoAI made by GoStudios.');
      try { if (window.open) window.open(link); } catch (e) {}
      sound('send');
      return 'I opened your mail app with a message ready to send. GoStudios engineering approves.';
    });

  on(t => /who (invented|created|built|made|founded|discovered)/.test(t),
    t => {
      const m = t.match(/who (?:invented|created|built|made|founded|discovered) ([a-z .-]+)/);
      const person = m ? m[1].trim().replace(/[^a-z ]/g, '').split(' ')[0] : '';
      if (person && D.INVENTORS[person]) return D.INVENTORS[person];
      return 'I have no founding record for **' + (person || 'that') + '** yet. Feed me the fact and I will remember.';
    });

  on(t => /^who (?:is|are) (?:a|an|the )?([a-z]+)/.test(t),
    t => {
      const m = t.match(/^who (?:is|are) (?:a|an|the )?([a-z]+)/);
      const w = m ? m[1] : '';
      if (w && D.INVENTORS[w]) return D.INVENTORS[w];
      if (w && D.BODIES[w]) return '**' + w[0].toUpperCase() + w.slice(1) + '**: ' + D.BODIES[w];
      if (w && D.ANIMALS[w]) return 'The **' + w + '**: ' + D.ANIMALS[w];
      return w ? 'I do not have a bio for **' + w + '** yet.' : null;
    });

  on(t => /(?:open|go to|visit|launch) (\S+)/.test(t),
    t => {
      const m = t.match(/(?:open|go to|visit|launch) ([^\s]+)/);
      if (!m) return null;
      const target = m[1].replace(/^[.!?]+/, '');
      const href = /^https?:/i.test(target) ? target : 'https://' + target;
      if (window.open) window.open(href, '_blank');
      sound('send');
      return 'Opened **' + href + '** in a new tab.';
    });

  on(t => /clear (the )?chat|clear screen|new chat|fresh/.test(t),
    () => { A.chatEl.innerHTML = ''; sound('clear'); return 'Chat cleared. Fresh starts make the best ideas.'; });

  on(t => /^thank|thanks|thx|ty\b/.test(t),
    () => 'You are very welcome. I am GoAI from GoStudios — anything else?');

  on(t => /(bye|goodbye|later|see you|gtg)/.test(t),
    () => 'Goodbye! GoStudios and GoAI sign off. Keep making great things.');

  on(t => /\bconvert (\d+(?:\.\d+)?) (usd|eur|gbp|jpy|aud|cad|chf|cny|inr|mxn|brl|krw|nzd|sek|nok|dkk)\b (?:to|in) (\w+)/i.test(t),
    async t => {
      const m = t.match(/\bconvert (\d+(?:\.\d+)?) (usd|eur|gbp|jpy|aud|cad|chf|cny|inr|mxn|brl|krw|nzd|sek|nok|dkk)\b (?:to|in) (\w+)/i);
      const amt = parseFloat(m[1]);
      const from = m[2].toUpperCase();
      const to = m[3].toUpperCase();
      A.typingOn();
      try {
        const res = await fetchT('https://open.er-api.com/v6/latest/' + from, 15000);
        const j = await res.json();
        A.typingOff();
        if (!j.rates || j.rates[to] == null) return 'I know the code **' + to + '** from no list. Try a code like USD, EUR, GBP, JPY, INR.';
        const out = (amt * j.rates[to]).toFixed(2);
        return '**' + amt + ' ' + from + ' = ' + out + ' ' + to + '** (live rates).';
      } catch (e) {
        A.typingOff();
        return 'Currency needs the network. I could not reach the exchange service.';
      }
    });

  on(t => /\b(study plan|workout plan|meal plan|weekly plan|daily routine|plan my (day|week))\b/.test(t),
    t => {
      const kind = /workout/.test(t) ? 'workout' : /meal/.test(t) ? 'meal' : /week|weekly/.test(t) ? 'week' : 'day';
      sound('coin');
      if (kind === 'workout') {
        return '**Workout Plan (30-40 min)**\n1. Warm-up - 5 min jumping jacks + stretches\n2. Push-ups - 3 x 10\n3. Squats - 3 x 15\n4. Plank - 3 x 30s\n5. Lunges - 3 x 12 each leg\n6. Cool-down - 5 min stretching\n\nGoAI recommends rest days. Want a plan for beginners?';
      }
      if (kind === 'meal') {
        return '**One-Day Meal Plan**\n- **Breakfast**: oatmeal with banana and honey\n- **Snack**: yogurt with nuts\n- **Lunch**: grilled chicken, rice, and veggies\n- **Snack**: fruit\n- **Dinner**: fish, sweet potato, and salad\n- **Hydration**: 8 glasses of water\n\nTell me a food you love and I will write a recipe for it!';
      }
      if (kind === 'week') {
        return '**Weekly Smart Plan**\n- **Mon/Tue/Wed**: deep-focus blocks - 3 x 45 min on your main goal\n- **Thu**: review + fix what failed\n- **Fri**: finish + share your progress\n- **Sat**: rest and hobbies\n- **Sun**: plan the next week\n\nI can turn any day into a schedule - just ask!';
      }
      return '**Today Plan**\n- **Morning**: hardest task first (45 min focus)\n- **Midday**: light tasks + walk\n- **Afternoon**: meeting/creative work\n- **Evening**: review, plan tomorrow, relax\n\nWant a study or workout plan instead?';
    });

  on(t => /recipe for (.+)/.test(t),
    t => {
      const food = t.match(/recipe for (.+)/)[1].trim().replace(/[?.!]+$/, '');
      if (!food) return null;
      sound('coin');
      return '**Recipe: ' + cap(food) + '**\n**Ingredients**\n- 2 cups of ' + food + ' base\n- 1 onion, chopped\n- 2 garlic cloves\n- 1 tbsp oil\n- Salt, pepper, herbs to taste\n\n**Steps**\n1. Heat oil and saute onion + garlic.\n2. Add the ' + food + ' and stir for 5 minutes.\n3. Season with salt, pepper and herbs.\n4. Simmer until tender and serve warm.\n\nAdapt the amounts to your taste - it always works!';
    });

  on(t => /\b(?:convert|celsius|fahrenheit| km | miles | minutes? to (seconds|minutes)| to f| to c| to miles| to km| feet | meters? to)\b/.test(t),
    t => {
      const cases = [
        { re: /([0-9.]+)\s*(km|kilometers?)\s*(?:to|in)\s*(miles?|mi)/i, f: v => (v * 0.621371).toFixed(2) + ' miles' },
        { re: /([0-9.]+)\s*(miles?|mi)\s*(?:to|in)\s*(km|kilometers?)/i, f: v => (v * 1.60934).toFixed(2) + ' km' },
        { re: /([0-9.]+)\s*(celsius|c)\s*(?:to|in)\s*(fahrenheit|f)/i, f: v => (v * 1.8 + 32).toFixed(1) + ' F' },
        { re: /([0-9.]+)\s*(fahrenheit|f)\s*(?:to|in)\s*(celsius|c)/i, f: v => ((v - 32) / 1.8).toFixed(1) + ' C' },
        { re: /([0-9.]+)\s*(minutes?|mins?)\s*(?:to|in)\s*(seconds?|secs?)/i, f: v => (v * 60).toFixed(0) + ' seconds' },
        { re: /([0-9.]+)\s*(meters?|m)\s*(?:to|in)\s*(feet|ft)/i, f: v => (v * 3.28084).toFixed(2) + ' feet' }
      ];
      for (const c of cases) {
        const m = t.match(c.re);
        if (m && m[1] !== undefined) {
          const out = c.f(parseFloat(m[1]));
          speak(out);
          return 'Conversion: **' + out + '**.';
        }
      }
      return 'Give me a conversion like: convert 10 km to miles, or 100 f to c.';
    });

  on(t => /(sunrise|sunset)/.test(t),
    async () => {
      A.typingOn();
      try {
        const day = new Date();
        const f = await fetchT('https://api.sunrise-sunset.org/json?lat=51.5&lon=-0.13&date=today');
        const j = await f.json();
        A.typingOff();
        if (j.status === 'OK') return 'Sunrise today: **' + j.results.sunrise + ' UTC**, sunset: **' + j.results.sunset + ' UTC**.';
      } catch (e) {}
      A.typingOff();
      return 'Could not fetch sunrise data right now.';
    });

  on(t => /^what can you do|help|skills|commands|\/helps|options/.test(t),
    () => {
      A.suggestions(['What is the time?', 'Weather in London', 'Research black holes', 'Generate an image of a dragon', 'Write me a calculator', 'Tell me a joke', 'Play tic tac toe', 'Guess the number']);
      return 'Here is what **Gaming GoAI** can do:\n\n**Core** - chat, math, conversions, definitions, memory\n**Live** - clock, date, weather, sunrise & sunset, timers, location\n**Web** - research anything on the internet\n**Create** - images, code, stories, poems, jokes, passwords, recipes\n**Plan** - study/workout/meal plans, brainstorming, ideas\n**Games** - tic-tac-toe, rock paper scissors, guess the number, trivia, coin flip, dice\n**Systems** - voice, GoConsoleOS sounds, Arcade Mode, Super Mind Mode, tokens, send\n\nYou hold **999,999,999,999 tokens** - higher models spend more. Say "play tic tac toe" to game!';
    });

  /* ---------- games ---------- */
  let GAME = null;
  let TTT = null;

  function tttBoard(b) {
    const cell = i => (b[i] === 'X' || b[i] === 'O') ? b[i] : String(i);
    return '```\n ' + cell(1) + ' | ' + cell(2) + ' | ' + cell(3) + '\n---+---+---\n ' + cell(4) + ' | ' + cell(5) + ' | ' + cell(6) + '\n---+---+---\n ' + cell(7) + ' | ' + cell(8) + ' | ' + cell(9) + '\n```';
  }
  function tttWinner(b) {
    const w = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7], [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]];
    for (let i = 0; i < w.length; i++) {
      const l = w[i];
      if (b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]] && (b[l[0]] === 'X' || b[l[0]] === 'O')) return b[l[0]];
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].every(i => b[i] === 'X' || b[i] === 'O') ? 'draw' : null;
  }
  function tttAiMove(b) {
    const free = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(i => b[i] !== 'X' && b[i] !== 'O');
    if (!free.length) return null;
    const pref = [5, 1, 9, 3, 7, 2, 4, 6, 8].filter(i => free.indexOf(i) >= 0);
    return pref[0] || free[0];
  }

  on(t => /\b(tic[\s-]?tac[\s-]?toe|tictactoe|\bttt\b|start a game|play a game)\b/.test(t),
    t => {
      TTT = { b: {} };
      const b = TTT.b;
      [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(i => { b[i] = String(i); });
      sound('power');
      return '**Tic-Tac-Toe** (you are **X**)\n\n' + tttBoard(b) + '\n\nType "play 1" to "play 9" to place your X. I am O.';
    });

  on(t => /\bplay ([1-9])\b/.test(t),
    t => {
      if (!TTT) return null;
      const m = t.match(/\bplay ([1-9])\b/);
      const mv = parseInt(m[1]);
      const b = TTT.b;
      if (b[mv] === 'X' || b[mv] === 'O') return 'Spot ' + mv + ' is taken. Pick a free number.';
      b[mv] = 'X';
      let w = tttWinner(b);
      if (w) {
        TTT = null;
        if (w === 'draw') { sound('bounce'); return '**Draw!**\n\n' + tttBoard(b); }
        sound('success');
        return '**You win!** Nice moves.\n\n' + tttBoard(b);
      }
      const ai = tttAiMove(b);
      if (ai == null) {
        TTT = null;
        sound('bounce');
        return '**Draw!**\n\n' + tttBoard(b);
      }
      b[ai] = 'O';
      w = tttWinner(b);
      if (w) {
        TTT = null;
        if (w === 'draw') { sound('bounce'); return '**Draw!**\n\n' + tttBoard(b); }
        sound('gameover');
        return '**I win!** The AI got you this time.\n\n' + tttBoard(b);
      }
      sound('select');
      return 'I played **' + ai + '**.\n\n' + tttBoard(b) + '\n\nYour move - "play 1" to "play 9".';
    });

  on(t => /\b(rock|paper|scissors)\b/.test(t) && /^(play )?(rock|paper|scissors)/.test(t),
    t => {
      const picks = ['rock', 'paper', 'scissors'];
      let user = picks.find(p => t.indexOf(p) >= 0);
      if (t.indexOf('rock') >= 0 && t.indexOf('paper') >= 0 && t.indexOf('scissors') >= 0) {
        user = picks[Math.floor(Math.random() * 3)];
      }
      if (!user) return null;
      const ai = picks[Math.floor(Math.random() * 3)];
      sound('coin');
      let res;
      if (user === ai) {
        res = 'It is a **draw**! We both picked ' + user + '.';
      } else if ((user === 'rock' && ai === 'scissors') || (user === 'paper' && ai === 'rock') || (user === 'scissors' && ai === 'paper')) {
        res = '**You win!** ' + cap(user) + ' beats ' + ai + '!';
        sound('success');
      } else {
        res = '**I win!** ' + cap(ai) + ' beats ' + user + '.';
        sound('gameover');
      }
      return '**Rock-Paper-Scissors!** I chose **' + ai + '**. ' + res;
    });

  on(t => /\b(guess.*(number|it)|number.*guess|pick a number|think of a number|play guess)\b/.test(t),
    t => {
      GAME = { type: 'guess', n: Math.floor(Math.random() * 100) + 1, tries: 0, done: false };
      sound('power');
      return 'I am thinking of a **number between 1 and 100**. Start guessing! Type a number. You get 10 tries.';
    });

  on(t => {
    if (GAME && GAME.type === 'guess' && !GAME.done && /^\d+$/.test(t.trim()) && parseInt(t.trim(), 10) >= 1 && parseInt(t.trim(), 10) <= 100) return true;
    return false;
  }, t => {
    const g = parseInt(t.trim(), 10);
    GAME.tries++;
    if (g === GAME.n) {
      GAME.done = true;
      sound('level');
      return '**Correct!** The number was **' + GAME.n + '** - you got it in ' + GAME.tries + ' tries. Say "guess the number" for a rematch!';
    }
    sound('select');
    if (GAME.tries >= 10) {
      const n = GAME.n;
      GAME.done = true;
      return 'That was 10 tries. The number was **' + n + '**. Say "guess the number" for a rematch!';
    }
    return '**' + g + '** is too **' + (g < GAME.n ? 'low' : 'high') + '**. (Try ' + GAME.tries + ' of 10)';
  });

  on(t => /\b(trivia|quiz|test me|question time)\b/.test(t),
    t => {
      const q = D.TRIVIA[Math.floor(Math.random() * D.TRIVIA.length)];
      GAME = { type: 'trivia', q: q, done: false };
      sound('power');
      return '**GoConsole Trivia!**\n' + q.q + '\n\n**A)** ' + q.a[0] + '\n**B)** ' + q.a[1] + '\n**C)** ' + q.a[2] + '\n**D)** ' + q.a[3] + '\n\nReply **A**, **B**, **C** or **D**.';
    });

  on(t => {
    if (GAME && GAME.type === 'trivia' && !GAME.done && /^[a-d]$/i.test(t.trim())) return true;
    return false;
  }, t => {
    const ans = t.trim().toUpperCase();
    const qi = GAME.q;
    GAME.done = true;
    sound(ans === qi.c ? 'success' : 'error');
    return ans === qi.c
      ? '**Correct!** ' + qi.explain
      : '**Not quite.** The answer is **' + qi.c + '** - ' + qi.explain + '\n\nSay "trivia" for another question!';
  });

  on(t => /\b(stop|end|quit|cancel|exit) (the )?game\b/.test(t),
    t => {
      GAME = null;
      TTT = null;
      sound('clear');
      return 'Game over. Back to normal chat - what do you need?';
    });

  /* last-resort handler */
  on(() => true, t => {
    const topic = t.split(/\s+/).slice(0, 6).join(' ');
    const nm = mem().name;
    const nameTag = nm ? ', ' + nm : '';
    const tier = (A.model && A.model.tier) || 3;
    const modelName = (A.model && A.model.name) || 'GoAI';
    if (window.GoApp.ultra || tier >= 4) {
      return '**' + modelName + ' Super-Mind analysis' + nameTag + '** on **' + topic + '**\n\n**1. Core** - break it into the smallest essential piece.\n**2. Pattern** - connect it to what you already know, then test one small step.\n**3. Action** - choose a single concrete move and do it now.\n\nI can also **research** it on the web, **generate an image**, **write code**, or **set a focus timer**. Type help to see everything.';
    }
    if (tier === 3) {
      return 'Thinking about **' + topic + '**' + nameTag + ' with **' + modelName + '** on board. The smartest next move is usually to look closely, pick the essential piece, and build in small steps. Want me to research it, generate an image, write code, or check the weather? Type help to see everything I can do.';
    }
    return 'I am thinking about **' + topic + '**' + nameTag + '. Try asking for the time, weather, research, an image, or code - type help to see everything I can do.';
  });

  async function run(text) {
    const norm = String(text).toLowerCase();
    for (const h of K) {
      const yes = h.test(norm);
      if (yes) {
        try {
          const out = await h.run(norm);
          if (out === null) continue;
          return out;
        } catch (e) {
          console.error('BRAIN ERR:', e);
          return 'GoAI recovered from a small glitch. Try again!';
        }
      }
    }
    return null;
  }

  window.GoBrain = { handle: run };
})();