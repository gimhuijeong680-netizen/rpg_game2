// 모모의 포션 가게 내부 (연금술 작업실) + 달콤한 마법 포션 이벤트 스프라이트
// 마을과 같은 팔레트 / 1px 도트 / 외곽선 규칙
module.exports = function ({ def, star5, heart, rng }) {
  // ================= 바닥 / 벽 =================
  def('shopWall', 16, 16, (p) => {
    p.rect(0, 0, 16, 16, 'l');
    p.rect(0, 0, 3, 16, 'w');
    p.rect(8, 0, 3, 16, 'w');
    p.vline(3, 0, 15, 'L');
    p.vline(11, 0, 15, 'L');
    p.set(5, 4, 'y'); p.set(13, 12, 'y');
    p.set(6, 4, 'w'); p.set(14, 12, 'w');
  }, false);

  def('shopFloor', 16, 16, (p) => {
    p.rect(0, 0, 16, 16, 'k');
    p.hline(0, 15, 0, 'C');
    p.hline(0, 15, 7, 'K'); p.hline(0, 15, 8, 'C');
    p.hline(0, 15, 15, 'K');
    p.vline(10, 1, 6, 'K'); p.vline(3, 9, 14, 'K');
    p.pts([[5, 3], [13, 11]], 'C');
  }, false);

  def('shopWainscot', 16, 8, (p) => {
    p.rect(0, 0, 16, 8, 'L');
    p.hline(0, 15, 0, 'w');
    p.hline(0, 15, 1, 'l');
    p.hline(0, 15, 6, 'v');
    p.hline(0, 15, 7, 'V');
    p.vline(7, 2, 5, 'v'); p.vline(15, 2, 5, 'v');
    p.set(3, 3, 'y'); p.set(11, 3, 'y');
  }, false);

  // ================= 벽 장식 =================
  def('roundWindow', 32, 32, (p) => {
    p.ellipse(16, 16, 15.5, 15.5, 'w');
    p.ellipse(16, 16, 13, 13, 'L');
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) if (p.get(x, y) === 'L' && y > 17) p.set(x, y, 'l');
    p.vline(16, 3, 29, 'w'); p.hline(3, 29, 16, 'w');
    // 초승달 + 별
    p.pts([[21, 7], [20, 8], [20, 9], [20, 10], [21, 11], [22, 11]], 'y');
    p.pts([[8, 8], [11, 21], [24, 23], [7, 19], [26, 13]], 'w');
    p.pts([[9, 12], [8, 13], [10, 13], [9, 14]], 'w');
  });

  def('garland', 80, 12, (p) => {
    for (let x = 0; x < 80; x++) p.set(x, Math.round(2 + Math.sin((x / 80) * Math.PI) * 4), 'L');
    for (let i = 0; i < 6; i++) {
      const x = 6 + i * 13, y = Math.round(2 + Math.sin((x / 80) * Math.PI) * 4) + 2;
      if (i % 2) heart(p, x - 2, y, 'q', 'P');
      else { p.pts([[x, y], [x - 1, y + 1], [x + 1, y + 1], [x, y + 2]], 'y'); p.set(x, y + 1, 'w'); }
    }
  }, false);

  def('herbs', 12, 22, (p) => {
    p.vline(6, 0, 6, 'T');
    p.rect(4, 6, 5, 2, 'q');
    for (const [x, c] of [[3, 'G'], [5, 'g'], [7, 'G'], [9, 'g'], [4, 'L'], [8, 'v']]) {
      p.vline(x, 8, 14 + (x % 3) * 2, c);
    }
    p.pts([[3, 16], [9, 17], [5, 19]], 'P');
    p.set(4, 18, 'v'); p.set(8, 19, 'L');
  });

  def('wallSign', 28, 20, (p) => {
    p.rect(1, 2, 26, 15, 'c');
    p.hline(1, 26, 16, 'C');
    p.pts([[5, 0], [22, 0]], 'T'); p.pts([[5, 1], [22, 1]], 'T');
    // 포션병 + 별
    p.rect(8, 5, 2, 2, 't'); p.rect(7, 7, 4, 1, 'a');
    p.ellipse(9, 11, 3.6, 3.2, 'q');
    p.set(8, 10, 'w');
    star5(p, 18, 9);
    p.pts([[21, 12], [22, 12], [15, 13], [16, 13]], 'P');
  });

  // ================= 가구 / 오브젝트 =================
  // 1. 중앙 가마솥 (몸통만 — 물약 표면은 liquid* 스프라이트를 위에 그린다)
  def('cauldron', 48, 42, (p) => {
    // 다리 + 장작 + 분홍 불꽃
    p.rect(8, 34, 4, 6, 'u'); p.rect(36, 34, 4, 6, 'u');
    p.rect(14, 37, 20, 3, 't'); p.hline(14, 33, 39, 'T');
    // 둥근 몸통
    p.ellipse(24, 25, 20, 14, 'V');
    p.ellipse(18, 22, 8, 7, 'v', true);
    p.ellipse(16, 20, 3, 3, 'L', true);
    for (let y = 30; y < 42; y++) for (let x = 0; x < 48; x++) if (p.get(x, y) === 'V' && !p.get(x, y + 2)) p.set(x, y, 'u');
    // 테두리 링
    p.ellipse(24, 12, 20, 6, 'L');
    p.ellipse(24, 12.5, 16.5, 4.2, 'u');
    p.hline(6, 42, 15, 'v');
    p.hline(5, 43, 16, 'v');
    p.pts([[9, 9], [10, 9], [11, 8]], 'w');
    // 하트 문양
    heart(p, 22, 25, 'q', 'P');
    p.pts([[16, 30], [32, 30], [24, 32]], 'L');
  });
  // 물약 표면 (가마솥 안쪽에 겹쳐 그림) — 상태별 색, 2프레임 보글보글
  const liquids = {
    Lav: ['L', 'l', 'w'],
    Moon: ['A', 'a', 'w'],
    Pink: ['q', 'P', 'w'],
    Glow: ['P', 'p', 'y'],
    Done: ['p', 'w', 'P'],
  };
  for (const [name, [main, hi, bub]] of Object.entries(liquids)) {
    for (const f of [0, 1]) {
      def(`liquid${name}${f}`, 32, 8, (p) => {
        p.ellipse(16, 4, 16, 3.8, main);
        p.ellipse(13, 3, 9, 1.6, hi, true);
        const spots = f === 0 ? [[7, 4], [22, 3], [26, 5]] : [[9, 3], [20, 5], [25, 3]];
        for (const [x, y] of spots) p.set(x, y, bub);
        if (name === 'Done') heart(p, 14, 2, 'Q', null);
      }, false);
    }
  }
  def('ladle', 8, 22, (p) => {
    p.vline(4, 0, 15, 't'); p.vline(5, 0, 15, 'T');
    p.ellipse(4.5, 18, 3.5, 2.6, 'X');
    p.set(3, 17, 'x');
  });

  // 2. 왼쪽 포션 진열 선반 (오른쪽 맨 아래 칸은 완성 포션 자리)
  def('potionShelf', 44, 58, (p) => {
    p.rect(1, 2, 42, 55, 'w');
    p.rect(0, 0, 44, 3, 'P'); p.hline(0, 43, 0, 'p');
    p.rect(3, 4, 38, 50, 'p');
    for (const y of [17, 31, 45]) p.rect(3, y, 38, 2, 'w');
    p.rect(1, 55, 42, 2, 'P');
    p.vline(42, 3, 54, 'p');
    const cols = ['q', 'v', 'G', 'A', 'Q', 'L', 'Y'];
    const r = rng(21);
    for (const top of [5, 19, 33]) {
      for (let x = 5; x < 39; x += 6) {
        if (top === 33 && x > 26) continue;              // 완성 포션 자리 비움
        const c = cols[Math.floor(r() * cols.length)];
        const tall = r() < 0.5;
        if (tall) {
          p.rect(x + 1, top + 2, 2, 3, 'a'); p.set(x + 1, top + 1, 't'); p.set(x + 2, top + 1, 't');
          p.rect(x, top + 5, 4, 7, c); p.set(x, top + 6, 'w');
        } else {
          p.rect(x + 1, top + 5, 2, 2, 'a'); p.set(x + 1, top + 4, 't');
          p.ellipse(x + 2, top + 9.5, 2.6, 2.6, c); p.set(x + 1, top + 8, 'w');
        }
      }
    }
    // 이름표
    p.rect(30, 48, 8, 4, 'c');
    p.hline(31, 36, 50, 'O');
  });

  // 3. 오른쪽 재료 보관 선반 (유리병, 버섯, 크리스털, 허브)
  def('ingredientShelf', 44, 58, (p) => {
    p.rect(1, 2, 42, 55, 't');
    p.rect(0, 0, 44, 3, 'T'); p.hline(0, 43, 0, 't');
    p.rect(3, 4, 38, 50, 'k');
    for (const y of [17, 31, 45]) p.rect(3, y, 38, 2, 't');
    p.rect(1, 55, 42, 2, 'T');
    // 유리병들
    for (const [x, c] of [[5, 'G'], [14, 'P'], [23, 'y'], [32, 'L']]) {
      p.rect(x, 7, 7, 10, 'a');
      p.rect(x + 1, 11, 5, 5, c);
      p.rect(x + 1, 5, 5, 2, 'T');
      p.set(x + 1, 8, 'w');
    }
    // 버섯 + 크리스털
    for (const x of [6, 14]) {
      p.ellipse(x + 2, 24, 3.6, 2.4, 'r'); p.rect(x + 1, 25, 2, 5, 'w');
      p.pts([[x + 1, 23], [x + 3, 24]], 'w');
    }
    for (const [x, c, d] of [[24, 'L', 'v'], [30, 'A', 'B'], [35, 'P', 'q']]) {
      p.poly([[x, 30], [x + 4, 30], [x + 3, 22], [x + 2, 20], [x + 1, 22]], c);
      p.vline(x + 3, 24, 29, d);
      p.set(x + 1, 24, 'w');
    }
    // 재료 자루 + 꽃잎 상자
    p.ellipse(10, 39, 6, 5, 'C'); p.rect(8, 33, 4, 2, 'K');
    p.pts([[8, 38], [12, 40]], 'k');
    p.rect(20, 37, 18, 8, 'w');
    for (let x = 21; x < 37; x += 2) p.set(x, 37, (x % 4) ? 'P' : 'L');
    p.hline(20, 37, 44, 'p');
  });

  // 작은 꽃병 (둥근 협탁 위)
  def('flowerVase', 18, 30, (p) => {
    p.rect(8, 18, 2, 10, 'T');
    p.ellipse(9, 17, 7.5, 2.5, 't');
    p.hline(2, 16, 18, 'T');
    p.rect(5, 27, 8, 2, 'T');
    p.ellipse(9, 11, 3.6, 4, 'a');
    p.rect(8, 5, 2, 3, 'a');
    p.set(8, 9, 'w');
    p.ellipse(9, 13, 2.6, 2, 'L', true);
    for (const [x, y, c] of [[6, 2, 'P'], [10, 1, 'w'], [12, 3, 'L'], [8, 0, 'q']]) {
      p.pts([[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]], c);
      p.vline(x, y + 2, 5, 'G');
    }
    p.set(10, 1, 'y');
  });

  // 마법책 (독서대 위, 빛나는 2프레임)
  for (const f of [0, 1]) {
    def(`bookStand${f}`, 20, 28, (p) => {
      p.rect(9, 12, 2, 13, 'T');
      p.rect(5, 24, 10, 3, 'T');
      p.poly([[1, 13], [19, 13], [17, 7], [3, 7]], 't');
      // 펼친 책
      p.rect(3, 4, 7, 7, 'w'); p.rect(10, 4, 7, 7, 'w');
      p.vline(10, 4, 10, 'v');
      p.hline(3, 16, 11, 'V');
      for (const y of [6, 8]) { p.hline(4, 8, y, 'L'); p.hline(12, 15, y, 'L'); }
      p.pts([[13, 9], [14, 9]], 'q');
      // 반짝
      p.set(f ? 4 : 16, f ? 1 : 2, 'y');
      p.set(f ? 15 : 6, f ? 0 : 1, 'w');
    });
  }

  // 작업 테이블 (막자사발, 저울, 작은 병)
  def('workTable', 52, 32, (p) => {
    p.rect(1, 12, 50, 5, 't');
    p.hline(1, 50, 12, 'k');
    p.hline(1, 50, 16, 'T');
    p.rect(3, 17, 3, 14, 'T'); p.rect(46, 17, 3, 14, 'T');
    p.rect(3, 23, 46, 2, 't');
    // 막자사발
    p.ellipse(10, 9, 5, 3.4, 'x'); p.hline(5, 15, 7, 'X');
    p.pts([[12, 3], [13, 4], [14, 5], [15, 6]], 'T');
    // 저울
    p.vline(26, 2, 11, 'Y'); p.hline(20, 32, 2, 'Y');
    p.ellipse(20.5, 6, 3, 1.4, 'Y'); p.ellipse(31.5, 6, 3, 1.4, 'Y');
    p.set(20, 5, 'P'); p.set(31, 5, 'L');
    p.vline(20, 3, 4, 'Y'); p.vline(31, 3, 4, 'Y');
    p.rect(23, 10, 7, 2, 'Y');
    // 작은 포션병
    for (const [x, c] of [[38, 'q'], [43, 'G'], [47, 'v']]) {
      p.rect(x, 7, 3, 5, c); p.set(x + 1, 5, 'a'); p.set(x + 1, 6, 'a'); p.set(x, 8, 'w');
    }
  });

  // 모모의 작업 공간 (계산대 + 레시피 노트 + 의자)
  def('momoDesk', 56, 34, (p) => {
    p.rect(1, 10, 54, 22, 'w');
    p.rect(0, 8, 56, 4, 'P');
    p.hline(0, 55, 8, 'p');
    p.hline(1, 54, 31, 'p');
    p.rect(5, 15, 46, 13, 'p');
    heart(p, 25, 19, 'q', 'P');
    for (const x of [8, 42]) p.pts([[x, 18], [x + 1, 19], [x, 20], [x + 2, 21]], 'P');
    // 레시피 노트 + 깃펜
    p.rect(5, 2, 12, 7, 'c');
    p.hline(6, 15, 4, 'O'); p.hline(6, 13, 6, 'O');
    p.pts([[18, 0], [17, 1], [16, 2], [15, 3]], 'L');
    p.set(18, 0, 'w');
    // 금전함 + 작은 포션
    p.rect(36, 3, 10, 6, 'L'); p.rect(38, 1, 6, 2, 'v'); p.set(41, 5, 'y');
    p.rect(50, 3, 3, 6, 'q'); p.set(51, 1, 'a'); p.set(51, 2, 'a'); p.set(50, 4, 'w');
    // 토끼 쿠션 의자 (책상 뒤)
    p.ellipse(28, 6, 3, 2, 'w'); p.pts([[26, 2], [26, 3], [30, 2], [30, 3]], 'w');
  });

  // 재료 자루 / 병 상자
  def('sack', 18, 18, (p) => {
    p.ellipse(9, 11, 8, 6.5, 'C');
    p.rect(7, 2, 4, 4, 'C');
    p.hline(6, 11, 5, 'K');
    p.pts([[6, 1], [11, 1]], 'C');
    p.pts([[7, 0], [8, 1], [10, 0]], 'g');
    p.ellipse(9, 12, 3.5, 2.5, 'k', true);
    heart(p, 7, 10, 'q', null);
  });
  def('bottleCrate', 24, 20, (p) => {
    p.rect(1, 9, 22, 10, 't');
    p.hline(1, 22, 9, 'k'); p.hline(1, 22, 14, 'T'); p.hline(1, 22, 18, 'T');
    p.vline(12, 9, 18, 'T');
    for (const [x, c] of [[3, 'q'], [8, 'A'], [14, 'L'], [19, 'G']]) {
      p.rect(x, 3, 3, 6, c); p.set(x + 1, 1, 'a'); p.set(x + 1, 2, 'a'); p.set(x, 4, 'w');
    }
  });

  // 가마솥 아래 마법진 러그
  def('magicCircle', 88, 40, (p) => {
    p.ellipse(44, 20, 43.5, 19.5, 'L');
    p.ellipse(44, 20, 41, 17, 'l');
    p.ellipse(44, 20, 33, 13, 'L');
    p.ellipse(44, 20, 31, 11, 'l');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = Math.round(44 + Math.cos(a) * 37 - 0.5), y = Math.round(20 + Math.sin(a) * 15 - 0.5);
      p.pts([[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]], 'v');
      p.set(x, y, 'y');
    }
  }, false);

  // ================= 이벤트 아이템 =================
  // 달빛 꽃 (꽃밭, 2프레임 반짝)
  for (const f of [0, 1]) {
    def(`moonFlower${f}`, 15, 16, (p) => {
      p.vline(7, 9, 15, 'G');
      p.pts([[5, 13], [4, 12], [9, 13], [10, 12]], 'g');
      p.ellipse(7.5, 6, 5.4, 4.8, 'a');
      for (const [x, y] of [[7, 1], [3, 4], [11, 4], [4, 8], [10, 8]]) p.ellipse(x + 0.5, y + 0.5, 1.6, 1.6, 'w');
      p.ellipse(7.5, 6, 2.2, 2, 'A');
      // 가운데 초승달
      p.pts([[8, 4], [7, 5], [7, 6], [8, 7]], 'y');
      p.set(f ? 2 : 12, f ? 1 : 2, 'y');
    });
  }
  def('iconMoonFlower', 16, 16, (p) => {
    p.vline(8, 10, 15, 'G');
    p.pts([[6, 13], [5, 12], [10, 13], [11, 12]], 'g');
    p.ellipse(8, 6.5, 5.6, 5, 'a');
    for (const [x, y] of [[8, 1], [3, 4], [12, 4], [4, 9], [11, 9]]) p.ellipse(x + 0.5, y + 0.5, 1.7, 1.7, 'w');
    p.ellipse(8, 6.5, 2.4, 2.2, 'A');
    p.pts([[9, 5], [8, 6], [8, 7], [9, 8]], 'y');
  });
  // 분홍색 달콤한 마법 포션
  def('iconSweetPotion', 16, 16, (p) => {
    p.rect(6, 0, 4, 2, 't');
    p.rect(6, 2, 4, 3, 'a');
    p.ellipse(8, 10.5, 6, 5.2, 'a');
    p.ellipse(8, 11, 5.2, 4.4, 'q');
    p.ellipse(7, 9.5, 2.2, 1.4, 'P', true);
    heart(p, 6, 10, 'w', null);
    p.pts([[3, 9], [3, 10]], 'w');
    p.set(13, 3, 'y'); p.set(1, 4, 'y');
    p.hline(5, 10, 5, 'Q');
  });
  def('sweetPotionSmall', 10, 13, (p) => {
    p.rect(4, 0, 2, 2, 't');
    p.rect(4, 2, 2, 2, 'a');
    p.ellipse(5, 8, 4, 3.6, 'q');
    p.set(3, 7, 'w'); p.set(5, 8, 'w');
  });
  def('heartFx', 5, 4, (p) => heart(p, 0, 0, 'q', 'P'), false);
};
