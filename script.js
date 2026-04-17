// ================= 配置区域 =================
const fonts = [
    { folder: 'moon-stars-kai-hw', name: '月星楷 HW', family: 'Moon Stars Kai HW' },
    { folder: 'ping-fang-ying-feng', name: '平方迎风体', family: 'PING FANG YING FENG' },
    { folder: 'planschrift', name: '遍玨体', family: 'Planschrift' },
    { folder: '851tegaki_zatsu', name: '851 手写杂书体', family: '851tegakizatsu' },
    { folder: '851emoji', name: '851 Emoji Only', family: '851emoji' },
];
// ===========================================

const fontListContainer = document.getElementById('font-list');
const toast = document.getElementById('toast');
fontListContainer.innerHTML = '';

let toastTimer = null;
function showToast() {
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

async function detectFonts() {
    let foundAny = false;

    const detectionPromises = fonts.map(async (fontData) => {
        const encodedFolder = encodeURIComponent(fontData.folder);
        try {
            const response = await fetch(`./${encodedFolder}/result.css`, { method: 'HEAD' });
            return { fontData, encodedFolder, ok: response.ok };
        } catch (e) {
            console.error(`探测 ${fontData.name} 失败:`, e);
            return { fontData, encodedFolder, ok: false };
        }
    });

    // 等待所有请求完成，并保证按照原本的数组顺序渲染
    const results = await Promise.all(detectionPromises);

    for (const res of results) {
        if (res.ok) {
            foundAny = true;
            renderFontCard(res.fontData, res.encodedFolder);
        }
    }

    if (!foundAny) {
        fontListContainer.innerHTML = '<div class="card">未发现字体，请检查配置。</div>';
    }
}

function renderFontCard(fontData, encodedFolder) {
    const cssUrl = `${window.location.protocol}//${window.location.host}/${encodedFolder}/result.css`;

    // 动态注入预览 CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `./${encodedFolder}/result.css`;
    document.head.appendChild(link);

    const card = document.createElement('div');
    card.className = 'card';

    // 构建高亮的 HTML 字符串
    const cssCodeHTML = `
<span class="hl-k">@import</span> url(<span class="hl-s">"${cssUrl}"</span>);

<span class="hl-t">body</span> {
    <span class="hl-p">font-family:</span> <span class="hl-s">"${fontData.family}"</span>;
}`;

    const htmlCodeHTML = `
&lt;<span class="hl-t">link</span> <span class="hl-p">rel</span>=<span class="hl-s">"stylesheet"</span> <span class="hl-p">href</span>=<span class="hl-s">"${cssUrl}"</span>&gt;

&lt;<span class="hl-t">style</span>&gt;
    <span class="hl-t">body</span> {
        <span class="hl-p">font-family:</span> <span class="hl-s">"${fontData.family}"</span>;
    }
&lt;/<span class="hl-t">style</span>&gt;`;

    const cssCodeRaw = encodeURIComponent(`@import url("${cssUrl}");\n\nbody {\n    font-family: "${fontData.family}";\n}`);
    const htmlCodeRaw = encodeURIComponent(`<link rel="stylesheet" href="${cssUrl}">\n\n<style>\n    body {\n        font-family: "${fontData.family}";\n    }\n</style>`);

    card.innerHTML = `
        <div class="card-header">
            <h3>${fontData.name}</h3>
            <a href="./preview.html?folder=${encodedFolder}&family=${encodeURIComponent(fontData.family)}&name=${encodeURIComponent(fontData.name)}" target="_blank" style="color:var(--primary); font-size:0.9rem;">测试字体 →</a>
        </div>

        <div class="preview-box" style="font-family: '${fontData.family}', serif;">
            落霞与孤鹜齐飞，秋水共长天一色。<br>
            1234567890 The quick brown fox jumps.
        </div>

        <div class="tab-container">
            <button class="tab-btn active" onclick="switchTab(this, 'css')">CSS</button>
            <button class="tab-btn" onclick="switchTab(this, 'html')">HTML</button>
        </div>

        <div class="tab-desc">常规的引入方式，使用 CSS 或 &lt;style&gt;。</div>

        <div class="code-wrapper">
            <div class="code-content active" data-type="css" data-raw="${cssCodeRaw}">${cssCodeHTML}</div>
            <div class="code-content" data-type="html" data-raw="${htmlCodeRaw}">${htmlCodeHTML}</div>

            <button class="copy-btn" onclick="copyCode(this)" title="复制">
                <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
        </div>
    `;
    fontListContainer.appendChild(card);
}

// ================= 全局交互函数 =================

window.switchTab = function (btn, type) {
    const card = btn.closest('.card');

    card.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    card.querySelectorAll('.code-content').forEach(c => c.classList.remove('active'));
    card.querySelector(`.code-content[data-type="${type}"]`).classList.add('active');

    const desc = card.querySelector('.tab-desc');
    desc.textContent = type === 'css'
        ? "常规引入，使用 CSS 或 <style>"
        : "标准 HTML 引入，适用于 <head> 区域";
}

window.copyCode = function (btn) {
    const wrapper = btn.closest('.code-wrapper');
    const activeContent = wrapper.querySelector('.code-content.active');

    // 【配合优化 2】取出时进行解码
    const rawCode = decodeURIComponent(activeContent.getAttribute('data-raw'));

    navigator.clipboard.writeText(rawCode).then(() => {
        showToast();
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    });
}

detectFonts();