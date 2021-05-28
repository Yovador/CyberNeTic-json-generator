//Fonction créant une nouvelle div
const CreateNewDiv = (content, parent, id, classStyle, getDiv, customStyle) => {
    const div = document.createElement('div');
    if (classStyle != null) { div.className = classStyle }
    if (id != null) { div.id = id }
    if (customStyle != null) { div.style = customStyle }
    if (content != null) {div.innerHTML = content}
    if (parent != null) { parent.appendChild(div) } else { document.body.appendChild(div) }
    if (getDiv) { return div }
}

export default CreateNewDiv;