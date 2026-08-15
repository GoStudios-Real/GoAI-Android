/* GoAI core - shared helpers and chat renderer */
(function () {
  const A = window.GoApp = {};
  A.esc = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  A.timeStr = () => {
    const d = new Date();
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const am = h < 12 ? 'AM' : 'PM';
    h = h % 12 || 12;
    return h + ':' + m + ' ' + am;
  };
  A.dateStr = () => {
    return new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  A.chatEl = document.getElementById('chat');
  A.typingEl = document.getElementById('typing');

  A.scroll = () => {
    const w = A.chatEl.parentElement;
    w.scrollTop = w.scrollHeight;
  };

  A.typingOn = () => A.typingEl.classList.remove('hidden');
  A.typingOff = () => A.typingEl.classList.add('hidden');

  function bubble(role, inner) {
    const m = document.createElement('div');
    m.className = 'msg ' + role;
    const av = document.createElement('div');
    av.className = 'avatar';
    av.textContent = role === 'ai' ? 'G' : 'YOU';
    const b = document.createElement('div');
    b.className = 'bubble';
    b.innerHTML = inner;
    const ts = document.createElement('div');
    ts.className = 'time-stamp';
    ts.textContent = A.timeStr();
    b.appendChild(ts);
    m.appendChild(av);
    m.appendChild(b);
    A.chatEl.appendChild(m);
    A.scroll();
    return b;
  }

  function splitCode(text) {
    const parts = [];
    const re = /```(\w*)\s*\n?([\s\S]*?)```/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push({ type: 'text', text: text.slice(last, m.index) });
      parts.push({ type: 'code', lang: m[1] || '', code: m[2].replace(/\n$/, '') });
      last = re.lastIndex;
    }
    if (last < text.length) parts.push({ type: 'text', text: text.slice(last) });
    if (!parts.length) parts.push({ type: 'text', text: text });
    return parts;
  }

  A.msg = function (role, text, noSave) {
    const parts = splitCode(text);
    const b = bubble(role, '');
    b.innerHTML = '';
    parts.forEach(p => {
      if (p.type === 'code') {
        b.appendChild(A.makeCodeBox(p.lang, p.code));
        if (p.lang === 'html' || p.lang === 'html5') {
          const run = document.createElement('button');
          run.className = 'run-btn';
          run.textContent = 'Run preview';
          run.onclick = () => A.openPreview(p.code);
          b.appendChild(run);
        }
      } else {
        const div = document.createElement('div');
        div.innerHTML = goRender(p.text);
        b.appendChild(div);
      }
    });
    const ts = document.createElement('div');
    ts.className = 'time-stamp';
    ts.textContent = A.timeStr();
    b.appendChild(ts);
    if (!noSave && A.onMessage) A.onMessage(role, text);
    return b;
  };

  const LANG_WORD = {
    js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', python: 'Python', py: 'Python',
    html: 'HTML', html5: 'HTML', css: 'CSS', json: 'JSON', java: 'Java', c: 'C', 'c++': 'C++',
    cpp: 'C++', csharp: 'C#', cs: 'C#', php: 'PHP', ruby: 'Ruby', rb: 'Ruby', go: 'Go',
    rust: 'Rust', sql: 'SQL', bash: 'Bash', shell: 'Shell', swift: 'Swift', kotlin: 'Kotlin'
  };

  function fmtInline(s) {
    return s.replace(/`([^`]+)`/g, '<code style="background:#2a1c50;color:#a7f3d0;padding:1px 6px;border-radius:6px;font-size:13px">$1</code>');
  }

  function fmtBold(s) {
    return s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  function fmtHead(s) {
    return s.replace(/^### (.+)$/gm, '<div style="margin:12px 0 6px;font-weight:800;color:var(--accent2);font-size:15px">$1</div>')
            .replace(/^## (.+)$/gm, '<div style="margin:14px 0 6px;font-weight:800;font-size:17px;background:linear-gradient(90deg,var(--accent),var(--accent2));-webkit-background-clip:text;background-clip:text;color:transparent">$1</div>');
  }

  function fmtList(s) {
    return s.replace(/^- (.+)$/gm, '<div style="margin:2px 0">&bull; $1</div>')
            .replace(/^\\d+\\. (.+)$/gm, '<div style="margin:2px 0">$1</div>');
  }

  A.renderText = function (text) {
    text = A.esc(text);
    text = fmtInline(text);
    text = fmtBold(text);
    text = fmtList(text);
    text = fmtHead(text);
    return text.replace(/\n/g, '<br/>');
  };

  A.makeCodeBox = function (lang, code) {
    const box = document.createElement('div');
    box.className = 'codebox';
    const name = LANG_WORD[lang] || (lang || 'code');
    const head = document.createElement('div');
    head.className = 'code-head';
    head.innerHTML = '<span>' + (name || 'code') + '</span>';
    const copy = document.createElement('button');
    copy.className = 'copy-btn';
    copy.textContent = 'Copy';
    copy.onclick = () => {
      navigator.clipboard.writeText(code).then(() => {
        A.toast('Copied to clipboard');
        window.GoSoundOS.play('confirm');
      });
    };
    head.appendChild(copy);
    const pre = document.createElement('pre');
    pre.textContent = code;
    box.appendChild(head);
    box.appendChild(pre);
    return box;
  };

  A.msgCode = function (lang, code, intro) {
    const m = document.createElement('div');
    m.className = 'msg ai';
    const av = document.createElement('div');
    av.className = 'avatar';
    av.textContent = 'G';
    const b = document.createElement('div');
    b.className = 'bubble';
    const bbb = document.createElement('div');
    if (intro) bbb.innerHTML = goRender(intro);
    b.appendChild(bbb);
    b.appendChild(A.makeCodeBox(lang, code));
    const runnable = lang === 'html' || lang === 'html5';
    if (runnable) {
      const run = document.createElement('button');
      run.className = 'run-btn';
      run.textContent = 'Run preview';
      run.onclick = () => A.openPreview(code);
      b.appendChild(run);
    }
    const ts = document.createElement('div');
    ts.className = 'time-stamp';
    ts.textContent = A.timeStr();
    b.appendChild(ts);
    m.appendChild(av);
    m.appendChild(b);
    A.chatEl.appendChild(m);
    A.scroll();
    return b;
  };

  A.card = function (title, bodyHTML) {
    const m = document.createElement('div');
    m.className = 'msg ai';
    const av = document.createElement('div');
    av.className = 'avatar';
    av.textContent = 'G';
    const b = document.createElement('div');
    b.className = 'bubble';
    const c = document.createElement('div');
    c.className = 'card';
    c.innerHTML = '<h4>' + title + '</h4>' + bodyHTML;
    b.appendChild(c);
    const ts = document.createElement('div');
    ts.className = 'time-stamp';
    ts.textContent = A.timeStr();
    b.appendChild(ts);
    m.appendChild(av);
    m.appendChild(b);
    A.chatEl.appendChild(m);
    A.scroll();
    return b;
  };

  A.msgImage = function (imgHTML, caption) {
    const m = document.createElement('div');
    m.className = 'msg ai';
    const av = document.createElement('div');
    av.className = 'avatar';
    av.textContent = 'G';
    const b = document.createElement('div');
    b.className = 'bubble';
    b.innerHTML = imgHTML;
    if (caption) b.appendChild(Object.assign(document.createElement('div'), { className: 'time-stamp', textContent: caption }));
    m.appendChild(av);
    m.appendChild(b);
    A.chatEl.appendChild(m);
    A.scroll();
  };

  A.suggestions = function (labels) {
    const m = document.createElement('div');
    m.className = 'msg ai';
    const av = document.createElement('div');
    av.className = 'avatar';
    av.textContent = 'G';
    const b = document.createElement('div');
    b.className = 'bubble';
    const row = document.createElement('div');
    row.className = 'sugg-row';
    labels.forEach(l => {
      const btn = document.createElement('button');
      btn.className = 'sugg';
      btn.textContent = l;
      btn.onclick = () => {
        document.getElementById('input').value = l;
        GoAsk.send();
      };
      row.appendChild(btn);
    });
    b.appendChild(row);
    m.appendChild(av);
    m.appendChild(b);
    A.chatEl.appendChild(m);
    A.scroll();
  };

  A.toast = function (text) {
    const t = document.getElementById('toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(A.toastTimer);
    A.toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  };

  A.openPreview = function (htmlCode) {
    const p = document.getElementById('preview');
    p.innerHTML = '';
    const bar = document.createElement('div');
    bar.className = 'preview-bar';
    const close = document.createElement('button');
    close.className = 'mini-btn danger';
    close.textContent = 'Close';
    close.onclick = () => p.classList.add('hidden');
    const open = document.createElement('button');
    open.className = 'mini-btn';
    open.textContent = 'Open in new tab';
    open.onclick = () => { const w = window.open(); w.document.write(htmlCode); w.document.close(); };
    bar.appendChild(close);
    bar.appendChild(open);
    const ifr = document.createElement('iframe');
    ifr.srcdoc = htmlCode;
    p.appendChild(bar);
    p.appendChild(ifr);
    p.classList.remove('hidden');
  };
})();

function goRender(text) {
  return window.GoApp.renderText(text);
}