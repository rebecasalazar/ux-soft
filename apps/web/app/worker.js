
self.addEventListener('fetch', event => {
    console.log('====================================');
    console.log('Version: 1.0.0.0');
    console.log(Date.now());
    console.log(event.request.url);
    console.log(event.request.url);
    event.respondWith(fetch(event.request));
});