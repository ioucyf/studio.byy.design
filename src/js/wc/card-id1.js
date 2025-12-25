import styles from "./card-id1.css" with { type: "text" };

const style = document.createElement("style");
style.append(styles);

const template = document.createElement("template");
template.content.append(style);

console.log(template);
