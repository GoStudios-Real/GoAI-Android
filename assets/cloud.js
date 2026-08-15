/* GoStudios Cloud - local account server + API simulation (v1.0) */
(function () {
  const DB_KEY = 'goai_cloud_db';
  const SES_KEY = 'goai_session';

  function now() { return new Date().toISOString(); }
  function loadDB() { try { return JSON.parse(localStorage.getItem(DB_KEY) || '{}'); } catch (e) { return {}; } }
  function saveDB(db) { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {} }
  function delay(ms) { return new Promise(r => setTimeout(r, ms || 350)); }
  function session() { try { return JSON.parse(localStorage.getItem(SES_KEY) || 'null'); } catch (e) { return null; } }
  function saveSession(u) { try { localStorage.setItem(SES_KEY, JSON.stringify(u)); } catch (e) {} }

  function publicUser(usr, name) {
    return {
      username: name,
      joined: usr.joined,
      msgs: usr.msgs || 0,
      tokens: usr.tokens || 0,
      model: usr.model || ''
    };
  }

  const server = {
    name: 'GoStudios Cloud',
    version: '1.0',
    register(username, password) {
      const db = loadDB();
      const u = String(username || '').trim().toLowerCase();
      if (!/^[a-z0-9_]{3,16}$/.test(u)) return { ok: false, error: 'Username must be 3-16 letters, numbers or underscores.' };
      if (!password || String(password).length < 4) return { ok: false, error: 'Password needs at least 4 characters.' };
      if (db.users && db.users[u]) return { ok: false, error: 'That username is already taken.' };
      db.users = db.users || {};
      db.users[u] = { password: String(password), joined: now(), msgs: 0, tokens: 0, model: '' };
      saveDB(db);
      return { ok: true, user: publicUser(db.users[u], u) };
    },
    login(username, password) {
      const db = loadDB();
      const u = String(username || '').trim().toLowerCase();
      const usr = db.users && db.users[u];
      if (!usr || usr.password !== String(password)) return { ok: false, error: 'Wrong username or password.' };
      return { ok: true, user: publicUser(usr, u) };
    },
    sync(username, data) {
      const db = loadDB();
      const u = String(username || '').trim().toLowerCase();
      const usr = db.users && db.users[u];
      if (!usr) return { ok: false, error: 'Not signed in.' };
      if (data && typeof data.tokens === 'number' && data.tokens > usr.tokens) usr.tokens = Math.floor(data.tokens);
      if (data && typeof data.msgs === 'number' && data.msgs > usr.msgs) usr.msgs = Math.floor(data.msgs);
      if (data && data.model) usr.model = String(data.model);
      saveDB(db);
      return { ok: true, user: publicUser(usr, u) };
    }
  };

  const api = {
    register: (u, p) => delay().then(() => server.register(u, p)),
    login: (u, p) => delay().then(() => server.login(u, p)),
    sync(data) {
      const s = session();
      return s ? delay(250).then(() => server.sync(s.username, data)) : Promise.resolve({ ok: false, error: 'Not signed in.' });
    },
    me() {
      const s = session();
      return s ? Promise.resolve({ ok: true, user: s }) : Promise.resolve({ ok: false, error: 'Signed out.' });
    },
    logout() {
      try { localStorage.removeItem(SES_KEY); } catch (e) {}
      return Promise.resolve({ ok: true });
    }
  };

  window.GoCloud = { server: server, api: api, session: session, saveSession: saveSession };
})();