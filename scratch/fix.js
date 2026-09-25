const fs = require('fs');

const path = './src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
    // Spacing
    'px-lg': 'px-[24px]',
    'py-lg': 'py-[24px]',
    'gap-lg': 'gap-[24px]',
    'py-xl': 'py-[48px]',
    'pt-xl': 'pt-[48px]',
    'mb-xl': 'mb-[48px]',
    'gap-md': 'gap-[16px]',
    'p-md': 'p-[16px]',
    'py-md': 'py-[16px]',
    'mb-md': 'mb-[16px]',
    'gap-sm': 'gap-[8px]',
    'max-w-container-max': 'max-w-[1280px]',
    'p-lg': 'p-[24px]',

    // Colors (Backgrounds)
    'bg-surface-container-low': 'bg-[#f2f4f6]',
    'bg-surface-container-lowest': 'bg-[#ffffff]',
    'bg-surface-container': 'bg-[#eceef0]',
    'bg-surface-variant': 'bg-[#e0e3e5]',
    'bg-surface-tint': 'bg-[#006c49]',
    'bg-primary-container': 'bg-[#10b981]',
    'bg-secondary-container': 'bg-[#d0e1fb]',
    'bg-tertiary-container': 'bg-[#9ba2bb]',
    'bg-primary': 'bg-[#006c49]',
    'bg-secondary': 'bg-[#505f76]',
    'bg-tertiary': 'bg-[#565e74]',
    'bg-surface': 'bg-[#f7f9fb]',
    'bg-background': 'bg-[#f7f9fb]',
    'bg-on-primary': 'bg-[#ffffff]',
    'bg-on-primary-container': 'bg-[#00422b]',

    // Colors (Text)
    'text-primary': 'text-[#006c49]',
    'text-primary-fixed-dim': 'text-[#4edea3]',
    'text-primary-fixed': 'text-[#6ffbbe]',
    'text-secondary': 'text-[#505f76]',
    'text-tertiary': 'text-[#565e74]',
    'text-on-surface-variant': 'text-[#3c4a42]',
    'text-on-surface': 'text-[#191c1e]',
    'text-on-primary': 'text-[#ffffff]',
    'text-on-primary-container': 'text-[#00422b]',
    'text-on-background': 'text-[#191c1e]',

    // Colors (Border)
    'border-outline-variant': 'border-[#bbcabf]',
    'border-primary': 'border-[#006c49]',

    // Typography
    'font-headline-xl': 'font-["Geist",sans-serif]',
    'text-headline-xl': 'text-[48px] leading-[56px] tracking-[-0.02em] font-bold',
    
    'font-headline-lg': 'font-["Geist",sans-serif]',
    'text-headline-lg': 'text-[32px] leading-[40px] tracking-[-0.01em] font-semibold',
    
    'font-headline-md': 'font-["Geist",sans-serif]',
    'text-headline-md': 'text-[24px] leading-[32px] font-semibold',
    
    'font-body-lg': 'font-["Inter",sans-serif]',
    'text-body-lg': 'text-[18px] leading-[28px] font-normal',
    
    'font-body-md': 'font-["Inter",sans-serif]',
    'text-body-md': 'text-[16px] leading-[24px] font-normal',
    
    'font-body-sm': 'font-["Inter",sans-serif]',
    'text-body-sm': 'text-[14px] leading-[20px] font-normal',
    
    'font-label-md': 'font-["Geist",sans-serif]',
    'text-label-md': 'text-[14px] leading-[16px] tracking-[0.05em] font-semibold',
};

// Also handle colors with opacity like bg-surface/70 -> bg-[#f7f9fb]/70
const replaceRegex = new RegExp(`\\b(${Object.keys(replacements).join('|')})\\b`, 'g');

content = content.replace(replaceRegex, (match) => replacements[match]);

// Handle classes with opacity (e.g. bg-surface/70)
Object.entries(replacements).forEach(([key, val]) => {
    // If it's a bg or text color, we need to allow /opacity
    if (key.startsWith('bg-') || key.startsWith('text-') || key.startsWith('border-')) {
        const hex = val.match(/\[(#[a-f0-9]+)\]/i);
        if (hex) {
            const regex = new RegExp(`\\b${key}\\/(\\d+)\\b`, 'g');
            content = content.replace(regex, (match, p1) => {
                return val + '/' + p1;
            });
        }
    }
});

fs.writeFileSync(path, content, 'utf8');
console.log('Done mapping classes to inline arbitrary values.');
