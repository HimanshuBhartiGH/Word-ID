document.getElementById('convertButton').addEventListener('click', async () => {
	const files = Array.from(document.getElementById('htmlFiles').files);
	if (files.length === 0) {
		alert('Please upload at least one HTML file.');
		return;
	}

	const myths = {};

	for (const file of files) {
		const content = await file.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(content, 'text/html');
		const spans = doc.querySelectorAll('span[id]');
		const entries = [];

		spans.forEach(span => {
			const id = span.id;
			let word = (span.textContent || "").trim();
			word = word.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ''); // remove punctuation and extra spaces
			entries.push({ id, word });
		});

		const baseName = file.name.replace(/\.html?$/i, '');
		myths[baseName] = entries;
	}

	const blob = new Blob([JSON.stringify(myths, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const link = document.getElementById('downloadLink');
	link.href = url;
	link.style.display = 'inline';
	link.textContent = 'Download MYTHS.json';
});
