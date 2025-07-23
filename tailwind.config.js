// داخل وسم <script> في الهيد (للتطوير السريع)
// For production, this goes into a tailwind.config.js file
tailwind.config = {
  theme: {
    extend: {
      colors: {
        // لوحة ألوان محسنة لمظهر احترافي عصري
        'dark-deep': '#0D1117',         // الخلفية الرئيسية
        'dark-surface': '#161B22',      // خلفية المكونات (بطاقات، شرائط)
        'dark-border': '#21262D',       // حدود دقيقة
        'accent-blue': '#00BFFF',       // أزرق سماوي نابض بالحياة
        'accent-red': '#FF4500',        // أحمر برتقالي قوي (للتحذيرات أو التوكيد)
        'accent-cyan': '#00FFFF',       // سماوي فاتح للتوهج الثانوي
        'text-light': '#E6EDF3',        // النص الأساسي الفاتح
        'text-muted': '#8B949E',        // النص الثانوي / المكتوم
        'text-heading': '#FFFFFF',      // العناوين الأكثر إشراقًا
        'glow-effect': 'rgba(0, 191, 255, 0.2)', // توهج أزرق ناعم
      },
      fontFamily: {
        'sans': ['Outfit', 'sans-serif'], // خط رئيسي عصري
        'mono': ['"Space Mono"', 'monospace'], // خط مونو سبيس لتفاصيل الواجهة
      },
      spacing: {
        'px': '1px',
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '2.5': '20px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '10': '80px',
        '12': '96px',
        '16': '128px',
        '20': '160px',
        'sidebar-desktop': '300px', // عرض الشريط الجانبي لسطح المكتب
        'ticker-label-w': '90px', // عرض ثابت لـ "Breaking News" label
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem', // 2px
        'default': '0.25rem', // 4px
        'md': '0.375rem', // 6px
        'lg': '0.5rem', // 8px
        'xl': '0.75rem', // 12px
        '2xl': '1rem', // 16px
        '3xl': '1.5rem', // 24px
        'full': '9999px',
      },
      transitionTimingFunction: {
        'ease-in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)', // منحنى تسارع/تباطؤ أكثر دراماتيكية
      },
      transitionDuration: {
        'default': '300ms',
        'slow': '500ms',
        'extra-slow': '800ms',
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(0, 191, 255, 0.2)',
        'glow-md': '0 0 15px rgba(0, 191, 255, 0.3)',
        'glow-lg': '0 0 25px rgba(0, 191, 255, 0.4)',
        'inset-dark': 'inset 0 2px 4px rgba(0,0,0,0.6)',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)', filter: 'blur(2px)' },
          'to': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        pulseBorder: {
          '0%, 100%': { borderColor: 'var(--tw-dark-border)' },
          '50%': { borderColor: 'var(--tw-accent-blue)' },
        },
        pulseGlow: {
          '0%, 100%': { backgroundColor: 'var(--tw-accent-red)', boxShadow: '0 0 10px var(--tw-glow-effect)' },
          '50%': { backgroundColor: 'var(--tw-accent-blue)', boxShadow: '0 0 20px var(--tw-glow-effect)' },
        },
        scrollTicker: {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(-100%)' },
        },
        // إضافة بعض الرسوم المتحركة الجديدة للمظهر الاحترافي
        spotlight: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(50px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s var(--tw-transition-timing-function-ease-in-out-expo) forwards',
        'pulse-glow': 'pulseGlow 4s linear infinite',
        'scroll-ticker': 'scrollTicker 25s linear infinite',
        'pulse-border': 'pulseBorder 3s infinite alternate ease-in-out',
        'spotlight-in': 'spotlight 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // require('tailwind-scrollbar'), // لإضافة تخصيص شريط التمرير
  ],
}