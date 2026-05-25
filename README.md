[English Documentation](./README.en.md)

# 紳士打碼 v2.2.0

![紳士打碼 Logo](./logo-Photoroom.png)

## 線上 Demo
- https://gentleman-mosaic.vercel.app/

## 介面預覽
![UI Demo](./UI.PNG)

## 更新資訊
- 版本：`v2.2.0`
- 更新日期：`2026-05-25`

### v2.2.0 新功能重點：4K 大圖效能升級
- 針對 4K / 高解析圖片操作重新優化：框選、塗抹、滑鼠 hover 不再反覆重算整張圖片。
- 效果預覽加入快取機制，只有選區、效果參數或圖片內容改變時才更新，大幅降低拖曳時的卡頓感。
- Canvas 重繪改用 `requestAnimationFrame` 節流，操作節奏更貼近螢幕刷新率，筆刷移動更順。
- 大圖歷史紀錄會自動控制快照數量，避免 4K 圖片連續 Undo/Redo 時吃爆記憶體。
- 仍保留完整解析度輸出：互動變順，不犧牲下載成品品質。

### v2.1.0 新功能重點
- 設定面板改為右上角 icon（齒輪）
- 新增關於我 icon，並改為彈跳視窗（可按 `X`、遮罩、`Esc` 關閉）
- 語言與 Dark/Light 設定可寫入 `launch.ini` 並於下次啟動自動套用
- 新增選取方向切換：正向 / 反向
- 新增選取操作切換：加選 / 減選
- 新增快捷鍵：`Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y` / `Ctrl+X`、`Space+左鍵拖移`
- 歷史回溯修正：Undo/Redo 可正確回復當次提示區域（待處理區域）
- 馬賽克演算法修正，顆粒效果對齊 [PEKO-STEP](https://www.peko-step.com/tool/imageeditor/index.php?lang=zhtw&type=19) 風格
- 圖片檢視優化：支援拖移平移檢視
- 深色模式配色優化，特別是中間圖片區塊網底更柔和

### v2.0.0 新功能重點
- 批次上傳與圖片切換（最多 30 張）
- 每張圖片各自保存：待處理區域、歷史回溯（Undo/Redo）
- 縮圖右鍵選單：刪除圖片、下載該圖處理後結果
- 縮圖快捷選取：左鍵選擇、`Ctrl + 左鍵` 多選、`Shift + 左鍵` 區間選取、`Ctrl + A` 全選
- 支援 NSFW 自動偵測（NudeNet）：可調偵測閾值、模型 `320n` / `640m`
- 打碼方式：馬賽克、海苔（顏色、透明度、寬度、間隔、方向可調）
- 選取模式：框選、塗抹（圓形/方形筆刷）
- 支援深色模式與中英文介面切換

## 系統需求
- Windows（含 `.bat` 啟動流程）
- Python 3.9+（建議 3.10+）
- 可連網下載 Python 套件（第一次啟動時）

## 安裝與啟動（建議）

### 一鍵啟動（Standalone）
1. 進入專案根目錄。
2. 確認有下列檔案：`start_app.bat`、`launch.ini`、`standalone.html`。
3. 直接雙擊 `start_app.bat`。
4. 腳本會自動讀取設定、建立 `.venv`、安裝依賴、啟動後端，並開啟 `standalone.html`。

### `launch.ini` 主要設定
```ini
[backend]
enabled=1
use_venv=1
venv_dir=.venv
create_venv=1
python_cmd=python
host=127.0.0.1
port=7400
reload=0
auto_install_deps=1
```

說明：
- `port` 會同步寫入 `runtime-config.js`，前端會使用該埠連線後端。
- 想關閉後端可設 `enabled=0`（僅做手動打碼編輯）。

## 開發模式（Standalone/Vite）
```bash
npm install
npm run dev
```

開啟：
```text
http://localhost:5173/standalone.html
```

注意：目前正式功能集中在 `standalone.html`。`src/App.jsx` 是早期/簡化 React 版本，沒有批次、NSFW 偵測、海苔、語言與主題設定等完整功能。

### 打包
```bash
npm run build
npm run preview
```

## 掛載到線上網頁（部署）

### Vercel（推薦）
1. 推送專案到 GitHub。
2. 到 Vercel 匯入該 repo。
3. Framework 選 `Vite`（已提供 `vercel.json`）。
4. Build Command：`npm run build`
5. Output Directory：`dist`
6. Deploy 後即可拿到公開網址。

注意：Vercel/Netlify 只會部署前端靜態檔。NSFW 自動偵測需要本機 `start_app.bat` 啟動的 FastAPI 後端，線上 Demo 不會自動附帶後端推論服務。

### Netlify
1. 推送專案到 GitHub。
2. 到 Netlify 建立 `New site from Git`。
3. Build command：`npm run build`
4. Publish directory：`dist`
5. 已提供 `netlify.toml`，含 SPA fallback（`/* -> /index.html`）。

### 本機先驗證 production build
```bash
npm run build
npm run preview
```

## 使用流程
1. 批次上傳圖片或拖曳圖片到畫布區。
2. 在上方縮圖列選擇要編輯的圖片。
3. 選擇打碼效果（馬賽克 / 海苔）。
4. 用框選或塗抹建立待處理區域。
5. 按「確定套用」完成本次打碼。
6. 需要時可用 Undo / Redo 回溯。
7. 右鍵縮圖可刪除或下載處理後圖片。

## 注意事項
- 第一次啟動會下載 Python 套件，時間較久屬正常。
- 若 Python 指令不是 `python`，可在 `launch.ini` 調整 `python_cmd`。
- 批次上限為 30 張，超過會提示並忽略多餘檔案。
