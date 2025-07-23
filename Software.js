document.addEventListener('DOMContentLoaded', () => {
    // العناصر الأساسية في واجهة المستخدم (DOM Elements)
    const newsListNav = document.getElementById('news-list-nav');
    const mainContent = document.getElementById('main-content');

    // مخزن لجميع بيانات المقالات التي تم جلبها
    let articlesData = [];

    // --- 1. تهيئة التطبيق وجلب بيانات المقالات ---
    async function initializeApplication() {
        console.log("جارٍ تهيئة التطبيق وجلب بيانات المقالات من الخادم...");
        try {
            // رابط API لجلب البيانات. تأكد من أنه صحيح ويشير إلى ملف JSON الخاص بك.
            // ملاحظة: هذا الرابط يشير إلى بنية JSON التي قمت بتقديمها سابقًا.
            const response = await fetch('https://api.jsonbin.io/v3/b/688129e27b4b8670d8a6269d');

            // التحقق من حالة استجابة الشبكة
            if (!response.ok) {
                throw new Error(`خطأ في استجابة الشبكة: ${response.status} - ${response.statusText}`);
            }

            const responseText = await response.text();
            // التحقق مما إذا كانت الاستجابة فارغة
            if (!responseText) {
                throw new Error('تم استلام استجابة فارغة من الخادم.');
            }

            let parsedData = JSON.parse(responseText);

            // منطق التعامل مع بنية JSON:
            // إذا كانت البيانات ملفوفة داخل كائن 'record' (كما في JSONBin.io)، نستخدمه.
            // وإلا، نفترض أن البيانات هي المصفوفة مباشرة.
            if (parsedData && parsedData.record) {
                // قد تكون articles داخل record، أو record نفسها هي المصفوفة
                // هذا الجزء يسمح بالتعامل مع بنية "record" التي كانت شائعة في JSONBin.io
                articlesData = parsedData.record.articles || parsedData.record;
            } else {
                articlesData = parsedData;
            }

            // التأكد من أن البيانات التي تم جلبها هي مصفوفة بالفعل
            if (!Array.isArray(articlesData)) {
                console.warn("البنية المتوقعة لبيانات المقالات ليست مصفوفة. جارٍ محاولة تحويلها.");
                // إذا لم تكن مصفوفة، قد تكون كائنًا يحتوي على المقالات (كما في بعض حالات JSONBin.io)
                if (typeof articlesData === 'object' && articlesData !== null) {
                    articlesData = Object.values(articlesData); // تحويل الكائن إلى مصفوفة قيمه
                } else {
                    articlesData = []; // إعادة تعيين لضمان أنها مصفوفة فارغة في حال عدم صلاحيتها
                }
            }
            
            console.log("تم جلب بيانات المقالات بنجاح. العدد الكلي للمقالات:", articlesData.length);

            // إذا كان هناك مقالات، قم بتعبئة الشريط الجانبي واعرض المقال الأول
            if (articlesData.length > 0) {
                populateSidebar(articlesData);
                displayArticle(articlesData[0].id); // عرض أول مقال افتراضيًا
            } else {
                // رسالة للمستخدم في حال عدم وجود مقالات
                newsListNav.innerHTML = `<div class="text-center text-gray-500 py-4 px-2">
                                            <p class="text-lg">لا توجد مقالات لعرضها حاليًا.</p>
                                        </div>`;
            }

        } catch (error) {
            // عرض رسالة خطأ واضحة وجذابة للمستخدم في المحتوى الرئيسي
            mainContent.innerHTML = `
                <div class="placeholder text-center text-red-600 p-8 bg-red-50 rounded-lg shadow-md">
                    <h2 class="text-3xl font-bold mb-3">عفوًا، حدث خطأ!</h2>
                    <p class="text-lg text-gray-700">فشل تحميل سجلات المقالات. يرجى التحقق من اتصالك بالإنترنت والمحاولة لاحقًا.</p>
                    <p class="text-sm mt-4 text-red-500">تفاصيل فنية: ${error.message}</p>
                </div>
            `;
            console.error("خطأ في تهيئة التطبيق:", error);
        }
    }

    // --- 2. تعبئة الشريط الجانبي بالمقالات ---
    function populateSidebar(articles) {
        // التحقق مرة أخرى لضمان سلامة البيانات
        if (!Array.isArray(articles) || articles.length === 0) {
            newsListNav.innerHTML = `<div class="text-center text-gray-500 py-4 px-2">
                                        <p class="text-lg">لا توجد مقالات متوفرة في القائمة الجانبية.</p>
                                    </div>`;
            return;
        }

        newsListNav.innerHTML = articles.map(article => `
            <button class="news-item block w-full text-right p-3 my-1 rounded-lg 
                            hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 
                            transition-all duration-200 ease-in-out cursor-pointer" 
                    data-id="${article.id}">
                <div class="font-bold text-gray-800 text-base">${article.company}</div>
                <div class="text-sm text-gray-600 truncate">${article.shortTitle}</div>
            </button>
        `).join('');
    }

    // --- 3. عرض المقال في المحتوى الرئيسي ---
    function displayArticle(articleId) {
        const article = articlesData.find(item => item.id === articleId);

        if (!article) {
            mainContent.innerHTML = `
                <div class="placeholder text-center text-gray-600 p-8 bg-yellow-50 rounded-lg shadow-md">
                    <h2 class="text-3xl font-bold mb-3">المقال غير موجود!</h2>
                    <p class="text-lg text-gray-700">عذرًا، لم نتمكن من العثور على المقال المطلوب بمعرف: <strong>${articleId}</strong>.</p>
                </div>
            `;
            console.warn(`المقال بالمعرف ${articleId} غير موجود في بيانات المقالات.`);
            return;
        }

        let articleBodyHtml = '';

        // إضافة الملخص إذا كان موجودًا
        if (article.summary) {
            articleBodyHtml += `
                <div class="summary-section bg-blue-50 p-5 rounded-lg mb-6 border-r-4 border-blue-600 shadow-sm">
                    <h3 class="text-xl font-extrabold text-blue-800 mb-3">خلاصة المقال:</h3>
                    <p class="text-gray-800 leading-relaxed">${article.summary}</p>
                </div>
            `;
        }

        // --- معالجة المحتوى لتحسين التنسيق باستخدام marked.js ---
        // **هام:** تأكد من تضمين مكتبة marked.js في ملف HTML الخاص بك قبل هذا السكربت.
        // مثال: <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        if (typeof marked !== 'undefined' && marked.parse) {
            articleBodyHtml += marked.parse(article.content || 'لا يوجد محتوى لهذا المقال.');
        } else {
            console.warn("مكتبة 'marked.js' غير موجودة أو لم يتم تحميلها بشكل صحيح. سيتم عرض المحتوى كنص عادي.");
            articleBodyHtml += `<p>${article.content || 'لا يوجد محتوى لهذا المقال.'}</p>`;
        }
        
        mainContent.innerHTML = `
            <div class="article-detail-container bg-white p-8 md:p-10 rounded-xl shadow-2xl relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-25 -z-10"></div>
                
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.fullTitle}" class="w-full h-auto max-h-96 object-cover rounded-lg mb-8 shadow-lg border border-gray-100">` : ''}

                <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight text-center md:text-right">
                    ${article.fullTitle}
                </h1>
                
                <div class="article-meta text-gray-600 text-sm flex flex-wrap items-center justify-center md:justify-end mb-8 border-b pb-4 border-gray-200">
                    <span class="ml-4 flex items-center">
                        <i class="fas fa-building text-blue-500 mr-2"></i> بواسطة: <strong class="text-gray-800 mr-1">${article.company}</strong>
                    </span> 
                    <span class="ml-4 flex items-center">
                        <i class="fas fa-calendar-alt text-blue-500 mr-2"></i> التاريخ: <strong class="text-gray-800 mr-1">${article.date}</strong>
                    </span> 
                    <span class="ml-4 flex items-center">
                        <i class="fas fa-tag text-blue-500 mr-2"></i> الفئة: <strong class="text-gray-800">${article.category}</strong>
                    </span>
                    ${article.source ? `
                    <span class="ml-4 flex items-center">
                        <i class="fas fa-bookmark text-blue-500 mr-2"></i> المصدر: <strong class="text-gray-800">${article.source}</strong>
                    </span>
                    ` : ''}
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
        updateActiveSidebarItem(articleId); // تحديث العنصر النشط في الشريط الجانبي
    }

    // --- 4. تحديث حالة العنصر النشط في الشريط الجانبي ---
    function updateActiveSidebarItem(articleId) {
        const allItems = newsListNav.querySelectorAll('.news-item');
        allItems.forEach(item => {
            // إزالة فئات النشاط القديمة وإعادة التعيين للوضع الافتراضي
            item.classList.remove('active', 'bg-blue-600', 'text-white', 'shadow-md');
            item.classList.add('bg-white', 'text-gray-800');

            if (item.dataset.id === articleId) {
                // إضافة فئات النشاط الجديدة
                item.classList.add('active', 'bg-blue-600', 'text-white', 'shadow-md');
                item.classList.remove('bg-white', 'text-gray-800', 'hover:bg-blue-100'); // إزالة الهوفر عند التفعيل
            }
        });
    }

    // --- 5. إعداد مستمعي الأحداث (Event Listeners) ---
    newsListNav.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.news-item');
        if (clickedItem) {
            const id = clickedItem.dataset.id;
            displayArticle(id);
        }
    });

    // --- بدء تشغيل التطبيق تلقائيًا عند تحميل الصفحة ---
    initializeApplication();
});

document.addEventListener('DOMContentLoaded', () => {
    const navLinksContainer = document.getElementById('nav-links');
    const mobileNavLinksContainer = document.getElementById('mobile-nav-links');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    // Toggle mobile menu visibility
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Function to set the active link color
    function setActiveLink() {
        // Get the current URL path (e.g., "/news.html")
        const currentPath = window.location.pathname.split('/').pop(); // Gets 'news.html' from 'http://example.com/news.html'

        // Get all navigation links from both desktop and mobile menus
        const allNavLinks = [];
        if (navLinksContainer) {
            navLinksContainer.querySelectorAll('a').forEach(link => allNavLinks.push(link));
        }
        if (mobileNavLinksContainer) {
            mobileNavLinksContainer.querySelectorAll('a').forEach(link => allNavLinks.push(link));
        }

        // Loop through all links and apply/remove the active class
        allNavLinks.forEach(link => {
            const linkPath = link.getAttribute('href').split('/').pop();

            // Remove previous active styles
            link.classList.remove('text-red-700', 'font-extrabold'); // Remove previous active text color and bold
            link.classList.add('text-gray-700', 'font-semibold'); // Add default text color and semi-bold

            // Check if the link's href matches the current page, or if its data-page matches a relevant string
            // This logic allows for dynamic naming in data-page for better matching
            // Example: currentPath 'News reports.html' should activate 'تقارير'
            // To handle nested links (e.g., "تحقيقات" under "تقارير"):
            // We need to check if the parent link's href is active OR if the sub-link's href is active.
            
            // First, try to match by exact file path
            if (linkPath === currentPath) {
                link.classList.add('text-red-700', 'font-extrabold');
                link.classList.remove('text-gray-700', 'font-semibold');
            } else {
                // If not an exact file match, check if it's a sub-link of an active parent
                // This part is tricky because the parent link might not exactly match the sub-page.
                // A more robust solution for sub-menus would involve checking if the current URL *starts with* the parent URL,
                // or setting a specific data attribute for parent links to indicate their active sub-page.
                // For simplicity, we'll just rely on direct page matching for now.
                // If you want "تقارير" to be red when "تحقيقات" is open, you'll need more complex logic here
                // For example: if (currentPath === 'News Gain.html' && link.getAttribute('data-page') === 'تقارير') { ... }
                // This would need to be done for each sub-menu item.
            }
        });
    }

    // Call the function when the page loads
    setActiveLink();

    // Re-call if the hash changes (for single-page applications, less common for multi-page sites)
    window.addEventListener('hashchange', setActiveLink);
});