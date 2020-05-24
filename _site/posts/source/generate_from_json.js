'use strict';

let json_url = "source/posts.json"

function liline(title, url) {
	return `<li><a href="${url}">${title}</a></li>`;
}

function make_ul(id, titles, urls, tags, views) {
	for (let i=0; i<titles.length; i++) {
		if (tags[i] == id) {
			let title = titles[i];
			let url = urls[i];
			let view = views[i];
			let li = document.getElementById(id);
			li.innerHTML += liline(title, url);
		}
	}
}


async function get_json_file(url=json_url){
	let response = await fetch(url);
	let text = await response.text();
	let data = JSON.parse(text);
	
	let titles = Object.values(data["title"]);
	let urls   = Object.values(data["url"]);
	let tags   = Object.values(data["main"]);
	let views  = Object.values(data["views"]);
	make_ul("Python", titles, urls, tags, views);
	make_ul("Data Science", titles, urls, tags, views);
	make_ul("Глубокое обучение", titles, urls, tags, views);

}

get_json_file()