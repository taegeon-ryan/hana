/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "53acd375bba6dedd8b60b8d37d343975"
  },
  {
    "url": "assets/css/0.styles.86156f89.css",
    "revision": "5416b57e3a19998208a811863262fe6b"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/2.30bb7a93.js",
    "revision": "e96e024669d1db70c54e9f69d0b80b97"
  },
  {
    "url": "assets/js/3.fc768e37.js",
    "revision": "3d05e4a81f911bec251a52eb938cf37b"
  },
  {
    "url": "assets/js/4.6d653c24.js",
    "revision": "5a9c1fb4ad42e5535c9e9d90ac114624"
  },
  {
    "url": "assets/js/5.24557e6b.js",
    "revision": "3a88cb670fc8ff91980a9ce0bd7f6ceb"
  },
  {
    "url": "assets/js/6.e1326b4e.js",
    "revision": "790384f5d3ae6b02706298a35b61a833"
  },
  {
    "url": "assets/js/7.06acc9e5.js",
    "revision": "e30d0effaf24a23e2e03d4eb65a7d2cc"
  },
  {
    "url": "assets/js/app.cb4c21fc.js",
    "revision": "6d7e42eff53cf394a305f843ec2b77f9"
  },
  {
    "url": "index.html",
    "revision": "7097ea08d167d87ca1b7385a2bda73c7"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
