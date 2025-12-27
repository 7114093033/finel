# Development Log

## 2025-12-27
- 目標/背景：打造一頁式 BPM & 節拍分析工具，使用者上傳音檔即可預測 BPM 並視覺化節拍位置，方便快速評估節奏。
- 架構/技術：以 Streamlit (`app.py`) 為 UI 框架；訊號處理核心用 `librosa`（`beat_track` 偵測節拍）、`numpy`；繪圖用 `matplotlib` + `librosa.display`，整體採深色主題。
- 介面：`st.set_page_config` 設定標題與 icon，主頁有上傳元件（支援 `mp3`/`wav`/`ogg`/`flac`/`m4a`）與內嵌播放區；主標與簡述引導使用者操作。
- 互動流程：上傳後點擊「Analyze Audio」才觸發分析，按鈕包裝 spinner，避免自動運算佔用資源；失敗時顯示 `st.error`，成功則用 `st.metric` 展示 BPM。
- 分析邏輯：將上傳檔讀入 BytesIO，`librosa.load` 以原始採樣率載入並單聲道化；`beat_track` 取得 tempo 與 beat frames，再轉為時間戳 `frames_to_time`。回傳 BPM、波形、採樣率與節拍時間。
- 視覺化：`waveshow` 呈現波形，節拍以 `vlines` 疊加虛線；統一背景為深色，調整軸、格線、圖例與 tick 顏色，符合 Streamlit 預設深色外觀。
- 資料/錯誤防護：分析區塊包 try/except，確保未知音檔格式或解碼問題時能顯示錯誤訊息而不中斷應用；預設提示空態資訊引導上傳。
- 依賴/環境：`requirements.txt` 鎖定 `streamlit`, `librosa`, `matplotlib`, `numpy`, `soundfile`, `scipy`；`.gitignore` 排除 Python/Node/IDE 暫存、建置輸出與系統檔，方便未來加入前端套件或其他工具時維持乾淨版本控管。
- 待辦/延伸：可加入快取避免重複分析同檔、支援多檔批次與結果匯出（節拍時間 CSV）、顯示節奏穩定度/能量譜圖、客製化主題（亮色/配色切換）、以及為長音檔新增分段處理與進度指示。
- 已知風險/注意事項：長音檔或高取樣率可能使節拍偵測耗時；部分稀有格式需要 `soundfile` 依賴的後端支援；瀏覽器端上傳大小受 Streamlit 伺服器設定限制。
- 手動驗證：以短版 `wav/mp3` 測試，確認 BPM 顯示、波形與節拍線對齊；檢查錯誤路徑能正常捕捉例外並回報。
- 部署提示：若在低規主機運行，可限制上傳大小或加入粗略預檢；未來若要雲端部署，可新增健康檢查路由與簡易快取策略。
