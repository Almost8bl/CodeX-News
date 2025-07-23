document.addEventListener('DOMContentLoaded', () => {
    // ==================================================================
    // القسم الأول: منطق جلب وعرض الأخبار
    // ==================================================================

    // العناصر الأساسية في واجهة المستخدم (DOM Elements)
    const newsListNav = document.getElementById('news-list-nav');
    const mainContent = document.getElementById('main-content');

    // مخزن لجميع بيانات المقالات التي تم جلبها
    let articlesData = [];

    // متغير لتخزين معرف مؤقت الأنيميشن لمنعه من التداخل
    let currentTickerAnimationTimeout;

    // --- 1. تهيئة التطبيق وجلب بيانات المقالات ---
    async function initializeApplication() {
        console.log("جارٍ تهيئة التطبيق وجلب بيانات المقالات من الخادم...");
        try {
            const response = await fetch('https://api.jsonbin.io/v3/b/687dd459e1317c22b5728e82');
            if (!response.ok) {
                throw new Error(`خطأ في استجابة الشبكة: ${response.status} - ${response.statusText}`);
            }
            const responseText = await response.text();
            if (!responseText) {
                throw new Error('تم استلام استجابة فارغة من الخادم.');
            }
            let parsedData = JSON.parse(responseText);

            if (parsedData && parsedData.record) {
                articlesData = parsedData.record.articles || parsedData.record;
            } else {
                articlesData = parsedData;
            }

            if (!Array.isArray(articlesData)) {
                console.warn("البنية المتوقعة لبيانات المقالات ليست مصفوفة. جارٍ محاولة تحويلها.");
                if (typeof articlesData === 'object' && articlesData !== null) {
                    articlesData = Object.values(articlesData);
                } else {
                    articlesData = [];
                }
            }

            console.log("تم جلب بيانات المقالات بنجاح. العدد الكلي للمقالات:", articlesData.length);

            if (articlesData.length > 0) {
                populateSidebar(articlesData);
                displayArticle(articlesData[0].id);
            } else {
                newsListNav.innerHTML = `<div class="text-center text-gray-500 py-4 px-2"><p class="text-lg">لا توجد مقالات لعرضها حاليًا.</p></div>`;
            }
        } catch (error) {
            mainContent.innerHTML = `
                <div class="placeholder text-center text-red-600 p-8 bg-red-50 rounded-lg shadow-md">
                    <h2 class="text-3xl font-bold mb-3">عفوًا, حدث خطأ!</h2>
                    <p class="text-lg text-gray-700">فشل تحميل سجلات المقالات. يرجى التحقق من اتصالك بالإنترنت والمحاولة لاحقًا.</p>
                    <p class="text-sm mt-4 text-red-500">تفاصيل فنية: ${error.message}</p>
                </div>
            `;
            console.error("خطأ في تهيئة التطبيق:", error);
        }
    }

    // --- 2. تعبئة الشريط الجانبي بالمقالات ---
    function populateSidebar(articles) {
        if (!Array.isArray(articles) || articles.length === 0) {
            newsListNav.innerHTML = `<div class="text-center text-gray-500 py-4 px-2"><p class="text-lg">لا توجد مقالات متوفرة.</p></div>`;
            return;
        }
        newsListNav.innerHTML = articles.map(article => `
            <button class="news-item block w-full text-right p-3 my-1 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ease-in-out cursor-pointer" data-id="${article.id}">
                <div class="font-bold text-gray-800 text-base">${article.company}</div>
                <div class="text-sm text-gray-600 truncate">${article.shortTitle}</div>
            </button>
        `).join('');
    }

    // --- 3. عرض المقال في المحتوى الرئيسي (الجزء المعدل) ---
    function displayArticle(articleId) {
        const article = articlesData.find(item => item.id === articleId);

        if (!article) {
            mainContent.innerHTML = `<div class="placeholder text-center text-gray-600 p-8 bg-yellow-50 rounded-lg shadow-md">...</div>`;
            console.warn(`المقال بالمعرف ${articleId} غير موجود.`);
            return;
        }

        // مسح أي مؤقت سابق للأنيميشن لتجنب التداخل عند تغيير المقالات
        if (currentTickerAnimationTimeout) {
            clearTimeout(currentTickerAnimationTimeout);
            currentTickerAnimationTimeout = null;
        }

        let breakingNewsTickerHtml = '';
        if (article.isUrgent && article.summary) {
            breakingNewsTickerHtml = `
                <div class="breaking-news-bar">
                    <span class="breaking-news-label">عاجل</span>
                    <div class="ticker-wrap">
                        <div class="ticker-content">${article.summary}</div>
                    </div>
                </div>
            `;
        }

        let articleBodyHtml = '';
        if (typeof marked !== 'undefined' && marked.parse) {
            articleBodyHtml = marked.parse(article.content || 'لا يوجد محتوى لهذا المقال.');
        } else {
            console.warn("مكتبة 'marked.js' غير موجودة. سيتم عرض المحتوى كنص عادي.");
            articleBodyHtml = `<p>${article.content || 'لا يوجد محتوى لهذا المقال.'}</p>`;
        }

        mainContent.innerHTML = `
            <div class="article-detail-container bg-white p-8 md:p-10 rounded-xl shadow-lg relative overflow-hidden">
                ${breakingNewsTickerHtml}
                
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.fullTitle}" class="w-full h-auto max-h-96 object-cover rounded-lg mb-8 shadow-lg border border-gray-100">` : ''}

                <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight text-center md:text-right">
                    ${article.fullTitle}
                </h1>
                
                <div class="article-meta text-gray-600 text-sm flex flex-wrap items-center justify-center md:justify-end mb-8 border-b pb-4 border-gray-200">
                    <span class="ml-4 flex items-center"><strong>${article.company}</strong></span> 
                    <span class="ml-4 flex items-center"><strong>${article.date}</strong></span> 
                    <span class="ml-4 flex items-center"><strong>${article.category}</strong></span>
                    ${article.source ? `<span class="ml-4 flex items-center">المصدر: <strong>${article.source}</strong></span>` : ''}
                </div>
                
                <div class="article-body text-gray-800 leading-relaxed text-lg prose lg:prose-lg max-w-none">
                    ${articleBodyHtml}
                </div>

                ${article.tags && article.tags.length > 0 ? `
                <div class="article-tags mt-10 pt-6 border-t border-gray-200 text-center md:text-right">
                    <span class="font-semibold text-gray-700 ml-3 text-lg">الوسوم:</span>
                    ${article.tags.map(tag => `<span class="inline-block bg-indigo-100 text-indigo-800 text-sm px-4 py-2 rounded-full m-1 hover:bg-indigo-200 transition-colors duration-200 shadow-sm">${tag}</span>`).join('')}
                </div>
                ` : ''}
            </div>
        `;
        updateActiveSidebarItem(articleId);

        // **منطق الأنيميشن العاجل هنا**
        const tickerContent = mainContent.querySelector('.ticker-content');
        if (tickerContent) {
            const animationDuration = parseFloat(getComputedStyle(tickerContent).animationDuration); // الحصول على المدة من الـ CSS

            function startTickerAnimation() {
                // إعادة تعيين الأنيميشن عن طريق إزالة وإعادة إضافة الكلاس أو الخاصية
                tickerContent.style.animation = 'none'; // إزالة الأنيميشن مؤقتاً
                // استخدام requestAnimationFrame لضمان إعادة رسم المتصفح قبل إضافة الأنيميشن مرة أخرى
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        tickerContent.style.animation = `scroll-ltr ${animationDuration}s linear`; // إعادة إضافة الأنيميشن
                    });
                });
            }

            // listener لانتهاء الأنيميشن
            tickerContent.addEventListener('animationend', function handler() {
                // إزالة الـ listener بعد كل انتهاء لتجنب التكرار الزائد
                tickerContent.removeEventListener('animationend', handler);

                // مسح أي مؤقت سابق قبل بدء مؤقت جديد
                if (currentTickerAnimationTimeout) {
                    clearTimeout(currentTickerAnimationTimeout);
                }

                // تعيين مؤقت لبدء الأنيميشن مرة أخرى بعد نصف ثانية (500 ميلي ثانية)
                currentTickerAnimationTimeout = setTimeout(() => {
                    startTickerAnimation(); // بدء الدورة التالية
                }, 500); // **تم التعديل هنا: 500 ميلي ثانية لتأخير نصف ثانية**
            });

            // بدء الأنيميشن لأول مرة عند عرض المقال
            startTickerAnimation();
        }
    }

    // --- 4. تحديث حالة العنصر النشط في الشريط الجانبي ---
    function updateActiveSidebarItem(articleId) {
        const allItems = newsListNav.querySelectorAll('.news-item');
        allItems.forEach(item => {
            item.classList.remove('active', 'bg-red-700', 'text-white', 'shadow-md');
            if (item.dataset.id === articleId) {
                item.classList.add('active', 'bg-red-700', 'text-white', 'shadow-md');
                item.classList.remove('hover:bg-red-100');
            } else {
                item.classList.add('hover:bg-red-100');
            }
        });
    }

    // --- 5. إعداد مستمعي الأحداث ---
    newsListNav.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.news-item');
        if (clickedItem) {
            const id = clickedItem.dataset.id;
            displayArticle(id);
        }
    });

    // بدء تشغيل التطبيق
    initializeApplication();

    // ==================================================================
    // القسم الثاني: منطق قائمة التنقل (Navbar)
    // ==================================================================
    const navLinksContainer = document.getElementById('nav-links');
    const mobileNavLinksContainer = document.getElementById('mobile-nav-links');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    function setActiveLink() {
        const currentPath = window.location.pathname.split('/').pop();
        const allNavLinks = [];
        if (navLinksContainer) {
            navLinksContainer.querySelectorAll('a').forEach(link => allNavLinks.push(link));
        }
        if (mobileNavLinksContainer) {
            mobileNavLinksContainer.querySelectorAll('a').forEach(link => allNavLinks.push(link));
        }

        allNavLinks.forEach(link => {
            const linkPath = link.getAttribute('href').split('/').pop();
            link.classList.remove('text-red-700', 'font-extrabold');
            link.classList.add('text-gray-700', 'font-semibold');
            if (linkPath === currentPath) {
                link.classList.add('text-red-700', 'font-extrabold');
                link.classList.remove('text-gray-700', 'font-semibold');
            }
        });
    }

    setActiveLink();
    window.addEventListener('hashchange', setActiveLink);
});