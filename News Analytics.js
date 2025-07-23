document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const reportsListNav = document.getElementById('reports-list-nav');
    const mainContent = document.getElementById('main-content');

    let reportsData = []; // هذا المتغير سيحتوي على بيانات التقارير

    // --- 1. Initialize Application ---
    async function initialize() {
        console.log("Initializing app and fetching reports data...");
        try {
            const response = await fetch('https://api.jsonbin.io/v3/b/687fe22e7b4b8670d8a5949f'); // تأكد من هذا الرابط!

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}. Details: ${errorText || 'No additional details.'}`);
            }

            const text = await response.text();
            if (!text || text.trim() === '') {
                throw new Error('Received an empty or invalid response from the server.');
            }

            let parsedData;
            try {
                parsedData = JSON.parse(text);
            } catch (jsonError) {
                throw new Error(`Failed to parse JSON response: ${jsonError.message}. Response: ${text.substring(0, 100)}...`);
            }

            // فحص بنية JSON لاستخراج التقارير
            if (parsedData && parsedData.record && Array.isArray(parsedData.record.reports)) {
                reportsData = parsedData.record.reports;
            } else if (parsedData && Array.isArray(parsedData.reports)) {
                reportsData = parsedData.reports;
            } else if (Array.isArray(parsedData)) { // في حال كان الـ JSON هو مصفوفة مباشرة
                reportsData = parsedData;
            }
            else {
                console.warn("JSON data does not contain a 'reports' array as expected.", parsedData);
                reportsData = [];
            }

            console.log("Reports data fetched successfully. Total reports:", reportsData.length);

            if (reportsData.length > 0) {
                populateSidebar(reportsData);
                displayArticle(reportsData[0].id);
            } else {
                reportsListNav.innerHTML = `
                    <div class="text-center text-gray-500 py-4 px-2">
                        <p class="text-lg">لا توجد تقارير لعرضها حاليًا.</p>
                    </div>
                `;
            }

        } catch (error) {
            mainContent.innerHTML = `
                <div class="placeholder text-center text-red-600 p-8 bg-red-50 rounded-lg shadow-md">
                    <h2 class="text-3xl font-bold mb-3">عفواً، حدث خطأ!</h2>
                    <p class="text-lg text-gray-700">فشل تحميل سجلات التقارير. يرجى التحقق من اتصالك بالإنترنت والمحاولة لاحقاً.</p>
                    <p class="text-sm mt-4 text-red-500">تفاصيل فنية: ${error.message}</p>
                </div>
            `;
            console.error("Initialization Error:", error);
        }
    }

    // --- 2. Populate Sidebar ---
    function populateSidebar(articles) { // تم تغيير اسم المتغير ليعكس "articles" كما في الكود الأصلي
        if (!Array.isArray(articles) || articles.length === 0) {
            reportsListNav.innerHTML = `
                <div class="text-center text-gray-500 py-4 px-2">
                    <p class="text-lg">لا توجد تقارير متوفرة في القائمة الجانبية.</p>
                </div>
            `;
            return;
        }
        reportsListNav.innerHTML = articles.map(article => `
            <button class="news-item block w-full text-right p-3 my-1 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200" data-id="${article.id}">
                <div class="font-bold text-gray-800">${article.company || 'غير معروف'}</div>
                <div class="text-sm text-gray-600">${article.shortTitle || 'بلا عنوان'}</div>
            </button>
        `).join('');
    }

    // --- 3. Display Article in Main Content (التعديلات هنا فقط) ---
    function displayArticle(articleId) {
        const article = reportsData.find(item => item.id === articleId);
        if (!article) {
            mainContent.innerHTML = `
                <div class="placeholder text-center text-gray-600 p-8 bg-yellow-50 rounded-lg shadow-md">
                    <h2 class="text-3xl font-bold mb-3">التقرير غير موجود!</h2>
                    <p class="text-lg text-gray-700">عذراً، لم نتمكن من العثور على التقرير المطلوب بمعرف: <strong>${articleId}</strong>.</p>
                </div>
            `;
            console.warn(`Article with ID ${articleId} not found in reportsData.`);
            return;
        }

        let formattedContent = '';

        // إضافة الصورة إذا كانت موجودة
        if (article.imageUrl) {
            formattedContent += `<img src="${article.imageUrl}" alt="${article.fullTitle || 'صورة التقرير'}" class="w-full h-auto max-h-96 object-cover rounded-lg mb-8 shadow-lg border border-gray-100">`;
        }

        // إضافة الملخص إذا كان موجودًا بتصميم جذاب
        if (article.summary) {
            formattedContent += `
                <div class="bg-blue-50 p-6 rounded-lg mb-8 shadow-md border-r-4 border-blue-600">
                    <h3 class="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                        <i class="fas fa-info-circle text-blue-600 mr-3"></i> ملخص التقرير:
                    </h3>
                    <p class="text-gray-800 leading-relaxed text-lg">${article.summary}</p>
                </div>
            `;
        }

        // تحويل محتوى النص الرئيسي (Markdown) إلى HTML باستخدام marked.js
        // **هام:** للتأكد من أن Markdown يعمل، يجب تضمين مكتبة marked.js في ملف HTML الخاص بك قبل هذا السكربت.
        if (typeof marked !== 'undefined' && marked.parse) {
            formattedContent += marked.parse(article.content || 'لا يوجد محتوى لهذا التقرير.');
        } else {
            console.warn("مكتبة 'marked.js' غير موجودة أو لم يتم تحميلها بشكل صحيح. سيتم عرض المحتوى كنص عادي.");
            formattedContent += `<p>${article.content || 'لا يوجد محتوى لهذا التقرير.'}</p>`;
        }

        // إضافة قسم 'رأي CodeX News' إذا كان موجوداً
        // تم تكييفه ليعكس "التقرير" بدلاً من "المقال" وافتراض وجوده في بيانات التقرير
        if (article.codexNewsOpinion) {
            const opinion = article.codexNewsOpinion;
            const opinionClass = opinion.type === 'إيجابي' ? 'border-green-600 bg-green-50 text-green-800' :
                                 (opinion.type === 'نقدي' ? 'border-red-600 bg-red-50 text-red-800' :
                                  'border-blue-600 bg-blue-50 text-blue-800');
            const opinionIcon = opinion.type === 'إيجابي' ? 'fa-thumbs-up' :
                                (opinion.type === 'نقدي' ? 'fa-thumbs-down' : 'fa-lightbulb');

            formattedContent += `
                <div class="mt-8 p-6 rounded-lg shadow-inner ${opinionClass} border-t-4">
                    <h3 class="text-2xl font-extrabold mb-3 flex items-center">
                        <i class="fas ${opinionIcon} mr-3"></i> ${opinion.title}
                    </h3>
                    <p class="leading-relaxed text-lg">${opinion.text}</p>
                </div>
            `;
        }

        mainContent.innerHTML = `
            <div class="article-detail-container bg-white p-8 md:p-10 rounded-xl shadow-2xl relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-15 -z-10"></div>
                
                <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight text-center md:text-right">
                    ${article.fullTitle || 'بلا عنوان'}
                </h1>
                
                <div class="article-meta text-gray-600 text-sm flex flex-wrap items-center justify-center md:justify-end mb-8 pb-4 border-b border-gray-200">
                    <span class="ml-4 flex items-center">
                        <i class="fas fa-building text-blue-500 mr-2"></i> بواسطة: <strong class="text-gray-800 mr-1">${article.source ? article.source : article.company || 'غير محدد'}</strong>
                    </span> 
                    <span class="ml-4 flex items-center">
                        <i class="fas fa-calendar-alt text-blue-500 mr-2"></i> التاريخ: <strong class="text-gray-800 mr-1">${article.date || 'غير محدد'}</strong>
                    </span> 
                    <span class="ml-4 flex items-center">
                        <i class="fas fa-tag text-blue-500 mr-2"></i> الفئة: <strong class="text-gray-800">${article.category || 'غير محدد'}</strong>
                    </span>
                </div>
                
                <div class="article-body text-gray-800 leading-relaxed text-lg prose lg:prose-lg max-w-none">
                    ${formattedContent}
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
    }

    // --- 4. Update Active State in Sidebar ---
    function updateActiveSidebarItem(articleId) {
        const allItems = reportsListNav.querySelectorAll('.news-item');
        allItems.forEach(item => {
            item.classList.remove('active');
            // تم إضافة هذه الفئات لإلغاء أي تنسيق نشط سابق
            item.classList.remove('bg-blue-500', 'text-white');
            item.classList.add('bg-white', 'text-gray-800'); // إعادة التعيين للوضع الافتراضي
            if (item.dataset.id === articleId) {
                item.classList.add('active');
                // تم إضافة هذه الفئات لتنسيق العنصر النشط
                item.classList.add('bg-blue-500', 'text-white');
                item.classList.remove('bg-white', 'text-gray-800'); // إزالة فئات الوضع الافتراضي
            }
        });
    }

    // --- 5. Setup Event Listeners ---
    reportsListNav.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.news-item');
        if (clickedItem) {
            const id = clickedItem.dataset.id;
            displayArticle(id);
        }
    });

    // --- Start the app ---
    initialize();
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