import {
  pattern,
  settings,
  changeParameter,
  play,
  stop,
  disposeAudio
} from './audio.js'

const playButton = document.getElementById('playButton')
const stopButton = document.getElementById('stopButton')
const status = document.getElementById('status')
const error = document.getElementById('error')
const currentStep = document.getElementById('currentStep')
const stepButtons = [...document.querySelectorAll('.step')]
const states = ['EMPTY', 'LOW', 'HIGH', 'NOISE']
let activeStep = -1
let actionId = 0

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

for (const name of ['bpm', 'clarity', 'interference', 'trace']) {
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

playButton.addEventListener('click', async () => {
  const currentAction = ++actionId
  playButton.disabled = true
  stopButton.disabled = false
  error.hidden = true
  status.textContent = 'Включение звука…'

  try {
    const started = await play(showStep)
    if (currentAction !== actionId) return
    if (started)
      status.textContent = 'Приём сигнала. Лента воспроизводится по кругу.'
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
  stop()
  playButton.disabled = false
  stopButton.disabled = true
  status.textContent = 'Остановлено. Следующий PLAY начнёт с шага 01.'
}

stopButton.addEventListener('click', stopPlayback)

window.addEventListener('pagehide', () => {
  stopPlayback()
  disposeAudio()
})

renderSteps()
