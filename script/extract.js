function parsePageRange(rangeStr, totalPages) {
	const pages = new Set();
	rangeStr.split(',').forEach(part => {
		if (part.includes('-')) {
			const [start, end] = part.split('-').map(Number);
			for (let i = start; i <= end; i++) {
				if (i >= 1 && i <= totalPages) pages.add(i - 1); // 0-indexed
			}
		} else {
			const pageNum = parseInt(part);
			if (pageNum >= 1 && pageNum <= totalPages) pages.add(pageNum - 1);
		}
	});
	return Array.from(pages).sort((a, b) => a - b);
}

async function extractPages() {
	const fileInput = document.getElementById('pdfFile');
	const rangeInput = document.getElementById('pageRange');
	const output = document.getElementById('output');
	output.innerHTML = '';

	if (!fileInput.files.length) {
		output.textContent = 'Please upload a PDF file.';
		return;
	}

	const file = fileInput.files[0];
	const arrayBuffer = await file.arrayBuffer();
	const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
	const totalPages = pdfDoc.getPageCount();

	const selectedPages = parsePageRange(rangeInput.value, totalPages);
	if (!selectedPages.length) {
		output.textContent = 'No valid pages selected.';
		return;
	}

	const newPdfDoc = await PDFLib.PDFDocument.create();
	const copiedPages = await newPdfDoc.copyPages(pdfDoc, selectedPages);
	copiedPages.forEach(p => newPdfDoc.addPage(p));

	const pdfBytes = await newPdfDoc.save();
	const blob = new Blob([pdfBytes], { type: 'application/pdf' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'extracted-pages.pdf';
	link.textContent = 'Download Extracted PDF';
	output.appendChild(link);
}
