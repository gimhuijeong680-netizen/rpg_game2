// PNG 스프라이트 시트 로딩 (assets/ 폴더, 좌표는 js/data/atlas.js)
PK.assets = {
  images: {},

  load() {
    const entries = Object.entries(PK.atlas.sheets);
    return Promise.all(entries.map(([name, src]) => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { PK.assets.images[name] = img; resolve(); };
      img.onerror = () => reject(new Error('에셋을 불러오지 못했어요: ' + src));
      img.src = src;
    })));
  },
};
