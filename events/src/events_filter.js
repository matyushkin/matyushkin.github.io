/*
Обрабатывает выбранные фильтры для того, чтобы отобразить 
соответствующие карточки мероприятий.


TODO: 
- Вкладки фильтров не складываются обратно
- Отталкиваемся от карточек: функция соответствия всем условиям текущих выбранных кнопок:
- Если хотя бы один из тегов есть, хотя бы одна из локаций, соответствует месяц, цена и тип - удаляем filter-hidden
- Ближайшие это все
- Вместо filter-hidden более правильно: просто hidden

*/

// Перечислим вкладки фильтров
let tabs = document.querySelectorAll('.filter__tab');
let [tag_tab, month_tab, loc_tab, type_tab, price_btn] = tabs;
tabs = [tag_tab, month_tab, loc_tab, type_tab];

// Перечислим контейнеры, соответствующие вкладкам фильтров
let containers = document.querySelector('.filter__list').childNodes;
let [tag_cont, month_cont, loc_cont, type_cont] = containers;

// Найдем карточки событий
let events = document.querySelectorAll('.event');


// Сопоставим между собой вкладки и контейнеры
let tc_map = new Map([
    [tag_tab,   tag_cont],
    [month_tab, month_cont],
    [loc_tab,   loc_cont],
    [type_tab,  type_cont]
]);


function switch_containers(active_tab) {
    /* Показывает контейнер активной вкладки, скрывая остальные контейнеры */
    let not_active_tabs = tabs.filter(function(e) {return e !== active_tab});
    // Если вкладка уже была выбрана раньше, скрываем контейнер и сворачиваем вкладку
    if (active_tab.classList.contains("filter__tab--selected")) {
        tc_map.get(active_tab).hidden = true;
        active_tab.classList.remove("filter__tab--selected");
    } else {
    // Если вкладка раньше не выбиралась, сворачиваем остальные контейнеры и раскрываем нужный
        for (let not_active_tab of not_active_tabs) {
            tc_map.get(not_active_tab).hidden = true;
            not_active_tab.classList.remove("filter__tab--selected");
        }
        tc_map.get(active_tab).hidden = false;
        active_tab.classList.add("filter__tab--selected");
    }
}

function intersect(a, b) {
    // Вспомогатеьная функция поиска пересечения массивов
    return a.filter(Set.prototype.has, new Set(b));
}

function check_tags(event) {
    let filter_tags = [];
    let event_tags = [];
    
    // Проверяем выбранные теги
    let filter_tags_selected = tag_cont.querySelectorAll('.filter__button--selected:not(.filter__button--all)');
    if (filter_tags_selected.length == 0) {
        // Если не выбрано ни одного тега, значит выбраны все
       filter_tags_selected = tag_cont.querySelectorAll('.filter__button:not(.filter__button--all)');
    }

    for (let tag of filter_tags_selected) {
        filter_tags.push(tag.textContent);
    }
    
    event_tags = event.dataset.tags.split(', ');
    intersection = intersect(filter_tags, event_tags);
    if (intersection.length == 0) {
        event.hidden = true;
    } else {
        event.hidden = false;
    }
}


function update_events() {
    /* Проверяет карточку события на соответствие выбранным фильтрам */
    for (let event of events) {
        check_tags(event);
    }
}



function update_btns(cont) {
    /* Обработка нажатий на кнопки фильтров */
    let btns = cont.querySelectorAll(".filter__button");
    let all_btn = cont.querySelector('.filter__button--all');

    for (let btn of btns) {
        btn.onclick = function() {  
            let common_btns = cont.querySelectorAll('.filter__button:not(.filter__button--all)');
            if (btn == all_btn) {
                // Нажатие кнопки с модификатором all отжимает остальные кнопки
                for (let common_btn of common_btns) {
                    common_btn.classList.remove('filter__button--selected');
                }
                all_btn.classList.add('filter__button--selected');
            }
            else {
                if (btn.classList.contains('filter__button--selected')) {
                    // Кнопка была нажата -- отжимаем
                    btn.classList.remove('filter__button--selected');
                } else {
                    // Кнопка не была нажата -- нажимаем, отжимаем кнопку all
                    btn.classList.add('filter__button--selected')                    
                    all_btn.classList.remove('filter__button--selected');
                }
                // Если все кнопки отжаты, кнопка all должна зажаться
                let common_btns_selected = cont.querySelectorAll('.filter__button--selected:not(.filter__button--all)');
                if (common_btns_selected.length == 0) {
                    all_btn.classList.add('filter__button--selected');
                }
            }
            // Фильтры обновлены -- нужно обновить и страницу
            update_events();
        }
    }
}


function main() {
    for (let tab of tabs) {
        tab.onclick = function() {
            switch_containers(tab);
        };
    }

    for (let cont of containers) {
        update_btns(cont);
    }
    
}


main();

// function select_cards (tags) {
//         let data_tag_string = elem.getAttribute('data-tags');
//         let cnt = 0;
//         for (let tag of tags) {
//             if (data_tag_string.indexOf(tag) >=0) {
//                 cnt += 1;
//             }
//         }
//         // !!! Сюда можно добавить проверки на соответствие остальным условиям
//         // В вызывающей функции можно сделать разделение по блокам
//         if (cnt == 0) {
//             elem.hidden = true;
//         } else {
//             elem.hidden = false;
//         }
//     }
// }

// function corresponding_events_cards(button) {
//             
//             let btns_selected = document.querySelectorAll('.filter-selected');
//             if (btns_selected.length > 0) {
//                 let tags_selected = [];
//                 for (let btn_selected of btns_selected) {
//                     let tag = btn_selected.textContent;
//                     tags_selected.push(tag);
//                 }
//                 select_cards(tags_selected);
//             } else {
//                 for (let elem of document.querySelectorAll('.event')) {
//                     elem.classList.hidden = false;
//                 }
//             }
//         }
//     }
// }