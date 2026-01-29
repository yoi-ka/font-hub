// ================= 配置区域 =================
const fonts = [
    {
        folder: 'moon-stars-kai-hw',
        name: '月星楷 HW',
        family: 'Moon Stars Kai HW'
    },
    {
        folder: 'ping-fang-ying-feng',
        name: '平方迎风体',
        family: 'PING FANG YING FENG'
    },
];
// ===========================================

const fontListContainer = document.getElementById('font-list');
const toast = document.getElementById('toast');
fontListContainer.innerHTML = '';

// 显示复制成功提示
function showToast() {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

async function detectFonts() {
    let foundAny = false;
    for (const fontData of fonts) {
        try {
            const encodedFolder = encodeURIComponent(fontData.folder);
            const response = await fetch(`./${encodedFolder}/result.css`, { method: 'HEAD' });

            if (response.ok) {
                foundAny = true;
                renderFontCard(fontData, encodedFolder);
            }
        } catch (e) { console.error(e); }
    }
    if (!foundAny) fontListContainer.innerHTML = '<div class="card">未发现字体，请检查配置。</div>';
}

function renderFontCard(fontData, encodedFolder) {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const cssUrl = `${protocol}//${host}/${encodedFolder}/result.css`;

    // 动态注入预览CSS
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

    // 构建原始纯文本用于复制
    const cssCodeRaw = `@import url("${cssUrl}");\n\nbody {\n    font-family: "${fontData.family}";\n}`;
    const htmlCodeRaw = `<link rel="stylesheet" href="${cssUrl}">\n\n<style>\n    body {\n        font-family: "${fontData.family}";\n    }\n</style>`;

    card.innerHTML = `
                <div class="card-header">
                    <h3>${fontData.name}</h3>
                    <a href="./${encodedFolder}/index.html" target="_blank" style="color:var(--primary); font-size:0.9rem;">查看详情 →</a>
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
                    <div class="code-content active" data-type="css" data-raw='${cssCodeRaw}'>${cssCodeHTML}</div>

                    <div class="code-content" data-type="html" data-raw='${htmlCodeRaw}'>${htmlCodeHTML}</div>

                    <button class="copy-btn" onclick="copyCode(this)" title="复制">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            `;
    fontListContainer.appendChild(card);
}

// ================= 全局交互函数 =================

// 切换 Tab
window.switchTab = function (btn, type) {
    const card = btn.closest('.card');

    // 1. 切换按钮样式
    card.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 2. 切换代码内容
    card.querySelectorAll('.code-content').forEach(c => c.classList.remove('active'));
    card.querySelector(`.code-content[data-type="${type}"]`).classList.add('active');

    // 3. 切换描述文案
    const desc = card.querySelector('.tab-desc');
    if (type === 'css') {
        desc.textContent = "常规引入，使用 CSS 或 <style>";
    } else {
        desc.textContent = "标准 HTML 引入，适用于 <head> 区域";
    }
}

// 复制功能
window.copyCode = function (btn) {
    const wrapper = btn.closest('.code-wrapper');
    // 找到当前可见的代码块 (.active)
    const activeContent = wrapper.querySelector('.code-content.active');

    // 从 data-raw 属性中获取纯文本代码，避免复制到 HTML 标签
    const rawCode = activeContent.getAttribute('data-raw');

    navigator.clipboard.writeText(rawCode).then(() => {
        showToast();
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    });
}

detectFonts();