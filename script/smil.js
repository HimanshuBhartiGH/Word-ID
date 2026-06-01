let htmlFileName = '';
let wordIds = [];

    // Handle HTML File Upload
document.getElementById('htmlFile').addEventListener('change', function(event) {
	const file = event.target.files[0];
	if (!file) return;

	htmlFileName = file.name;
	const reader = new FileReader();

	reader.onload = function(e) {
		const htmlText = e.target.result;

	// Parse HTML and extract all span IDs
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlText, 'text/html');
		const spans = doc.querySelectorAll('span[id]');
		wordIds = Array.from(spans).map(span => span.id);
	};

	reader.readAsText(file);
});

    // Handle Conversion
document.getElementById('convertBtn').addEventListener('click', function () {
	const labelText = document.getElementById('audioLabels').value.trim();
	if (!htmlFileName || wordIds.length === 0 || !labelText) {
		alert("Please upload an HTML file and paste audio labels.");
		return;
	}

	const lines = labelText.split('\n');
	const timings = lines.map(line => {
		const [start, end] = line.trim().split(/\s+/);
		return {
start: Math.floor(parseFloat(start) * 1000) + 'ms',
end: Math.floor(parseFloat(end) * 1000) + 'ms'
		};
	});

	const baseName = htmlFileName.replace(/\.html$/, '');
	const smilParts = [
			  '<?xml version="1.0" encoding="UTF-8"?>',
			  '<smil xmlns="http://www.w3.org/ns/SMIL" version="3.0">',
			  '<body>'
			  ];

	for (let i = 0; i < Math.min(wordIds.length, timings.length); i++) {
		const id = wordIds[i];
		const { start, end } = timings[i];
		smilParts.push(
			       `<par><text src="../html/${baseName}/${htmlFileName}#${id}"/><audio src="../audio/${baseName}.mp3" clipBegin="${start}" clipEnd="${end}"/></par>`
			      );
	}

	smilParts.push('</body>', '</smil>');
	const smilContent = smilParts.join('\n');
	const smilBlob = new Blob([smilContent], { type: 'application/smil+xml' });

	const smilFileName = `${baseName}.smil`;
	const link = document.getElementById('downloadLink');
	link.href = URL.createObjectURL(smilBlob);
	link.download = smilFileName;
	link.textContent = `Download ${smilFileName}`;
	link.style.display = 'inline-block';
});
