console.log("Hi! I'm here!");

let tags_button = document.querySelector('.filters-item_theme_main.filter-tag');
let month_button = document.querySelector('.filters-item_theme_main.filter-month');
let location_button = document.querySelector('.filters-item_theme_main.filter-location');

let filters__list = document.querySelector('.filters__list');
let tags_container = filters__list.querySelector('.filter-tag');
let month_container = filters__list.querySelector('.filter-month');
let location_container = filters__list.querySelector('.filter-location');

let selected_buttons = [tags_button, month_button, location_button];

map = new Map();
map.set(tags_button, tags_container);
map.set(month_button, month_container);
map.set(location_button, location_container);

function containers_switcher(button) {
    let other_buttons = selected_buttons.filter(function(e) {return e !== button});
    // Если кнопка была выбрана ранее
    if (button.classList.contains("filters-item_selected")) {
        map.get(button).classList.add("filter-hidden");
        // Снимаем класс
        button.classList.remove("filters-item_selected");
    } else {
        for (other_button of other_buttons) {
            map.get(other_button).classList.add("filter-hidden");
            other_button.classList.remove("filters-item_selected");
        }
        map.get(button).classList.remove("filter-hidden");
        button.classList.add("filters-item_selected");
        corresponding_events_cards(button);        
    }
}

for (let button of selected_buttons) {
    button.onclick = function() {
        containers_switcher(button);
    };
}

function select_cards (tags) {
    for (let elem of document.querySelectorAll('.event')) {
        let data_tag_string = elem.getAttribute('data-tags');
        let cnt = 0;
        for (let tag of tags) {
            if (data_tag_string.indexOf(tag) >=0) {
                cnt += 1;
            }
        }
        if (cnt == 0) {
            elem.classList.add('filter-hidden');
        } else {
            elem.classList.remove('filter-hidden');
        }
    }
}

function corresponding_events_cards(button) {
    container = map.get(button);
    btns = container.querySelectorAll('.filters-item_theme_simple');
    for (let btn of btns) {
        btn.onclick = function() {
            btn.classList.toggle('filter-selected');
            let btns_selected = document.querySelectorAll('.filter-selected');
            let tags_selected = [];
            for (let btn_selected of btns_selected) {
                let tag = btn_selected.textContent;
                tags_selected.push(tag);
            }
            select_cards(tags_selected);
        }
    }
}