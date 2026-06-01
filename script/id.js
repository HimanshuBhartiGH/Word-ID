function sanitize(word) {
	return word.replace(/[^\w\d]+/g, '');
}

function processHTML(text, filename) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(text, 'text/html');
	const paragraphs = doc.querySelectorAll('p.para');

	paragraphs.forEach((p, index) => {
		let wordCount = 1;
		const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null, false);
		const replacements = [];

		while (walker.nextNode()) {
			const node = walker.currentNode;
			const parts = node.nodeValue.split(/(\s+|&[#a-zA-Z0-9]+;)/);

			const fragment = document.createDocumentFragment();

			parts.forEach(part => {
				if (/^\s+$/.test(part) || /^(&#[xX]?[0-9a-fA-F]+;|&[a-zA-Z]+;)$/.test(part)) {
					fragment.appendChild(document.createTextNode(part));
				} else if (part.trim().length > 0) {
					const id = `${filename}para${index + 1}word${wordCount++}_${sanitize(part)}`;
					const span = document.createElement('span');
					span.setAttribute('id', id);
					span.textContent = part;
					fragment.appendChild(span);
				}
			});

			replacements.push({ node, fragment });
		}

		replacements.forEach(({ node, fragment }) => {
			node.parentNode.replaceChild(fragment, node);
		});
	});

	const serializer = new XMLSerializer();
	return serializer.serializeToString(doc);
}

async function handleSingle() {
	const input1 = document.getElementById('fileInput1');
	if (input1.files.length !== 1) {
		alert('Please select exactly one HTML file.');
		return;
	}

	const file = input1.files[0];
	const filename = file.name.replace(/\.html?$/i, '');
	const text = await file.text();
	const processed = processHTML(text, filename);
	const blob = new Blob([processed], { type: 'text/html' });
	const url = URL.createObjectURL(blob);

	document.getElementById('output').innerHTML = `
		<a href="${url}" download="${filename}.html">Download Modified File</a>
					  `;
}

async function handleMultiple() {
	const input2 = document.getElementById('fileInput2');
	if (input2.files.length === 0) {
		alert('Please select one or more HTML files.');
		return;
	}

	const zip = new JSZip();

	for (let file of input2.files) {
		const filename = file.name.replace(/\.html?$/i, '');
		const text = await file.text();
		const processed = processHTML(text, filename);
		zip.file(`${filename}.html`, processed);
	}

	const blob = await zip.generateAsync({ type: 'blob' });
	const url = URL.createObjectURL(blob);

	document.getElementById('output').innerHTML = `
		<a href="${url}" download="files.zip">Download All Wrapped Files (ZIP)</a>
					  `;
}