document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const reportsListNav = document.getElementById('reports-list-nav');
    const mainContent = document.getElementById('main-content');
    const navLinksContainer = document.getElementById('nav-links'); // لروابط الهيدر
    const mobileNavLinksContainer = document.getElementById('mobile-nav-links'); // لروابط الهيدر للجوال
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    let reportsData = [];

    // --- Helper function to get the current page file name ---
    function getCurrentPageFileName() {
        const path = window.location.pathname;
        return path.substring(path.lastIndexOf('/') + 1);
    }

    // --- Function to set the active link in the header ---
    function setActiveHeaderLink() {
        const currentPath = getCurrentPageFileName(); // Get current page filename

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
            link.classList.remove('text-red-700', 'font-extrabold');
            link.classList.add('text-gray-700', 'font-semibold');

            // --- Logic to activate link ---
            if (linkPath === currentPath) {
                link.classList.add('text-red-700', 'font-extrabold');
                link.classList.remove('text-gray-700', 'font-semibold');
            }
        });

        // --- Additional logic for parent links (like "تقارير" or "تكنولوجيا") ---
        // Define which sub-pages belong to which parent.
        // Make sure these filenames match your HTML hrefs EXACTLY.
        const parentPageMap = {
            'News reports.html': ['News Gain.html', 'News Analytics.html', 'News Opinion.html'],
            'News technology.html': ['AI.html', 'Devices.html', 'Software.html']
            // أضف المزيد من الروابط الرئيسية والفرعية هنا إذا كان لديك
        };

        // Check if the current page is a sub-page of any parent, then activate the parent link
        for (const parentHref in parentPageMap) {
            const subPages = parentPageMap[parentHref];
            if (subPages.includes(currentPath)) {
                const parentLink = allNavLinks.find(link => link.getAttribute('href').split('/').pop() === parentHref);
                if (parentLink) {
                    parentLink.classList.add('text-red-700', 'font-extrabold');
                    parentLink.classList.remove('text-gray-700', 'font-semibold');
                }
            }
        }
    }

    // --- 1. Initialize Application ---
    async function initialize() {
        console.log("Initializing app and fetching reports data...");
        try {
            const response = await fetch('https://api.jsonbin.io/v3/b/687ed46d7b4b8670d8a51731'); // تأكد من هذا الرابط!

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

            if (parsedData && parsedData.record && Array.isArray(parsedData.record.reports)) {
                reportsData = parsedData.record.reports;
            } else if (parsedData && Array.isArray(parsedData.reports)) {
                reportsData = parsedData.reports;
            } else if (Array.isArray(parsedData)) {
                reportsData = parsedData;
            } else {
                console.warn("JSON data does not contain a 'reports' array as expected.", parsedData);
                reportsData = [];
            }

            console.log("Reports data fetched successfully. Total reports:", reportsData.length);

            if (reportsData.length > 0) {
                populateSidebar(reportsData);
                // عرض التقرير الأول أو تقرير غزة إذا كان موجودًا
                const gazaReportId = 'Politics_Gaza_Crisis_2025_07_23_01'; // ID لتقرير غزة
                const initialReportId = reportsData.some(r => r.id === gazaReportId) ? gazaReportId : reportsData[0].id;
                displayReport(initialReportId);
            } else {
                reportsListNav.innerHTML = `
                    <div class="text-center text-gray-500 py-4 px-2">
                        <p class="text-lg">لا توجد تقارير لعرضها حاليًا.</p>
                    </div>
                `;
            }

            // Call setActiveHeaderLink after initial loading
            setActiveHeaderLink();

        } catch (error) {
            mainContent.innerHTML = `
                <div class="placeholder text-center text-red-600 p-8 bg-red-50 rounded-lg shadow-md">
                    <h2 class="text-3xl font-bold mb-3">عفواً، حدث خطأ!</h2>
                    <p class="text-lg text-gray-700">فشل تحميل سجلات التقارير. يرجى التحقق من اتصالك بالإنترنت والمحاولة لاحقاً.</p>
                    <p class="text-sm mt-4 text-red-500">تفاصيل فنية: ${error.message}</p>
                </div>
            `;
            console.error("Initialization Error:", error);
            // Ensure header links are still active even if main content fails to load
            setActiveHeaderLink();
        }
    }

    // --- 2. Populate Sidebar ---
    function populateSidebar(reports) {
        if (!Array.isArray(reports) || reports.length === 0) {
            reportsListNav.innerHTML = `
                <div class="text-center text-gray-500 py-4 px-2">
                    <p class="text-lg">لا توجد تقارير متوفرة في القائمة الجانبية.</p>
                </div>
            `;
            return;
        }
        reportsListNav.innerHTML = reports.map(report => `
            <button class="news-item block w-full text-right p-3 my-1 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200" data-id="${report.id}">
                <div class="font-bold text-gray-800">${report.company || 'غير معروف'}</div>
                <div class="text-sm text-gray-600">${report.shortTitle || 'بلا عنوان'}</div>
            </button>
        `).join('');
    }

    // --- 3. Display Report in Main Content ---
    function displayReport(reportId) {
        const report = reportsData.find(item => item.id === reportId);
        if (!report) {
            mainContent.innerHTML = `
                <div class="placeholder text-center text-gray-600 p-8 bg-yellow-50 rounded-lg shadow-md">
                    <h2 class="text-3xl font-bold mb-3">التقرير غير موجود!</h2>
                    <p class="text-lg text-gray-700">عذراً، لم نتمكن من العثور على التقرير المطلوب بمعرف: <strong>${reportId}</strong>.</p>
                </div>
            `;
            console.warn(`Report with ID ${reportId} not found in reports data.`);
            return;
        }

        let reportBodyHtml = '';

        // Add summary if exists
        if (report.summary) {
            reportBodyHtml += `
                <div class="bg-blue-50 p-6 rounded-lg mb-8 shadow-md border-r-4 border-blue-600">
                    <h3 class="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                        <i class="fas fa-info-circle text-blue-600 mr-3"></i> خلاصة التقرير:
                    </h3>
                    <p class="text-gray-800 leading-relaxed text-lg">${report.summary}</p>
                </div>
            `;
        }

        // Convert Markdown content to HTML using marked.js
        if (typeof marked !== 'undefined' && marked.parse) {
            reportBodyHtml += marked.parse(report.content || 'لا يوجد محتوى لهذا التقرير.');
        } else {
            console.warn("مكتبة 'marked.js' غير موجودة أو لم يتم تحميلها بشكل صحيح. سيتم عرض المحتوى كنص عادي.");
            reportBodyHtml += `<p>${report.content || 'لا يوجد محتوى لهذا التقرير.'}</p>`;
        }

        // Add 'Codex News Opinion' section if exists
        if (report.codexNewsOpinion) {
            const opinion = report.codexNewsOpinion;
            const opinionClass = opinion.type === 'إيجابي' ? 'border-green-600 bg-green-50 text-green-800' :
                                 (opinion.type === 'نقدي' ? 'border-red-600 bg-red-50 text-red-800' :
                                  'border-blue-600 bg-blue-50 text-blue-800');
            const opinionIcon = opinion.type === 'إيجابي' ? 'fa-thumbs-up' :
                                (opinion.type === 'نقدي' ? 'fa-thumbs-down' : 'fa-lightbulb');

            reportBodyHtml += `
                <div class="mt-8 p-6 rounded-lg shadow-inner ${opinionClass} border-t-4">
                    <h3 class="text-2xl font-extrabold mb-3 flex items-center">
                        <i class="fas ${opinionIcon} mr-3"></i> ${opinion.title}
                    </h3>
                    <p class="leading-relaxed text-lg">${opinion.text}</p>
                </div>
            `;
        }
        
        // Check if it's the Gaza report for specific styling and video section
        const isGazaReport = report.id === 'Politics_Gaza_Crisis_2025_07_23_01';
        const bloodEffectClass = isGazaReport ? 'blood-stained-background' : '';

        // Video section for Gaza report
        let videoSectionHtml = '';
        if (isGazaReport) {
            const videoEmbedUrl = "https://www.youtube.com/embed/FfQx9g5zFqM"; // Example video URL
            videoSectionHtml = `
                <div class="mt-10 pt-6 border-t border-gray-200 text-center">
                    <h2 class="text-xl font-semibold text-gray-700 mb-4">شاهد المزيد:</h2>
                    <div id="gaza-report-video-placeholder">
                        <iframe
                            src="${videoEmbedUrl}"
                            title="YouTube video player"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
            `;
        }

        mainContent.innerHTML = `
            <div class="report-detail-container bg-white p-8 md:p-10 rounded-xl shadow-2xl relative overflow-hidden ${bloodEffectClass}">
                ${!isGazaReport ? `<div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-15 -z-10"></div>` : ''}

                ${report.imageUrl ? `<img src="${report.imageUrl}" alt="${report.fullTitle || 'صورة التقرير'}" class="w-full h-auto max-h-96 object-cover rounded-lg mb-8 shadow-lg border border-gray-100">` : ''}

                <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight text-center md:text-right">
                    ${report.fullTitle || 'بلا عنوان'}
                </h1>

                <div class="report-meta text-gray-600 text-sm flex flex-wrap items-center justify-center md:justify-end mb-8 pb-4 border-b border-gray-200">
                    <span class="ml-4 flex items-center">
                        <i class="fas fa-building text-blue-500 mr-2"></i> بواسطة: <strong class="text-gray-800 mr-1">${report.company || 'غير محدد'}</strong>
                    </span>
                    <span class="ml-4 flex items-center">
                        <i class="fas fa-calendar-alt text-blue-500 mr-2"></i> التاريخ: <strong class="text-gray-800 mr-1">${report.date || 'غير محدد'}</strong>
                    </span>
                    <span class="ml-4 flex items-center">
                        <i class="fas fa-tag text-blue-500 mr-2"></i> الفئة: <strong class="text-gray-800">${report.category || 'غير محدد'}</strong>
                    </span>
                    ${report.source ? `
                    <span class="ml-4 flex items-center">
                        <i class="fas fa-bookmark text-blue-500 mr-2"></i> المصدر: <strong class="text-gray-800">${report.source}</strong>
                    </span>
                    ` : ''}
                </div>

                <div class="report-body text-gray-800 leading-relaxed text-lg prose lg:prose-lg max-w-none">
                    ${reportBodyHtml}
                </div>

                ${report.tags && report.tags.length > 0 ? `
                <div class="report-tags mt-10 pt-6 border-t border-gray-200 text-center md:text-right">
                    <span class="font-semibold text-gray-700 ml-3 text-lg">الوسوم:</span>
                    ${report.tags.map(tag => `<span class="inline-block bg-indigo-100 text-indigo-800 text-sm px-4 py-2 rounded-full m-1 hover:bg-indigo-200 transition-colors duration-200 shadow-sm">${tag}</span>`).join('')}
                </div>
                ` : ''}
                ${videoSectionHtml}
            </div>
        `;
        updateActiveSidebarItem(reportId);
    }

    // --- 4. Update Active State in Sidebar ---
    function updateActiveSidebarItem(reportId) {
        const allItems = reportsListNav.querySelectorAll('.news-item');
        allItems.forEach(item => {
            item.classList.remove('active');
            item.classList.remove('bg-blue-500', 'text-white'); // Added these for consistency with previous CSS
            item.classList.add('bg-white', 'text-gray-800');     // Added these for consistency with previous CSS
            if (item.dataset.id === reportId) {
                item.classList.add('active');
                item.classList.add('bg-blue-500', 'text-white');
                item.classList.remove('bg-white', 'text-gray-800');
            }
        });
    }

    // --- 5. Setup Event Listeners ---
    reportsListNav.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.news-item');
        if (clickedItem) {
            const id = clickedItem.dataset.id;
            displayReport(id);
        }
    });

    // Toggle mobile menu visibility
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Start the app ---
    initialize();
});