/* Offline support: only on http(s); a file:// copy works without it. */
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol))addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})
