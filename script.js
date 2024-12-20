// 生成唯一访客ID
function generateVisitorId() {
    // 检查localStorage中是否已存在访客ID
    let storedId = localStorage.getItem('visitorId');
    if (storedId) {
        return storedId;
    }
    
    // 如果不存在，则生成新的ID并存储
    const newId = 'visitor_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visitorId', newId);
    return newId;
}

// 商品数据
const products = {
    functional: [
        {
            id: 'f1',
            name: '飞利浦电动牙刷 Sonicare 3100',
            image: 'https://m.media-amazon.com/images/I/61L6oSYkO5L._SL1500_.jpg',
            aiReviewLink: 'https://www.amazon.com/dp/B08CDPW6XC',
            noReviewLink: 'https://www.amazon.com/dp/B08CDPW6XC/ref=nosim'
        },
        {
            id: 'f2',
            name: 'Instant Pot Pro 10合1多功能电压力锅',
            image: 'https://m.media-amazon.com/images/I/71oS6P+1qwL._AC_SL1500_.jpg',
            aiReviewLink: 'https://www.amazon.com/dp/B08PQ2KWHS',
            noReviewLink: 'https://www.amazon.com/dp/B08PQ2KWHS/ref=nosim'
        },
        {
            id: 'f3',
            name: 'Dyson V15 Detect 无绳吸尘器',
            image: 'https://m.media-amazon.com/images/I/61OorFhm+TL._AC_SL1500_.jpg',
            aiReviewLink: 'https://www.amazon.com/dp/B08PHTW8YF',
            noReviewLink: 'https://www.amazon.com/dp/B08PHTW8YF/ref=nosim'
        }
    ],
    emotional: [
        {
            id: 'e1',
            name: 'Swarovski 施华洛世奇天鹅项链',
            image: 'https://m.media-amazon.com/images/I/61RR8ICiUvL._AC_UL1500_.jpg',
            aiReviewLink: 'https://www.amazon.com/dp/B08H24V79K',
            noReviewLink: 'https://www.amazon.com/dp/B08H24V79K/ref=nosim'
        },
        {
            id: 'e2',
            name: 'Le Labo Santal 33 香水',
            image: 'https://m.media-amazon.com/images/I/61af+qm+syL._SL1500_.jpg',
            aiReviewLink: 'https://www.amazon.com/dp/B008B9JT1I',
            noReviewLink: 'https://www.amazon.com/dp/B008B9JT1I/ref=nosim'
        },
        {
            id: 'e3',
            name: 'UGG 经典迷你靴',
            image: 'https://m.media-amazon.com/images/I/71L--6JvVNL._AC_UY695_.jpg',
            aiReviewLink: 'https://www.amazon.com/dp/B01AIHY1RW',
            noReviewLink: 'https://www.amazon.com/dp/B01AIHY1RW/ref=nosim'
        }
    ]
};

// 访问时间记录
const visitTimes = {};
const startTimes = {};

// 在文件开头添加新的变量
const hasUserCopiedData = {
    status: false
};

// 复制数据
function copyData() {
    const data = [];
    data.push(`访客ID: ${visitorId}`);
    data.push('');  // 空行

    // 收集所有访问数据
    for (const [productId, duration] of Object.entries(visitTimes)) {
        const [baseId, version] = productId.split('_');
        const product = [...products.functional, ...products.emotional]
            .find(p => p.id === baseId);
        
        if (product) {
            data.push(`商品: ${product.name}`);
            data.push(`版本: ${version === 'ai' ? 'AI评论版本' : '无评论版本'}`);
            data.push(`访问时间: ${formatTime(duration)}`);
            data.push('');  // 空行
        }
    }

    navigator.clipboard.writeText(data.join('\n'));
    hasUserCopiedData.status = true;
    showNotification('数据已复制成功！请粘贴到问卷中');
}

// 添加新的函数
function showNotification(message) {
    // 移除已存在的通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        document.body.removeChild(existingNotification);
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-title">✅ 复制成功</div>
        <div class="notification-message">数据已复制到剪贴板，现在可以安全地关闭页面了</div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// 修改 window.onbeforeunload 事件
window.onbeforeunload = function(e) {
    if (!hasUserCopiedData.status) {
        const message = '⚠️ 警告：您还没有复制访问数据！\n请先点击"复制数据"按钮，再关闭页面。';
        e.returnValue = message;
        return message;
    }
};

// 初始化访客ID和渲染商品
const visitorId = generateVisitorId();
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    const visitorIdElement = document.getElementById('visitor-id');
    visitorIdElement.innerHTML = `
        <span>访客ID: ${visitorId}</span>
        <button class="copy-button" onclick="copyData()">复制数据</button>
    `;
    updateTimingDisplay();
});

// 创建商品卡片
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <div class="version-links">
            <a href="javascript:void(0)" 
               onclick="handleLinkClick('${product.id}_ai', '${product.aiReviewLink}')">AI评论版本</a>
            <a href="javascript:void(0)"
               onclick="handleLinkClick('${product.id}_no', '${product.noReviewLink}')">无评论版本</a>
        </div>
    `;
    return card;
}

// 处理链接点击
function handleLinkClick(productId, url) {
    visitTimes[productId] = 0;
    startTimes[productId] = Date.now();

    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
        alert("弹出窗口被拦截，请允许弹出窗口！");
        return;
    }

    const timerId = setInterval(() => {
        if (startTimes[productId]) {
            if (!newWindow || newWindow.closed) {
                const duration = (Date.now() - startTimes[productId]) / 1000;
                visitTimes[productId] = Math.round(duration);
                clearInterval(timerId);
                delete startTimes[productId];
                updateTimingDisplay();
            }
        }
    }, 1000);
}

// 更新计时显示
function updateTimingDisplay() {
    const timingStats = document.getElementById('timing-stats');
    let html = `
        <table class="timing-stats">
            <tr>
                <th>商品</th>
                <th>版本</th>
                <th>访问时间</th>
            </tr>
    `;

    for (const productId in visitTimes) {
        const [baseId, version] = productId.split('_');
        const product = [...products.functional, ...products.emotional]
            .find(p => p.id === baseId);
        
        if (product) {
            html += `
                <tr>
                    <td>${product.name}</td>
                    <td>${version === 'ai' ? 'AI评论版本' : '无评论版本'}</td>
                    <td>${formatTime(visitTimes[productId])}</td>
                </tr>
            `;
        }
    }

    html += '</table>';
    timingStats.innerHTML = html;
}

// 格式化时间
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}分${remainingSeconds}秒`;
}

// 渲染商品
function renderProducts() {
    const functionalContainer = document.getElementById('functional-products');
    const emotionalContainer = document.getElementById('emotional-products');

    functionalContainer.innerHTML = '';
    emotionalContainer.innerHTML = '';

    products.functional.forEach(product => {
        functionalContainer.appendChild(createProductCard(product));
    });

    products.emotional.forEach(product => {
        emotionalContainer.appendChild(createProductCard(product));
    });
}
