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
            aiReviewLink: 'https://www.douyin.com/',
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
const visitHistory = {
    currentSession: {
        startTime: new Date().toISOString(),
        visitTimes: {}
    }
};

// 在文件开头添加加载历史数据的函数
function loadVisitHistory() {
    const savedHistory = localStorage.getItem('visitHistory');
    if (savedHistory) {
        const history = JSON.parse(savedHistory);
        // 确保有 sessions 数组
        if (!history.sessions) {
            history.sessions = [];
        }
        // 创建新的当前会话
        history.currentSession = {
            startTime: new Date().toISOString(),
            visitTimes: {}
        };
        return history;
    }
    return {
        sessions: [],
        currentSession: {
            startTime: new Date().toISOString(),
            visitTimes: {}
        }
    };
}

// 保存访问历史
function saveVisitHistory() {
    localStorage.setItem('visitHistory', JSON.stringify(visitHistory));
}

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
    for (const [productId, duration] of Object.entries(visitHistory.currentSession.visitTimes)) {
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

// 添加新的全局变量来跟踪时间
const startTimes = {};
let activeProductId = null;

// 修改 handleLinkClick 函数
function handleLinkClick(productId, url) {
    if (!visitHistory.currentSession.visitTimes[productId]) {
        visitHistory.currentSession.visitTimes[productId] = 0;
    }
    
    let startTime = Date.now();
    
    // 添加页面可见性变化的监听
    const visibilityHandler = () => {
        if (document.hidden) {
            // 用户切换到其他页面，记录开始时间
            startTime = Date.now();
        } else {
            // 用户返回到我们的页面，计算时间差
            const duration = (Date.now() - startTime) / 1000;
            visitHistory.currentSession.visitTimes[productId] += duration;
            saveVisitHistory();
            updateTimingDisplay();
        }
    };

    // 添加页面可见性监听器
    document.addEventListener('visibilitychange', visibilityHandler);

    // 5秒后开始检查用户是否返回
    setTimeout(() => {
        const checkInterval = setInterval(() => {
            if (!document.hidden) {
                document.removeEventListener('visibilitychange', visibilityHandler);
                clearInterval(checkInterval);
                saveVisitHistory();
                updateTimingDisplay();
            }
        }, 1000);
    }, 5000);

    return true;
}

// 修改 window.onbeforeunload 事件
window.onbeforeunload = function(e) {
    // 确保正在进行的计时被保存
    if (activeProductId && startTimes[activeProductId]) {
        const duration = (Date.now() - startTimes[activeProductId]) / 1000;
        visitHistory.currentSession.visitTimes[activeProductId] += duration;
    }
    
    // 如果当前会话有数据，保存到历史记录中
    if (Object.keys(visitHistory.currentSession.visitTimes).length > 0) {
        if (!visitHistory.sessions) {
            visitHistory.sessions = [];
        }
        visitHistory.sessions.push({...visitHistory.currentSession});
        // 创建新的当前会话
        visitHistory.currentSession = {
            startTime: new Date().toISOString(),
            visitTimes: {}
        };
        saveVisitHistory();
    }
    
    if (!hasUserCopiedData.status) {
        const message = '⚠️ 警告：您还没有复制访问数据！\n请先点击"复制数据"按钮，再关闭页面。';
        e.returnValue = message;
        return message;
    }
};

// 初始化访客ID和渲染商品
const visitorId = generateVisitorId();
document.addEventListener('DOMContentLoaded', () => {
    Object.assign(visitHistory, loadVisitHistory());
    renderProducts();
    const visitorIdElement = document.getElementById('visitor-id');
    visitorIdElement.innerHTML = `
        <div class="visitor-info">
            <span>访客ID: ${visitorId}</span>
            <div class="important-notice">
                ⚠️ 重要提示：请在浏览完商品后，在页面最下方点击"复制总计数据"按钮保存您的浏览记录！
                <button onclick="scrollToSummary()" class="scroll-button">点击跳转到底部</button>
            </div>
        </div>
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
            <a href="${product.aiReviewLink}" 
               target="_blank"
               onclick="return handleLinkClick('${product.id}_ai', '${product.aiReviewLink}')">AI评论版本</a>
            <a href="${product.noReviewLink}"
               target="_blank"
               onclick="return handleLinkClick('${product.id}_no', '${product.noReviewLink}')">无评论版本</a>
        </div>
    `;
    return card;
}

// 更新计时显示
function updateTimingDisplay() {
    const timingStats = document.getElementById('timing-stats');
    let html = `
        <div class="session-controls">
            <button onclick="clearHistory()" class="danger">清除历史数据</button>
        </div>
    `;

    // 显示历史会话数据
    if (visitHistory.sessions && visitHistory.sessions.length > 0) {
        visitHistory.sessions.forEach((session, index) => {
            html += `
                <div class="session-block">
                    <div class="session-header">
                        <h3>第 ${index + 1} 次访问 (${new Date(session.startTime).toLocaleString()})</h3>
                        <button onclick="copySessionData(${index})" class="copy-session-btn">复制此次记录</button>
                    </div>
                    <table class="timing-stats">
                        <tr>
                            <th>商品</th>
                            <th>版本</th>
                            <th>访问时间</th>
                        </tr>
                        ${generateSessionRows(session.visitTimes)}
                    </table>
                </div>
            `;
        });
    }

    // 显示当前会话数据
    if (Object.keys(visitHistory.currentSession.visitTimes).length > 0) {
        html += `
            <div class="session-block current">
                <div class="session-header">
                    <h3>第 ${visitHistory.sessions.length + 1} 次访问 (${new Date(visitHistory.currentSession.startTime).toLocaleString()})</h3>
                    <button onclick="copySessionData('current')" class="copy-session-btn">复制此次记录</button>
                </div>
                <table class="timing-stats">
                    <tr>
                        <th>商品</th>
                        <th>版本</th>
                        <th>访问时间</th>
                    </tr>
                    ${generateSessionRows(visitHistory.currentSession.visitTimes)}
                </table>
            </div>
        `;
    }

    // 添加总计数据
    html += `
        <div class="session-block summary">
            <div class="session-header">
                <h3>总计访问时间</h3>
                <button onclick="copySummaryData()" class="copy-session-btn">复制总计数据</button>
            </div>
            <table class="timing-stats">
                <tr>
                    <th>商品</th>
                    <th>版本</th>
                    <th>访问时间</th>
                </tr>
                ${generateSummaryRows()}
            </table>
        </div>
    `;

    timingStats.innerHTML = html;
}

// 生成会话数据行
function generateSessionRows(visitTimes) {
    let rows = '';
    for (const productId in visitTimes) {
        const [baseId, version] = productId.split('_');
        const product = [...products.functional, ...products.emotional]
            .find(p => p.id === baseId);
        
        if (product) {
            rows += `
                <tr>
                    <td>${product.name}</td>
                    <td>${version === 'ai' ? 'AI评论版本' : '无评论版本'}</td>
                    <td>${formatTime(visitTimes[productId])}</td>
                </tr>
            `;
        }
    }
    return rows;
}

// 添加导出数据功能
function exportData() {
    const data = {
        visitorId: visitorId,
        sessions: visitHistory.sessions,
        currentSession: visitHistory.currentSession
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visit-history-${visitorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 添加清除历史数据功能
function clearHistory() {
    if (confirm('确定要清除所有历史访问数据吗？此操作不可撤销。')) {
        visitHistory.sessions = [];
        visitHistory.currentSession = {
            startTime: new Date().toISOString(),
            visitTimes: {}
        };
        saveVisitHistory();
        updateTimingDisplay();
    }
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

// 修改 generateSummaryRows 函数
function generateSummaryRows() {
    // 按商品和版本分类的汇总数据
    const summary = {};
    
    // 汇总所有会话的数据
    const allSessions = [...visitHistory.sessions, visitHistory.currentSession];
    allSessions.forEach(session => {
        Object.entries(session.visitTimes).forEach(([productId, duration]) => {
            const [baseId, version] = productId.split('_');
            const product = [...products.functional, ...products.emotional]
                .find(p => p.id === baseId);
            
            if (product) {
                // 确定商品类别
                const category = products.functional.includes(product) ? 'functional' : 'emotional';
                
                // 初始化商品的数据结构
                if (!summary[product.name]) {
                    summary[product.name] = {
                        category: category,
                        ai: 0,
                        no: 0
                    };
                }
                
                // 累加时间
                summary[product.name][version] += duration;
            }
        });
    });

    // 生成HTML
    let rows = '';
    
    // 功能型商品汇总
    rows += `<tr><th colspan="3" class="summary-header">功能型商品总计</th></tr>`;
    Object.entries(summary)
        .filter(([_, data]) => data.category === 'functional')
        .forEach(([name, data]) => {
            rows += `
                <tr>
                    <td rowspan="2">${name}</td>
                    <td>AI评论版本</td>
                    <td>${formatTime(data.ai)}</td>
                </tr>
                <tr>
                    <td>无评论版本</td>
                    <td>${formatTime(data.no)}</td>
                </tr>
            `;
        });

    // 情感型商品汇总
    rows += `<tr><th colspan="3" class="summary-header">情感型商品总计</th></tr>`;
    Object.entries(summary)
        .filter(([_, data]) => data.category === 'emotional')
        .forEach(([name, data]) => {
            rows += `
                <tr>
                    <td rowspan="2">${name}</td>
                    <td>AI评论版本</td>
                    <td>${formatTime(data.ai)}</td>
                </tr>
                <tr>
                    <td>无评论版本</td>
                    <td>${formatTime(data.no)}</td>
                </tr>
            `;
        });

    return rows;
}

// 添加复制单个会话数据的函数
function copySessionData(sessionIndex) {
    const session = sessionIndex === 'current' 
        ? visitHistory.currentSession 
        : visitHistory.sessions[sessionIndex];
    
    const data = [];
    data.push(`访客ID: ${visitorId}`);
    data.push(`访问时间: ${new Date(session.startTime).toLocaleString()}`);
    data.push('');

    Object.entries(session.visitTimes).forEach(([productId, duration]) => {
        const [baseId, version] = productId.split('_');
        const product = [...products.functional, ...products.emotional]
            .find(p => p.id === baseId);
        
        if (product) {
            data.push(`商品: ${product.name}`);
            data.push(`版本: ${version === 'ai' ? 'AI评论版本' : '无评论版本'}`);
            data.push(`访问时间: ${formatTime(duration)}`);
            data.push('');
        }
    });

    navigator.clipboard.writeText(data.join('\n'));
    showNotification('此次访问记录已复制成功！');
}

// 修改 copySummaryData 函数
function copySummaryData() {
    const data = [];
    data.push(`访客ID: ${visitorId}`);
    data.push(`访问时间: ${new Date().toLocaleString()}`);
    data.push('');

    // 按商品和版本分类的汇总数据
    const summary = {};
    const allSessions = [...visitHistory.sessions, visitHistory.currentSession];
    
    allSessions.forEach(session => {
        Object.entries(session.visitTimes).forEach(([productId, duration]) => {
            const [baseId, version] = productId.split('_');
            const product = [...products.functional, ...products.emotional]
                .find(p => p.id === baseId);
            
            if (product) {
                // 初始化商品的数据结构
                if (!summary[product.name]) {
                    summary[product.name] = {
                        ai: 0,
                        no: 0
                    };
                }
                // 累加时间
                summary[product.name][version] += duration;
            }
        });
    });

    // 按照格式生成数据
    Object.entries(summary).forEach(([name, times]) => {
        if (times.ai > 0) {
            data.push(`商品: ${name}`);
            data.push(`版本: AI评论版本`);
            data.push(`访问时间: ${formatTime(times.ai)}`);
            data.push('');
        }
        if (times.no > 0) {
            data.push(`商品: ${name}`);
            data.push(`版本: 无评论版本`);
            data.push(`访问时间: ${formatTime(times.no)}`);
            data.push('');
        }
    });

    navigator.clipboard.writeText(data.join('\n'));
    showNotification('总计数据已复制成功！');
    hasUserCopiedData.status = true;
}

// 添加跳转到底部的函数
function scrollToSummary() {
    const summaryElement = document.querySelector('.session-block.summary');
    if (summaryElement) {
        summaryElement.scrollIntoView({ behavior: 'smooth' });
    }
}

// 添加显示欢迎弹窗的函数
function showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.classList.add('show');
}

document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已经显示过欢迎弹窗
    const modal = document.getElementById('welcome-modal');
    
    // 每次进入页面都显示弹窗
    modal.classList.add('show');

    // 点击关闭按钮
    const closeBtn = modal.querySelector('.modal-close-btn');
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('show');
    });

    // 点击模态框外部也可以关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // 添加帮助按钮点击事件
    const helpButton = document.getElementById('help-button');
    helpButton.addEventListener('click', showWelcomeModal);
});
