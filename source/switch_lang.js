let switch_button = document.querySelector('.button-lang');
let paragraphs = document.querySelectorAll('p');


// Firstly make all English paragraph invisible
function hide_paragraphs(current_lang) {
	for (let p of paragraphs) {
		if (p.lang == current_lang) {
			p.style.display = 'none';
		} else {
			p.style.display = 'block';
		}
	}
}

switch_button.onclick = function () {
	if (switch_button.value == 'English') {
		hide_paragraphs('ru');
		switch_button.value = 'Русский';
	} else {
		hide_paragraphs('en');
		switch_button.value = 'English';
	}
};

hide_paragraphs('en')