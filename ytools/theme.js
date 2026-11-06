(function(){var t;try{t=localStorage.getItem('ytheme')}catch(e){}var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=d?'dark':'light';})();
