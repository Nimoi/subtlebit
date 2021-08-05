/**
 * DOM Stuff
 */
export function addToDom(selector, className, html, element = "div") {
    let container = document.createElement(element);
    container.className = className;
    container.innerHTML = html;
    document.querySelector(selector).appendChild(container);
}
