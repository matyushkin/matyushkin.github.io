// Leo Matyushkin matyushkin.github.io/spb
let add_person_btn = document.querySelector('.add-person-btn');

add_person_btn.onclick = function() {
	console.log('Нажата кнопка создания новой категории');
	let persons_cards = document.querySelector('.persons');
	let person_card = document.querySelector('.person');
	let new_person_card = document.createElement("div");
	new_person_card.innerHTML = person_card.innerHTML;
	persons_cards.appendChild(new_person_card);
};