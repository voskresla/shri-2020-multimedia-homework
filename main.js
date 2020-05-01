document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.container').forEach(e => {
		e.addEventListener('click', (e) => {
			let drawVisual, audioCtx

			transition = e.currentTarget.querySelector('.transition')
			video = e.target

			// show full screen
			const { x, y } = transition.getBoundingClientRect()

			if (transition.classList.contains('fullscreen')) {
				return
			}

			transition.style.transform = `translate(${-x}px, ${-y}px)`;
			transition.style.zIndex = 10
			transition.classList.add('fullscreen')

			console.log(video)
			video.muted = false

			// add controls
			const controlsElement = document.createElement('div')
			controlsElement.classList.add('controls')

			const inputBright = document.createElement('input')
			inputBright.type = 'range'
			inputBright.value = 1
			inputBright.min = '0'
			inputBright.max = '2'
			inputBright.step = '0.01'
			inputBright.classList.add('inputBright')
			controlsElement.appendChild(inputBright)

			const inputContrast = document.createElement('input')
			inputContrast.type = 'range'
			inputContrast.value = 1
			inputContrast.min = '0'
			inputContrast.max = '2'
			inputContrast.step = '0.01'
			inputContrast.classList.add('inputContrast')
			controlsElement.appendChild(inputContrast)

			inputBright.addEventListener('click', (e) => {
				e.stopPropagation()
			});
			inputBright.addEventListener('input', (e) => {
				video.style.filter = `brightness(${e.target.value}) contrast(${inputContrast.value})`;
			});
			inputContrast.addEventListener('click', (e) => {
				e.stopPropagation()
			});
			inputContrast.addEventListener('input', (e) => {
				video.style.filter = `contrast(${e.target.value}) brightness(${inputBright.value})`;
			});

			// add canvas
			const volume = document.createElement('canvas')
			controlsElement.appendChild(volume)

			const closeButton = document.createElement('div')
			closeButton.classList.add('close')
			closeButton.textContent = 'х'

			transition.appendChild(controlsElement)
			transition.appendChild(closeButton)

			// process audio
			if (!audioCtx) {

				const AudioContext = window.AudioContext || window.webkitAudioContext;
				let audioCtx = new AudioContext();
				let analyser = audioCtx.createAnalyser();

				analyser.connect(audioCtx.destination);
				analyser.fftSize = 256

				let source = audioCtx.createMediaElementSource(video)
				source.connect(analyser)

				let bufferLength = analyser.frequencyBinCount
				let dataArray = new Uint8Array(bufferLength)

				let canvas = document.querySelector("canvas")
				canvas.width = 200
				canvas.height = 100
				let ctx = canvas.getContext("2d")
				let WIDTH = canvas.width;
				let HEIGHT = canvas.height;
				let barWidth = (WIDTH / bufferLength) * 2.5
				let barHeight
				let xxx = 0
				function renderFrame() {
					drawVisual = requestAnimationFrame(renderFrame);
					xxx = 0;
					analyser.getByteFrequencyData(dataArray);
					ctx.fillStyle = "#000";
					ctx.fillRect(0, 0, WIDTH, HEIGHT);
					for (let i = 0; i < bufferLength; i++) {
						barHeight = dataArray[i];

						let r = barHeight + (25 * (i / bufferLength));
						let g = 250 * (i / bufferLength);
						let b = 50;
						ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
						ctx.fillRect(xxx, HEIGHT - barHeight, barWidth, barHeight);
						xxx += barWidth + 1;
					}
				}
				renderFrame()
			}
			// remove all created
			closeButton.addEventListener('click', (e) => {
				e.stopPropagation()
				video.muted = true
				window.cancelAnimationFrame(drawVisual);
				transition.style.transform = `none`;
				transition.classList.remove('fullscreen')
				transition.style.zIndex = 0
				transition.removeChild(controlsElement)
				transition.removeChild(closeButton)

			})
		})
	})
})