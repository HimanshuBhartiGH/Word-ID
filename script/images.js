async function processPDF() {
	const file = document.getElementById('pdfFile').files[0];
	if (!file) return alert('Please upload a PDF file');

	const thumbHeight = parseInt(document.getElementById('thumbHeight').value) || 104;
	const imageHeight = parseInt(document.getElementById('imageHeight').value) || 900;

	const fileReader = new FileReader();
	fileReader.onload = async function () {
		const typedArray = new Uint8Array(this.result);
		const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

		const zip = new JSZip();
		const thumbsFolder = zip.folder("thumbnails");
		const imagesFolder = zip.folder("images");

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const viewport = page.getViewport({ scale: 1 });
			const dpiScale = 300 / 72;

// Helper to render and export JPEG
			const renderAndExport = async (targetHeight, folder) => {
				const scale = dpiScale * (targetHeight / (viewport.height * dpiScale));
				const scaledViewport = page.getViewport({ scale });

				const canvas = document.createElement('canvas');
				const context = canvas.getContext('2d');
				canvas.width = scaledViewport.width;
				canvas.height = scaledViewport.height;

				await page.render({ canvasContext: context, viewport: scaledViewport }).promise;

				return new Promise(resolve => {
					canvas.toBlob(blob => {
						const fileName = `page${String(i).padStart(3, '0')}.jpg`;
						folder.file(fileName, blob);
						resolve();
					}, 'image/jpeg', 0.9);
				});
			};

			await renderAndExport(thumbHeight, thumbsFolder);
			await renderAndExport(imageHeight, imagesFolder);
		}

		const zipBlob = await zip.generateAsync({ type: "blob" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(zipBlob);
		link.download = "pdf_images.zip";
		link.click();
	};

	fileReader.readAsArrayBuffer(file);
}
