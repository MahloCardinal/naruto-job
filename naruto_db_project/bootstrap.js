'use strict';

(async () => {
  try {
    await LOCALIZATION.ready;
    await loadAssetScript('app.js', { verify: () => !!window.NarutoApp });
  } catch (error) {
    console.error(error);
    const notice = document.createElement('p'),
      retry = document.createElement('button');
    notice.setAttribute('role', 'alert');
    notice.textContent = 'Unable to load the page. Please try again. ';
    retry.textContent = 'Reload';
    retry.onclick = () => location.reload();
    notice.append(retry);
    document.querySelector('.shell').prepend(notice);
  }
})();
