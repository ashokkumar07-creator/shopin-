(() => {
  document.addEventListener('DOMContentLoaded',()=>{
    const picker=document.getElementById('starPicker'),hint=document.getElementById('ratingHint'),form=document.getElementById('reviewForm');
    const captions={1:'We’ll make it better.',2:'Thanks for your honest feedback.',3:'Glad you enjoyed it.',4:'We’re happy you liked it!',5:'Wonderful! Thanks for the love.'};
    picker.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{const rating=Number(button.dataset.val);picker.querySelectorAll('button').forEach(star=>star.setAttribute('aria-pressed',Number(star.dataset.val)===rating?'true':'false'));hint.textContent=captions[rating]}));
    form.addEventListener('submit',()=>setTimeout(()=>{if(Number(picker.dataset.rating)===0){picker.querySelectorAll('button').forEach(star=>star.setAttribute('aria-pressed','false'));hint.textContent='Tap a star to rate your experience.'}},0));
  });
})();