let body = document.querySelector('body');
let themeButton = document.querySelector('.theme-button');

themeButton.onclick = function() {
	console.log('Кнопка нажата');
  	body.classList.toggle('light-theme');
  	body.classList.toggle('dark-theme');
};