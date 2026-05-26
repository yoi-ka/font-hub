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
fontListContainer.innerHTML = '';

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

    const results = await Promise.all(detectionPromises);

    for (const res of results) {
        if (res.ok) {
            foundAny = true;
            renderFontCard(res.fontData, res.encodedFolder);
        }
    }

    if (!foundAny) {
        fontListContainer.innerHTML = '<article class="font-card empty">未发现字体，请检查配置。</article>';
    }
}

function renderFontCard(fontData, encodedFolder) {
    const cssUrl = `${window.location.protocol}//${window.location.host}/${encodedFolder}/result.css`;
    const fontFamilyForCss = `\
<span class="hl-t">body</span> {
    <span class="hl-p">font-family</span><span class="hl-k">:</span> <span class="hl-s">'${fontData.family}'</span>;
}\
`;

    // 动态注入预览 CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `./${encodedFolder}/result.css`;
    document.head.appendChild(link);

    const card = document.createElement('article');
    card.className = 'font-card';
    card.style = `font-family: '${fontData.family}', serif;`;

    const cssCodeHTML = `\
<span class="hl-k">@import</span> url(<span class="hl-s">'${cssUrl}'</span>);

${fontFamilyForCss}
`;

    const htmlCodeHTML = `\
&lt;<span class="hl-k">link <span class="hl-p">rel</span>=<span class="hl-s">"stylesheet"</span>
      <span class="hl-p">href</span>=<span class="hl-s">'${cssUrl}'</span></span>&gt;

&lt;<span class="hl-k">style</span>&gt;
${fontFamilyForCss.replace(/^/gm, '    ')}
&lt;/<span class="hl-k">style</span>&gt;
`;
    const copyButtonHTML = `
    <button class="copy-btn" onclick="copyCode(this)" aria-label="复制代码" title="复制">
        <lottie-player src="./lottie/copy.json" speed="0.5" hover></lottie-player>
        <svg><use href="#icon-copied"></use></svg>
        <span class="tooltip" aria-live="polite"></span>
    </button>
    `;
    card.innerHTML = `
            <section class="preview-section">
                <a href="./preview.html?folder=${encodedFolder}&family=${encodeURIComponent(fontData.family)}&name=${encodeURIComponent(fontData.name)}"
                class="test-link" title="字体详情"></a>

                <header>
                    <h4>${fontData.name}</h4>
                </header>

                <div>
                    <p class="p1">落霞与孤鹜齐飞</p>
                    <p class="p2">秋水共长天一色</p>
                    <p class="p3">Sphinx of black quartz</p>
                    <p class="p4">Judge my vow</p>
                </div>
            </section>

            <section class="code-section">
                <!-- CSS 引入面板 -->
                <details class="css-details" name="code-panels">
                    <summary>CSS</summary>
                        <div class="code-content">${cssCodeHTML}</div>
                        ${copyButtonHTML}
                </details>
                <!-- HTML 引入面板 -->
                <details class="html-details" name="code-panels">
                    <summary>HTML</summary>
                        <div class="code-content">${htmlCodeHTML}</div>
                        ${copyButtonHTML}
                </details>
            </section>
    `;
    fontListContainer.appendChild(card);
}

// ================= 全局交互函数 =================
window.copyCode = function (btn) {
    if (btn.disabled) return;
    const detailsContainer = btn.closest('details');
    const activeContent = detailsContainer.querySelector('.code-content');
    const rawCode = activeContent.textContent.trim();

    navigator.clipboard.writeText(rawCode).then(() => {
        btn.disabled = true;

        const tipMsg = btn.querySelector('.tooltip');

        btn.classList.add('copied');
        tipMsg.textContent = "CopyThat!";

        setTimeout(() => {
            btn.classList.remove('copied');
            tipMsg.textContent = "";
            btn.disabled = false;
        }, 2000);
    });
}

// details 关闭函数
function closeAllDetails() {
    document.querySelectorAll('details[open]').forEach(details => {
        details.removeAttribute('open');
    });
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('details')) {
        closeAllDetails();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllDetails();
});

detectFonts();