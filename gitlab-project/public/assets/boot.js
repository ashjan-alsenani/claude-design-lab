/* Runs before the page paints: language, direction and theme, so there is no flash of the wrong layout. */
try{var l=localStorage.getItem("dtd-lang")||"en";document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr";document.documentElement.dataset.ws=localStorage.getItem("dtd-ws")==="vendors"?"vendors":"main"}catch(e){}
try{var t=localStorage.getItem("dtd-theme");document.documentElement.dataset.theme=t||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){document.documentElement.dataset.theme="light"}
