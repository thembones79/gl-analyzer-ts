export const reRenderFooter = () => {
	const footer = document.querySelector(".footer");
	footer.outerHTML = renderFooter();
};

export const renderFooter = () => {
	const message = window.perm.editor
		? `<div class="footer"><p>You are not allowed do save! User: <strong>${window.perm.editor}</strong> is editing now! Please refresh the page and try again later :)</p></div>`
		: `<div class="footer"><h2>Bro! Who are you?</h2></div>`;
	return window.perm.canEdit
		? `<div class="footer"><button class="btn btn--hidden" onclick="onSave(this)">Save</button></div>`
		: message;
};
