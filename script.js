const fontListContainer = document.getElementById('font-list');
fontListContainer.innerHTML = '';

// 初始化字体站主入口
async function initFontHub() {
    try {
        // 获取构建期清洗好的有效字体数据
        const response = await fetch('./fonts.data.json');
        if (!response.ok) throw new Error('未能成功加载字体数据集');

        const validFonts = await response.json();

        if (!validFonts || validFonts.length === 0) {
            fontListContainer.innerHTML = '<article class="font-card empty">未发现有效字体，请检查自动化构建状态。</article>';
            return;
        }

        // 循环渲染
        validFonts.forEach(fontData => {
            const encodedFolder = encodeURIComponent(fontData.folder);
            renderFontCard(fontData, encodedFolder);
        });

    } catch (e) {
        console.error('Font Hub 初始化失败:', e);
        fontListContainer.innerHTML = '<article class="font-card empty">数据加载异常，请稍后重试。</article>';
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
                <a href="./preview.html?f=${fontData.folder.split('/').pop()}" class="test-link" title="字体详情"></a>

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
                <details class="css-details" name="code-panels">
                    <summary>CSS</summary>
                        <div class="code-content">${cssCodeHTML}</div>
                        ${copyButtonHTML}
                </details>
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

// 启动主程序
initFontHub();