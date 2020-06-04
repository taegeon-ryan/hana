module.exports = {
  title: 'Hana',
  description: '',
  base: '/hana',
  themeConfig: {
    nav: [
      { text: 'Index', link: '/' }
    ]
  },
  plugins: [
    '@vuepress/back-to-top',
    '@vuepress/active-header-links',
    '@vuepress/medium-zoom',
    '@vuepress/nprogress',
    ['@vuepress/pwa', {
      serviceWorker: true,
      updatePopup: true
    }]
  ]
}
