// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Leo Matyushkin';
export const SITE_DESCRIPTION = 'Personal website of Leo Matyushkin. Programming, data science, and more.';
export const GENERATE_SLUG_FROM_TITLE = true
export const TRANSITION_API = true

// Multilingual support
export const DEFAULT_LANG = 'en';
export const LANGUAGES = {
  en: 'English',
  ru: 'Русский',
};

// Navigation
export const NAV_ITEMS = {
  en: [
    { name: 'Posts', url: '/posts' },
    { name: 'Texts', url: '/texts' },
    { name: 'Links', url: '/links' },
    { name: 'CV', url: '/cv' },
  ],
  ru: [
    { name: 'Посты', url: '/ru/posts' },
    { name: 'Тексты', url: '/ru/texts' },
    { name: 'Ссылки', url: '/ru/links' },
    { name: 'CV', url: '/ru/cv' },
  ],
};