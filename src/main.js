import {
  pattern,
  settings,
  changeParameter,
  play,
  stop,
  playMelody,
  stopMelody,
  disposeAudio
} from './audio.js'

const currentStep = document.getElementById('currentStep')
const stepButtons = [...document.querySelectorAll('.step')]
const states = ['EMPTY', 'LOW', 'HIGH', 'NOISE']

let activeStep = -1

function renderSteps() {
  stepButtons.forEach((button, index) => {
    const number = String(index + 1).padStart(2, '0')
    const active = index === activeStep

    button.textContent = `${number} ${pattern[index]}`
    button.classList.toggle('active', active)
    button.setAttribute('aria-current', active ? 'step' : 'false')

    button.setAttribute(
      'aria-label',
      `Шаг ${number}: ${pattern[index]}. Нажмите, чтобы сменить звук.`
    )
  })

  currentStep.textContent =
    activeStep < 0
      ? 'Текущий шаг: —'
      : `Текущий шаг: ${String(activeStep + 1).padStart(2, '0')}`
}

function showStep(index) {
  activeStep = index
  renderSteps()
}

stepButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    pattern[index] =
      states[(states.indexOf(pattern[index]) + 1) % states.length]

    renderSteps()
  })
})

for (const name of ['bpm', 'clarity', 'interference', 'trace', 'melody']) {
  const input = document.getElementById(name)
  const label = document.getElementById(`${name}Value`)

  const unit = name === 'clarity' ? ' Hz' : name === 'bpm' ? '' : '%'

  input.value = settings[name]
  label.value = `${settings[name]}${unit}`

  input.addEventListener('input', () => {
    changeParameter(name, Number(input.value))
    label.value = `${settings[name]}${unit}`
  })
}

function setupTransport(options) {
  const playButton = document.getElementById(options.playId)
  const stopButton = document.getElementById(options.stopId)
  const status = document.getElementById(options.statusId)
  const error = document.getElementById(options.errorId)

  let actionId = 0

  playButton.addEventListener('click', async () => {
    const currentAction = ++actionId

    playButton.disabled = true
    stopButton.disabled = false
    error.hidden = true
    status.textContent = 'Включение звука…'

    try {
      const started = await options.play(options.onStep)

      if (currentAction !== actionId) return

      if (started) {
        status.textContent = options.playingMessage
      } else {
        playButton.disabled = false
        stopButton.disabled = true
        status.textContent = options.stoppedMessage
      }
    } catch (cause) {
      if (currentAction !== actionId) return

      console.error('Не удалось включить звук:', cause)

      playButton.disabled = false
      stopButton.disabled = true
      status.textContent = 'Остановлено.'

      error.textContent =
        'Не удалось включить звук. Проверьте разрешение браузера на воспроизведение и нажмите PLAY ещё раз.'

      error.hidden = false
    }
  })

  function stopPlayback() {
    actionId += 1

    options.stop()

    playButton.disabled = false
    stopButton.disabled = true
    status.textContent = options.stoppedMessage
  }

  stopButton.addEventListener('click', stopPlayback)

  return stopPlayback
}

const stopTapePlayback = setupTransport({
  playId: 'playButton',
  stopId: 'stopButton',
  statusId: 'status',
  errorId: 'error',
  play,
  stop,
  onStep: showStep,
  playingMessage: 'Приём сигнала. Лента воспроизводится по кругу.',
  stoppedMessage: 'Лента остановлена. Следующий PLAY начнёт с шага 01.'
})

const stopMelodyPlayback = setupTransport({
  playId: 'melodyPlayButton',
  stopId: 'melodyStopButton',
  statusId: 'melodyStatus',
  errorId: 'melodyError',
  play: playMelody,
  stop: stopMelody,
  playingMessage: 'Голос экосистемы. Мелодия воспроизводится по кругу.',
  stoppedMessage:
    'Мелодия остановлена. Следующий PLAY начнёт композицию сначала.'
})

window.addEventListener('pagehide', () => {
  stopTapePlayback()
  stopMelodyPlayback()
  disposeAudio()
})

renderSteps()
