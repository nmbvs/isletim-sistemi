// ==================== PENCERE YÖNETİMİ & KISAYOLLAR ====================

// ESC → Aktif Pencereyi Kapat/Küçült (Son açılanı)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        let topWin = null, maxZ = -1;
        document.querySelectorAll('.window').forEach(win => {
            if (win.style.display !== 'none' && win.style.visibility !== 'hidden') {
                const z = parseInt(win.style.zIndex || 0);
                if (z > maxZ) {
                    maxZ = z;
                    topWin = win;
                }
            }
        });
        if (topWin) closeWindow(topWin.id);
    }
});

// ==================== DURUM DEĞİŞKENLERİ ====================
let highestZIndex = 100;
let openWindows   = {};
let currentWallpaper = 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)';
let currentTheme  = { main: '#0078D7', dark: '#005a9e' };
let clockFormat   = '24';

// ==================== SAAT ====================
function updateClock() {
    const el      = document.getElementById('clock');
    const now     = new Date();
    const hours   = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2,'0');
    const seconds = String(now.getSeconds()).padStart(2,'0');
    const day     = String(now.getDate()).padStart(2,'0');
    const month   = String(now.getMonth()+1).padStart(2,'0');
    const year    = now.getFullYear();

    let timeStr;
    if (clockFormat === '12') {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h12  = hours % 12 || 12;
        timeStr = `${h12}:${minutes} ${ampm}`;
    } else {
        timeStr = `${String(hours).padStart(2,'0')}:${minutes}`;
    }
    el.innerHTML = `<div>${timeStr}</div><div style="font-size:10px;opacity:.7;">${day}.${month}.${year}</div>`;
}
setInterval(updateClock, 1000);
updateClock();

// ==================== BAŞLAT MENÜSÜ ====================
function toggleStartMenu() {
    const m = document.getElementById('start-menu');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

// Dışarıya tıklayınca menüyü kapat
document.addEventListener('click', (e) => {
    const menu     = document.getElementById('start-menu');
    const startBtn = document.querySelector('.start-button');
    if (!menu.contains(e.target) && !startBtn.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// Uygulama arama (başlat menüsünde)
function filterApps(q) {
    const tiles = document.querySelectorAll('.metro-tile');
    tiles.forEach(t => {
        const name = t.querySelector('span').textContent.toLowerCase();
        t.style.display = name.includes(q.toLowerCase()) ? 'flex' : 'none';
    });
}

// ==================== PENCERE YÖNETİMİ ====================
function openWindow(id) {
    const win = document.getElementById(id);
    win.style.display = 'flex';
    win.style.visibility = 'visible';
    bringToFront(win);
    addTaskbarBtn(id);
    openWindows[id] = true;

    // Ayarlar penceresi için ekran boyutunu doldur
    if (id === 'settings-window') {
        const el = document.getElementById('screen-res');
        if (el) el.textContent = `${screen.width} × ${screen.height}`;
    }
}

function closeWindow(id) {
    const win = document.getElementById(id);
    win.style.display = 'none';
    delete openWindows[id];
    removeTaskbarBtn(id);
}

function minimizeWindow(id) {
    const win = document.getElementById(id);
    win.style.visibility = 'hidden';
    const btn = document.querySelector(`.taskbar-app-btn[data-id="${id}"]`);
    if (btn) btn.classList.remove('active');
}

function maximizeWindow(id) {
    const win = document.getElementById(id);
    if (win.dataset.maximized === 'true') {
        // Geri ye
        win.style.top    = win.dataset.prevTop;
        win.style.left   = win.dataset.prevLeft;
        win.style.width  = win.dataset.prevWidth;
        win.style.height = win.dataset.prevHeight;
        win.dataset.maximized = 'false';
    } else {
        // Kaydet
        win.dataset.prevTop    = win.style.top;
        win.dataset.prevLeft   = win.style.left;
        win.dataset.prevWidth  = win.style.width;
        win.dataset.prevHeight = win.style.height;
        // Tam ekran
        win.style.top    = '0';
        win.style.left   = '0';
        win.style.width  = '100vw';
        win.style.height = 'calc(100vh - 48px)';
        win.dataset.maximized = 'true';
    }
}

function bringToFront(el) {
    highestZIndex++;
    el.style.zIndex = highestZIndex;
}

// Görev çubuğuna buton ekle / kaldır
function addTaskbarBtn(id) {
    if (document.querySelector(`.taskbar-app-btn[data-id="${id}"]`)) {
        const btn = document.querySelector(`.taskbar-app-btn[data-id="${id}"]`);
        btn.classList.add('active');
        return;
    }
    const icons = { 'browser-window': 'fa-chrome', 'terminal-window': 'fa-terminal',
                    'settings-window': 'fa-gear',   'about-window': 'fa-circle-info',
                    'notepad-window': 'fa-file-lines', 'calc-window': 'fa-calculator',
                    'folder-window': 'fa-folder-open' };
    const names  = { 'browser-window': 'Tarayıcı', 'terminal-window': 'Terminal',
                     'settings-window': 'Ayarlar',  'about-window': 'Hakkında',
                     'notepad-window': 'Not Defteri', 'calc-window': 'Hesap Makinesi',
                     'folder-window': 'Dosya Gezgini' };
    const btn = document.createElement('button');
    btn.className = 'taskbar-app-btn active';
    btn.dataset.id = id;
    const brandIcons = ['fa-chrome'];
    const prefix = brandIcons.includes(icons[id]) ? 'fa-brands' : 'fa-solid';
    btn.innerHTML = `<i class="${prefix} ${icons[id] || 'fa-window-maximize'}"></i>${names[id] || id}`;
    btn.onclick = () => {
        const win = document.getElementById(id);
        if (win.style.visibility === 'hidden') {
            win.style.visibility = 'visible';
            btn.classList.add('active');
        } else {
            bringToFront(win);
        }
    };
    document.getElementById('taskbar-apps').appendChild(btn);
}

function removeTaskbarBtn(id) {
    const btn = document.querySelector(`.taskbar-app-btn[data-id="${id}"]`);
    if (btn) btn.remove();
}

// ==================== SÜRÜKLEME ====================
let isDragging = false, dragWin = null, offX = 0, offY = 0;

function dragWindow(e, id) {
    if (e.target.tagName === 'BUTTON') return;
    dragWin = document.getElementById(id);
    bringToFront(dragWin);
    isDragging = true;
    const r = dragWin.getBoundingClientRect();
    offX = e.clientX - r.left;
    offY = e.clientY - r.top;
}

document.addEventListener('mousemove', (e) => {
    if (isDragging && dragWin) {
        dragWin.style.left = Math.max(0, e.clientX - offX) + 'px';
        dragWin.style.top  = Math.max(0, e.clientY - offY) + 'px';
    }
});
document.addEventListener('mouseup', () => { isDragging = false; dragWin = null; });

// Pencere tıklanınca öne getir
document.querySelectorAll('.window').forEach(win => {
    win.addEventListener('mousedown', () => bringToFront(win));
});

// ==================== TARAYICI ====================
function navigateBrowser() {
    let url = document.getElementById('url-input').value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.') && !url.includes(' ')) {
            url = 'https://' + url;
        } else {
            url = `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
        }
    }
    document.getElementById('url-input').value = url;
    document.getElementById('browser-frame').src = url;
}

document.getElementById('url-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigateBrowser();
});

function goTo(url) {
    document.getElementById('url-input').value = url;
    document.getElementById('browser-frame').src = url;
}

function browserBack()    { document.getElementById('browser-frame').goBack(); }
function browserForward() { document.getElementById('browser-frame').goForward(); }
function browserRefresh() { document.getElementById('browser-frame').reload(); }

// URL çubuğunu otomatik senkronize etmek için Webview Event Listener
document.addEventListener('DOMContentLoaded', () => {
    const webview = document.getElementById('browser-frame');
    if (webview) {
        webview.addEventListener('did-navigate', (e) => {
            document.getElementById('url-input').value = e.url;
        });
        webview.addEventListener('did-navigate-in-page', (e) => {
            document.getElementById('url-input').value = e.url;
        });
    }
});

// ==================== TERMİNAL ====================
const terminalCommands = {
    help: () => [
        {t:'response', v:'Kullanılabilir komutlar:'},
        {t:'response', v:'  cls      - Ekranı temizle'},
        {t:'response', v:'  dir      - Dosyaları listele'},
        {t:'response', v:'  date     - Tarih göster'},
        {t:'response', v:'  time     - Saat göster'},
        {t:'response', v:'  sysinfo  - Sistem bilgisi'},
        {t:'response', v:'  echo     - Metni tekrarla'},
        {t:'response', v:'  ping     - Ağ bağlantısı testi'},
        {t:'response', v:'  help     - Bu yardım menüsü'},
    ],
    date: () => [{t:'response', v: new Date().toLocaleDateString('tr-TR', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}],
    time: () => [{t:'response', v: new Date().toLocaleTimeString('tr-TR')}],
    dir : () => [
        {t:'response', v:'Dizin: C:\\OS'},
        {t:'response', v:''},
        {t:'response', v:'<DIR>   Windows'},
        {t:'response', v:'<DIR>   Belgeler'},
        {t:'response', v:'<DIR>   Kullanıcılar'},
        {t:'response', v:'        boot.asm          680 byte'},
        {t:'response', v:'        boot.bin          512 byte'},
        {t:'response', v:'        main.cpp       17.691 byte'},
        {t:'response', v:'        IsletimSistemi.exe 293 KB'},
    ],
    sysinfo: () => [
        {t:'response', v:`OS Adı:    Kişisel İşletim Sistemi v2.0`},
        {t:'response', v:`Geliştirici: Neslihan Merve Baycan`},
        {t:'response', v:`Çekirdek:  Assembly + C++ + HTML5`},
        {t:'response', v:`Ekran:     ${screen.width}x${screen.height}`},
        {t:'response', v:`Platform:  ${navigator.platform}`},
    ],
    ping: () => [
        {t:'response', v:'Ping testi başlatılıyor (bing.com)...'},
        {t:'response', v:'Yanıt alındı: 32 ms'},
        {t:'response', v:'Yanıt alındı: 31 ms'},
        {t:'response', v:'Yanıt alındı: 30 ms'},
        {t:'response', v:'İstatistikler: Paket Gönderilen=3, Alınan=3, Kayıp=%0'},
    ],
};

function handleTerminalCmd(e) {
    if (e.key !== 'Enter') return;

    const inputEl  = document.getElementById('terminal-input');
    const content  = document.getElementById('terminal-content');
    const inputLine = document.getElementById('terminal-input-line');
    const raw      = inputEl.value.trim();
    const cmd      = raw.toLowerCase().split(' ')[0];
    const args     = raw.split(' ').slice(1).join(' ');

    // Komutu ekrana yaz
    const cmdEl = document.createElement('div');
    cmdEl.className = 'terminal-line cmd';
    cmdEl.innerHTML = `<span class="prompt">C:\\OS&gt; </span>${raw}`;
    content.insertBefore(cmdEl, inputLine);

    inputEl.value = '';

    // Boş giriş
    if (!raw) { content.scrollTop = 999999; return; }

    // cls - özel
    if (cmd === 'cls') {
        content.querySelectorAll('.terminal-line').forEach(el => el.remove());
        content.scrollTop = 999999;
        return;
    }

    // echo - özel
    if (cmd === 'echo') {
        const res = document.createElement('div');
        res.className = 'terminal-line response';
        res.textContent = args || '';
        content.insertBefore(res, inputLine);
        content.scrollTop = 999999;
        return;
    }

    // Diğer komutlar
    let lines = terminalCommands[cmd]
        ? terminalCommands[cmd]()
        : [{t:'error', v:`'${raw}' iç veya dış komut olarak tanınmıyor.`}];

    lines.forEach(line => {
        const el = document.createElement('div');
        el.className = `terminal-line ${line.t}`;
        el.textContent = line.v;
        content.insertBefore(el, inputLine);
    });
    content.scrollTop = 999999;
}

// ==================== AYARLAR ====================
function showSettingsTab(tab) {
    document.querySelectorAll('.settings-tab').forEach(t => t.style.display = 'none');
    document.getElementById(`tab-${tab}`).style.display = 'block';
    document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// Duvar Kağıdı
function setWallpaper(gradient) {
    document.body.style.background = gradient;
    currentWallpaper = gradient;
}

function applyCustomWallpaper() {
    const c1 = document.getElementById('custom-color-1').value;
    const c2 = document.getElementById('custom-color-2').value;
    setWallpaper(`linear-gradient(135deg, ${c1}, ${c2})`);
}

// Tema Rengi
function setTheme(mainColor, darkColor) {
    currentTheme = { main: mainColor, dark: darkColor };
    const taskbar = document.getElementById('taskbar');
    // Görev çubuğu rengi de değişsin
    document.querySelectorAll('.start-button:hover').forEach(el => {
        el.style.background = mainColor;
    });
    // CSS değişkeni olarak ayarla
    document.documentElement.style.setProperty('--accent', mainColor);
    document.documentElement.style.setProperty('--accent-dark', darkColor);
    // Başlat menüsü arka planı
    document.getElementById('start-menu').style.background =
        `rgba(${hexToRgb(mainColor)}, 0.94)`;
    // Onay göster
    alert(`Tema "${mainColor}" olarak ayarlandı!`);
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r}, ${g}, ${b}`;
}

// İkon boyutu
function setIconSize(size) {
    document.querySelectorAll('.icon').forEach(el => {
        el.style.width  = size + 'px';
        el.style.height = (parseInt(size) + 15) + 'px';
        el.querySelector('i').style.fontSize = (parseInt(size) * 0.48) + 'px';
    });
}

// İkon yazısı göster/gizle
function toggleIconLabels() {
    const show = document.getElementById('icon-label-toggle').checked;
    document.querySelectorAll('.icon span').forEach(s => {
        s.style.display = show ? 'block' : 'none';
    });
}

// Saat formatı
document.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('clock-format');
    if (sel) sel.addEventListener('change', (e) => { clockFormat = e.target.value; });
});

// ==================== SAĞ TIK VE EKLENTİLER ====================
let rightClickX = 0, rightClickY = 0;
let currentSelectedIcon = null;

document.getElementById('desktop').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const menu1 = document.getElementById('context-menu');
    const menu2 = document.getElementById('icon-context-menu');
    if(menu1) menu1.style.display = 'none';
    if(menu2) menu2.style.display = 'none';

    const iconEl = e.target.closest('.icon.custom-icon');
    let menu = null;

    if (iconEl) {
        currentSelectedIcon = iconEl;
        menu = menu2;
    } else if (e.target.id === 'desktop') {
        menu = menu1;
    }

    if(menu) {
        menu.style.display = 'flex';
        rightClickX = e.clientX;
        rightClickY = e.clientY;
        if (rightClickX + menu.offsetWidth > window.innerWidth) rightClickX -= menu.offsetWidth;
        if (rightClickY + menu.offsetHeight > window.innerHeight) rightClickY -= menu.offsetHeight;
        menu.style.left = rightClickX + 'px';
        menu.style.top  = rightClickY + 'px';
    }
});

document.addEventListener('click', (e) => {
    const rm1 = document.getElementById('context-menu');
    const rm2 = document.getElementById('icon-context-menu');
    if (rm1 && !rm1.contains(e.target)) rm1.style.display = 'none';
    if (rm2 && !rm2.contains(e.target)) rm2.style.display = 'none';

    const qs = document.getElementById('quick-settings-panel');
    const qsBtn = document.getElementById('qs-btn');
    if (qs && qsBtn && !qs.contains(e.target) && !qsBtn.contains(e.target)) qs.style.display = 'none';

    const ac = document.getElementById('action-center-panel');
    const clockBtn = document.getElementById('clock-btn');
    const acBtn = document.getElementById('ac-btn');
    if (ac && clockBtn && acBtn && !ac.contains(e.target) && !clockBtn.contains(e.target) && !acBtn.contains(e.target)) ac.style.display = 'none';

    // Ses Paneli
    const volWidget = document.getElementById('volume-widget');
    const volPopup = document.getElementById('volume-popup');
    if (volWidget && volPopup && !volWidget.contains(e.target)) {
        volPopup.classList.remove('open');
    }
});

function generateId() { return 'icon_' + Math.random().toString(36).substr(2, 9); }

function createDesktopItem(type, idStr = null, left = null, top = null, labelText = null) {
    const desktop = document.getElementById('desktop');
    const el = document.createElement('div');
    el.className = 'icon custom-icon';
    el.id = idStr || generateId();
    el.dataset.type = type;
    
    if (left !== null && top !== null) {
        el.style.position = 'absolute';
        el.style.left = left;
        el.style.top = top;
    }

    let text = labelText;
    if (!text) {
        let count = document.querySelectorAll('.custom-icon[data-type="' + type + '"]').length + 1;
        text = type === 'folder' ? 'Yeni Klasör ' + count : 'Metin Belgesi ' + count;
    }

    if (type === 'folder') {
        el.innerHTML = '<i class="fa-solid fa-folder" style="color:#F8D775;"></i><span>' + text + '</span>';
        el.onclick = () => openFolder(el.id, text);
    } else {
        el.innerHTML = '<i class="fa-solid fa-file-lines" style="color:#fff;"></i><span>' + text + '</span>';
        el.onclick = () => openNotepad(el.id, text);
    }
    
    desktop.appendChild(el);
    makeDraggableIcon(el);
    saveDesktopState();

    const menu = document.getElementById('context-menu');
    if(menu) menu.style.display = 'none';
}

function makeDraggableIcon(icon) {
    let isDragging = false, offX, offY;
    icon.onmousedown = function(e) {
        if(e.button !== 0) return; // Sadece sol tık ile sürükle
        isDragging = true;
        if(icon.style.position !== 'absolute') {
            const rect = icon.getBoundingClientRect();
            icon.style.position = 'absolute';
            icon.style.left = rect.left + 'px';
            icon.style.top = rect.top + 'px';
        }
        offX = e.clientX - parseInt(icon.style.left || 0);
        offY = e.clientY - parseInt(icon.style.top || 0);
    }
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        icon.style.left = (e.clientX - offX) + 'px';
        icon.style.top = (e.clientY - offY) + 'px';
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            saveDesktopState();
        }
    });
}

function deleteSelectedIcon() {
    if (currentSelectedIcon) {
        currentSelectedIcon.remove();
        currentSelectedIcon = null;
        saveDesktopState();
    }
    const menu = document.getElementById('icon-context-menu');
    if(menu) menu.style.display = 'none';
}

function renameSelectedIcon() {
    if (currentSelectedIcon) {
        const span = currentSelectedIcon.querySelector('span');
        const newName = prompt('Yeni adı girin:', span.textContent);
        if (newName && newName.trim() !== '') {
            span.textContent = newName.trim();
            saveDesktopState();
        }
    }
    const menu = document.getElementById('icon-context-menu');
    if(menu) menu.style.display = 'none';
}

function saveDesktopState() {
    const icons = [];
    document.querySelectorAll('.custom-icon').forEach(icon => {
        icons.push({
            id: icon.id,
            type: icon.dataset.type,
            left: icon.style.left || 'auto',
            top: icon.style.top || 'auto',
            text: icon.querySelector('span').textContent
        });
    });
    localStorage.setItem('os_desktop_icons', JSON.stringify(icons));
}

function loadDesktopState() {
    const data = localStorage.getItem('os_desktop_icons');
    if (data) {
        try {
            const icons = JSON.parse(data);
            icons.forEach(i => {
                createDesktopItem(i.type, i.id, i.left, i.top, i.text);
            });
        } catch(e) { console.error("Ikonlar yuklenemedi", e); }
    }
}
window.addEventListener('DOMContentLoaded', loadDesktopState);

// ==================== DOSYALAMA / NOT DEFTERİ ====================
let currentNotepadId = null;

function openNotepad(noteId = null, title = null) {
    if (!noteId) {
        noteId = 'system_notepad_default'; // Start menüsünden açıldığındaki ortak sayfa
        title  = 'Yeni Not';
    }
    currentNotepadId = noteId;
    const content = localStorage.getItem('os_note_' + noteId) || "";
    document.getElementById('notepad-textarea').value = content;
    document.getElementById('notepad-title').textContent = title + " - Not Defteri";
    openWindow('notepad-window');
}

function saveNotepadContent() {
    if (currentNotepadId) {
        const content = document.getElementById('notepad-textarea').value;
        localStorage.setItem('os_note_' + currentNotepadId, content);
    }
}

// ==================== DOSYA GEZGİNİ (KLASÖR) ====================
let currentOpenFolderId = null;

function openFolder(folderId, title) {
    currentOpenFolderId = folderId;
    document.getElementById('folder-title').textContent = title;
    renderFolderNotes();
    openWindow('folder-window');
}

function createNoteInFolder() {
    if (!currentOpenFolderId) return;
    const folderNotesJSON = localStorage.getItem('os_folder_notes') || "{}";
    let allNotes = {};
    try { allNotes = JSON.parse(folderNotesJSON); } catch(e) {}
    
    if (!allNotes[currentOpenFolderId]) allNotes[currentOpenFolderId] = [];
    const newNote = {
        id: generateId(),
        title: 'Yeni Metin Belgesi ' + (allNotes[currentOpenFolderId].length + 1)
    };
    allNotes[currentOpenFolderId].push(newNote);
    
    localStorage.setItem('os_folder_notes', JSON.stringify(allNotes));
    renderFolderNotes();
}

function renderFolderNotes() {
    const container = document.getElementById('folder-content');
    container.innerHTML = '';
    if (!currentOpenFolderId) return;

    const folderNotesJSON = localStorage.getItem('os_folder_notes') || "{}";
    let allNotes = {};
    try { allNotes = JSON.parse(folderNotesJSON); } catch(e) {}
    const notes = allNotes[currentOpenFolderId] || [];

    if (notes.length === 0) {
        container.innerHTML = '<div style="color:#888; font-size:14px; width:100%; text-align:center; margin-top:50px;">Bu klasör tamamen boş.</div>';
        return;
    }

    notes.forEach(note => {
        const el = document.createElement('div');
        el.className = 'folder-item';
        el.style.cssText = 'width:80px; height:90px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; border-radius:5px; padding:5px; transition:0.2s; color:#333; text-align:center;';
        el.onmouseover = () => el.style.background = 'rgba(0,120,215,0.1)';
        el.onmouseout  = () => el.style.background = 'transparent';
        
        el.innerHTML = '<i class="fa-solid fa-file-lines" style="font-size:38px; color:#555; margin-bottom:8px;"></i><span style="font-size:11px; word-wrap:break-word; line-height:1.3;">' + note.title + '</span>';
        
        el.onclick = () => openNotepad(note.id, note.title);
        container.appendChild(el);
    });
}

// ==================== HESAP MAKİNESİ ====================
let calcFirstOp = null, calcAction = null, calcResetNext = false;
function calcNum(n) {
    const cur = document.getElementById('calc-current');
    if (cur.textContent === '0' || calcResetNext) {
        cur.textContent = n; calcResetNext = false;
    } else { cur.textContent += n; }
}
function calcOp(op) {
    const cur = document.getElementById('calc-current'), hist = document.getElementById('calc-history');
    if (calcAction && !calcResetNext) calcEqual();
    calcFirstOp = parseFloat(cur.textContent);
    calcAction = op;
    hist.textContent = cur.textContent + ' ' + op;
    calcResetNext = true;
}
function calcEqual() {
    if (!calcAction || calcFirstOp === null) return;
    const cur = document.getElementById('calc-current'), hist = document.getElementById('calc-history');
    const secondOp = parseFloat(cur.textContent);
    let res = 0;
    if (calcAction === '+') res = calcFirstOp + secondOp;
    if (calcAction === '-') res = calcFirstOp - secondOp;
    if (calcAction === '*') res = calcFirstOp * secondOp;
    if (calcAction === '/') res = calcFirstOp / secondOp;
    if (calcAction === '%') res = calcFirstOp % secondOp;
    hist.textContent = '';
    cur.textContent = Math.round(res * 1000000) / 1000000;
    calcFirstOp = null; calcAction = null; calcResetNext = true;
}
function calcClear() {
    document.getElementById('calc-current').textContent = '0';
    document.getElementById('calc-history').textContent = '';
    calcFirstOp = null; calcAction = null;
}
function calcDel() {
    const cur = document.getElementById('calc-current');
    if (cur.textContent.length > 1 && !calcResetNext) cur.textContent = cur.textContent.slice(0, -1);
    else cur.textContent = '0';
}

// ==================== PİL GÖSTERGESİ (Battery API) ====================
function updateBatteryUI(battery) {
    const pct    = Math.round(battery.level * 100);
    const fill   = document.getElementById('battery-fill');
    const pctEl  = document.getElementById('battery-pct');
    const bolt   = document.getElementById('battery-bolt');
    const qsPct  = document.getElementById('qs-battery-text');

    if(pctEl) pctEl.textContent = pct + '%';
    if(fill)  fill.style.width  = pct + '%';
    if(qsPct) qsPct.textContent = 'Pil: ' + pct + '%' + (battery.charging ? ' (Şarj oluyor)' : '');

    // Renk: kırmızı < 20%, sarı < 40%, yeşil üzeri
    if(fill) {
        if (pct <= 20)      fill.style.background = '#f44336';
        else if (pct <= 40) fill.style.background = '#FF9800';
        else                fill.style.background = '#4CAF50';
    }

    if(bolt) bolt.style.display = battery.charging ? 'inline' : 'none';
}

function initBattery() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then((battery) => {
            updateBatteryUI(battery);
            battery.addEventListener('levelchange',    () => updateBatteryUI(battery));
            battery.addEventListener('chargingchange', () => updateBatteryUI(battery));
        });
    } else {
        // Desteklenmiyorsa
        const pctEl = document.getElementById('battery-pct');
        const fill  = document.getElementById('battery-fill');
        const qsPct = document.getElementById('qs-battery-text');
        
        if(pctEl) pctEl.textContent  = 'PC';
        if(fill)  fill.style.width = '100%';
        if(qsPct) qsPct.textContent = 'Pil durumu tarayıcı/sistem tarafından desteklenmiyor.';
    }
}
initBattery();

// ==================== HIZLI AYARLAR & SES KONTROLÜ ====================
let isMuted    = false;
let lastVolume = 80;

function updateVolume(val) {
    lastVolume = parseInt(val);
    const icon  = document.getElementById('volume-icon');
    const label = document.getElementById('volume-label');
    if (label) label.textContent = val + '%';

    // Yeni eklenti: Hızlı Ayarlar Senkronizasyonu
    const qsSlider = document.getElementById('qs-volume-slider');
    const qsLabel  = document.getElementById('qs-volume-label');
    if (qsSlider) qsSlider.value = val;
    if (qsLabel) qsLabel.textContent = val + '%';

    isMuted = false;
    if (val == 0) {
        if(icon) icon.className = 'fa-solid fa-volume-xmark'; isMuted = true;
    } else if (val < 40) {
        if(icon) icon.className = 'fa-solid fa-volume-low';
    } else {
        if(icon) icon.className = 'fa-solid fa-volume-high';
    }
    // Hızlı ayarlar ve kendi popup sliderları senkronize!
    const slider = document.getElementById('volume-slider');
    if (slider && slider.value != val) slider.value = val;
}

function toggleMute() {
    const slider = document.getElementById('volume-slider');
    if (isMuted) {
        if(slider) slider.value = lastVolume;
        updateVolume(lastVolume);
    } else {
        if(slider) lastVolume = parseInt(slider.value);
        if(slider) slider.value = 0;
        updateVolume(0);
    }
}

function toggleQuickSettings() {
    const qs = document.getElementById('quick-settings-panel');
    qs.style.display = qs.style.display === 'flex' ? 'none' : 'flex';
    document.getElementById('action-center-panel').style.display = 'none';
}

function toggleActionCenter() {
    const ac = document.getElementById('action-center-panel');
    ac.style.display = ac.style.display === 'flex' ? 'none' : 'flex';
    document.getElementById('quick-settings-panel').style.display = 'none';
}

let nightModeOn = false;
function toggleNightMode() {
    nightModeOn = !nightModeOn;
    const btn = document.getElementById('nightmode-btn');
    if (nightModeOn) {
        btn.style.background = 'rgba(0,120,215,0.8)';
        document.body.style.filter = 'sepia(30%) hue-rotate(-10deg) saturate(120%) brightness(95%)';
    } else {
        btn.style.background = 'rgba(255,255,255,0.1)';
        document.body.style.filter = 'none';
    }
}

function updateBrightness(val) {
    document.getElementById('qs-brightness-label').textContent = val + '%';
    document.getElementById('desktop').style.filter = `brightness(${val}%)`;
}
