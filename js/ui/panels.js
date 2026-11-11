// 대화창 / 인벤토리 / 꾸미기 메뉴 / 퀘스트 완료 배너 (DOM)
(function () {
  const $ = (id) => document.getElementById(id);
  const changed = (k, v) => PK.ui.changed(k, v);
  const last = { choiceKey: null };

  // 초상화: 캐릭터 시트에서 머리 부분만 확대
  function portrait(who) {
    if (who === 'witch') return PK.sprites.canvas(null, 4, { key: 'witch', row: 0, col: 0, x: 2, y: 2, w: 20, h: 26 });
    const row = PK.atlas.characters.npcs.rows[who];
    return PK.sprites.canvas(null, 4, { key: 'npcs', row, col: 0, x: 1, y: 3, w: 22, h: 26 });
  }

  // ---------- 대화창 ----------
  function syncDialog(state) {
    const d = state.ui.dialog;
    const el = $('dialog');
    if (changed('dlgOpen', !!d)) el.hidden = !d;
    if (!d) return;
    const line = d.lines[d.index];
    const key = `${d.index}|${line.text}`;
    if (changed('dlgLine', key)) {
      const sp = line.who ? PK.data.speakers[line.who] : null;
      $('dialogName').textContent = sp ? sp.name : '';
      const box = $('dialogPortrait');
      box.innerHTML = '';
      if (sp) box.appendChild(portrait(sp.portrait));
      $('dialogChoices').innerHTML = '';
      last.choiceKey = null;
    }
    const shown = Math.floor(d.shown);
    if (changed('dlgText', key + shown)) $('dialogText').textContent = line.text.slice(0, shown);

    const done = d.shown >= line.text.length;
    const choices = done && line.choices ? line.choices : null;
    $('dialogNext').hidden = !done || !!line.choices;
    const ck = choices ? key + '|' + d.choice : null;
    if (ck !== last.choiceKey) {
      last.choiceKey = ck;
      const wrap = $('dialogChoices');
      wrap.innerHTML = '';
      if (choices) {
        choices.forEach((c, i) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'pill' + (i === d.choice ? ' active' : '');
          b.textContent = c.label;
          b.addEventListener('click', (e) => {
            e.stopPropagation();
            PK.input.push({ type: 'dialogChoose', index: i });
          });
          wrap.appendChild(b);
        });
      }
    }
  }

  // ---------- 인벤토리 ----------
  function syncInventory(state) {
    const open = state.ui.inventoryOpen;
    if (changed('invOpen', open)) $('inventory').hidden = !open;
    if (!open) return;
    const items = state.inventory.items;
    if (!changed('invItems', { items, sel: state.ui.selectedItem })) return;
    // 아이콘 + 이름 + 개수가 한눈에 보이는 목록
    const grid = $('invGrid');
    grid.innerHTML = '';
    $('invCount').textContent = `${items.length}/${PK.data.INVENTORY_SLOTS}칸`;
    for (const it of items) {
      const def = PK.data.items[it.id];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot' + (it.id === state.ui.selectedItem ? ' selected' : '');
      const name = document.createElement('span');
      name.className = 'slot-name';
      name.textContent = def.name;
      const c = document.createElement('span');
      c.className = 'slot-count';
      c.textContent = '×' + it.count;
      b.append(PK.sprites.canvas(def.icon, 2), name, c);
      b.addEventListener('click', () => PK.input.push({ type: 'selectItem', id: it.id }));
      grid.appendChild(b);
    }
    if (!items.length) {
      const p = document.createElement('p');
      p.className = 'inv-empty';
      p.textContent = '아직 가방이 비어 있어요.';
      grid.appendChild(p);
    }
    const sel = items.find((it) => it.id === state.ui.selectedItem);
    const detail = $('invDetail');
    if (sel) {
      const def = PK.data.items[sel.id];
      detail.innerHTML = `<b>${def.name}</b> × ${sel.count}<p>${def.desc}</p>`;
    } else {
      detail.innerHTML = items.length ? '아이템을 누르면 설명을 볼 수 있어요.' : '마을을 돌아다니며 아이템을 모아 보아요!';
    }
  }

  // ---------- 꾸미기 ----------
  function buildCatalog() {
    const wrap = $('decoCatalog');
    for (const type of PK.data.furnitureOrder) {
      const def = PK.data.furniture[type];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pill deco-item';
      b.dataset.type = type;
      b.appendChild(PK.sprites.canvas(def.sprite, 2));
      const s = document.createElement('span');
      s.textContent = def.name;
      b.appendChild(s);
      b.addEventListener('click', () => PK.input.push({ type: 'decoPick', furniture: type }));
      wrap.appendChild(b);
    }
  }

  function syncDeco(state) {
    const d = state.ui.deco;
    if (changed('decoOpen', !!d)) $('deco').hidden = !d;
    if (!d) return;
    const key = { mode: d.mode, type: d.type, sel: d.sel, n: state.house.furniture.length, valid: d.ghost && d.ghost.valid };
    if (!changed('decoState', key)) return;
    for (const b of $('decoCatalog').children) b.classList.toggle('active', d.mode === 'place' && b.dataset.type === d.type);
    const hasSel = d.sel != null && d.mode === 'browse';
    $('decoMove').disabled = !hasSel;
    $('decoDelete').disabled = !hasSel;
    let hint;
    if (d.mode === 'place') hint = `${PK.data.furniture[d.type].name}: 놓을 곳을 클릭 (E) · Esc 취소`;
    else if (d.mode === 'move') hint = '새 위치를 클릭해서 옮기기 (E) · Esc 취소';
    else if (hasSel) {
      const f = state.house.furniture.find((it) => it.uid === d.sel);
      hint = `${PK.data.furniture[f.type].name} 선택됨 · 이동(M) / 삭제(X)`;
    } else hint = `가구를 고르거나, 놓인 가구를 클릭해서 선택 (${state.house.furniture.length}/${PK.config.DECO_MAX})`;
    $('decoHint').textContent = hint;
  }

  // ---------- 퀘스트 완료 ----------
  function syncBanner(state) {
    const b = state.ui.banner;
    const show = !!(b && !b.pending);
    if (!changed('banner', show)) return;
    $('banner').hidden = !show;
    if (!show) return;
    $('bannerTitle').textContent = b.title;
    $('bannerQuest').textContent = `「${b.quest}」`;
    const wrap = $('bannerRewards');
    wrap.innerHTML = '';
    for (const r of b.rewards) {
      const def = PK.data.items[r.id];
      const el = document.createElement('div');
      el.className = 'reward';
      el.appendChild(PK.sprites.canvas(def.icon, 2));
      el.appendChild(document.createTextNode(`${def.name} × ${r.count}`));
      wrap.appendChild(el);
    }
  }

  // ---------- 포션 제작 ----------
  function syncBrew(state) {
    const b = state.ui.brew;
    const ev = state.events.moonPotion;
    const open = !!(b && !b.result);
    if (changed('brewOpen', open)) $('brew').hidden = !open;
    const res = !!(b && b.result);
    if (changed('brewResult', res)) {
      $('brewResult').hidden = !res;
      if (res && !$('resultIcon').firstChild) $('resultIcon').appendChild(PK.sprites.canvas('iconSweetPotion', 4));
    }
    if (!open) return;

    const busy = PK.brew.busyAnim(state);
    const S = PK.brew.STEPS;
    const cur = Math.min(ev.brewStep, 3);
    if (!changed('brewState', { cur, stirs: ev.stirs, busy, kind: b.anim && b.anim.kind })) return;

    const steps = $('brewSteps');
    steps.innerHTML = '';
    S.forEach((s, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${s.label}`;
      li.className = i < cur ? 'done' : i === cur ? 'now' : '';
      steps.appendChild(li);
    });

    const acts = $('brewActions');
    acts.innerHTML = '';
    S.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pill' + (i === cur ? ' now' : '');
      btn.disabled = i !== cur || busy;
      btn.appendChild(document.createTextNode(s.label));
      if (s.key === 'stir') {
        const bar = document.createElement('span');
        bar.className = 'stir-bar';
        for (let k = 0; k < s.times; k++) {
          const dot = document.createElement('i');
          if (k < ev.stirs) dot.className = 'on';
          bar.appendChild(dot);
        }
        btn.appendChild(bar);
      }
      btn.addEventListener('click', () => PK.input.push({ type: 'brewAct' }));
      acts.appendChild(btn);
    });

    const hints = [
      '달빛 꽃 3개를 가마솥에 넣어요. (E 또는 버튼)',
      `국자로 살살 저어주세요! (${ev.stirs}/${S[1].times})`,
      '마지막으로 반짝이는 마법을 넣어요!',
      '두근두근… 포션이 완성되고 있어요!',
    ];
    $('brewHint').textContent = busy && cur === 1 && ev.stirs === 0 ? '퐁당! 달빛 꽃이 가마솥에 들어가요…' : hints[cur] + (cur === 0 ? ' · Esc 나중에' : '');
  }

  // 캔버스 좌표 → 월드 좌표 (꾸미기 모드 클릭/터치)
  function pointer(e, click) {
    const state = PK.state;
    if (!state || !state.ui.deco) return;
    const cv = $('game');
    const r = cv.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * state.view.w + state.camera.x;
    const y = ((e.clientY - r.top) / r.height) * state.view.h + state.camera.y;
    PK.input.push({ type: 'decoPointer', x: Math.floor(x), y: Math.floor(y), click });
  }

  function setup() {
    $('dialog').addEventListener('click', () => PK.input.push({ type: 'dialogNext' }));
    $('invClose').addEventListener('click', () => PK.input.push({ type: 'toggleInventory' }));
    $('bannerOk').addEventListener('click', () => PK.input.push({ type: 'bannerClose' }));
    $('decoMove').addEventListener('click', () => PK.input.push({ type: 'decoMove' }));
    $('decoDelete').addEventListener('click', () => PK.input.push({ type: 'decoDelete' }));
    $('decoDone').addEventListener('click', () => PK.input.push({ type: 'decoToggle' }));
    $('resultOk').addEventListener('click', () => PK.input.push({ type: 'brewClose' }));
    buildCatalog();
    PK.ui.fillIcons();
    const cv = $('game');
    cv.addEventListener('pointermove', (e) => pointer(e, false));
    cv.addEventListener('pointerdown', (e) => { cv.focus(); pointer(e, true); });
  }

  PK.ui.setupPanels = setup;
  PK.ui.syncPanels = function (state) {
    syncDialog(state);
    syncInventory(state);
    syncDeco(state);
    syncBanner(state);
    syncBrew(state);
  };
})();
