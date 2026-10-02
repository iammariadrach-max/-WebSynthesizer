import * as Tone from 'tone'

export const pattern = [
  'LOW',
  'EMPTY',
  'NOISE',
  'HIGH',
  'LOW',
  'EMPTY',
  'NOISE',
  'HIGH'
]
export const settings = { bpm: 100, clarity: 6000, interference: 0, trace: 20 }

let lowSynth, highSynth, noiseSynth, filter, delay
let interferenceNoise, interferenceGain, output, limiter, sequence, transport
let playing = false
let starting = false
let requestId = 0
let showStep = () => {}

function createDelay() {
  delay = new Tone.FeedbackDelay({
    delayTime: 0.3,
    maxDelay: 1,
    feedback: (settings.trace / 100) * 0.65,
    wet: (settings.trace / 100) * 0.5
  })
  filter.chain(delay, output)
}

function initAudio() {
  if (sequence) return

  transport = Tone.getTransport()
  output = new Tone.Gain(0)
  limiter = new Tone.Limiter(-6).toDestination()
  output.connect(limiter)

  filter = new Tone.Filter({
    type: 'lowpass',
    frequency: settings.clarity,
    rolloff: -24,
    Q: 0.7
  })

  lowSynth = new Tone.MembraneSynth({
    volume: -12,
    octaves: 3,
    pitchDecay: 0.03,
    envelope: { attack: 0.002, decay: 0.1, sustain: 0, release: 0.08 }
  }).connect(filter)

  highSynth = new Tone.Synth({
    volume: -16,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.06, sustain: 0, release: 0.05 }
  }).connect(filter)

  noiseSynth = new Tone.NoiseSynth({
    volume: -22,
    noise: { type: 'white' },
    envelope: { attack: 0.002, decay: 0.035, sustain: 0, release: 0.02 }
  }).connect(filter)

  interferenceGain = new Tone.Gain((settings.interference / 100) * 0.035)
  interferenceNoise = new Tone.Noise({
    type: 'pink',
    fadeIn: 0.02,
    fadeOut: 0.02
  })
  interferenceNoise.chain(interferenceGain, output)

  sequence = new Tone.Sequence(
    (time, index) => {
      if (!playing) return

      switch (pattern[index]) {
        case 'LOW':
          lowSynth.triggerAttackRelease('C2', 0.08, time, 0.8)
          break
        case 'HIGH':
          highSynth.triggerAttackRelease('B4', 0.08, time, 0.65)
          break
        case 'NOISE':
          noiseSynth.triggerAttackRelease(0.04, time, 0.6)
          break
      }

      const currentRequest = requestId
      Tone.getDraw().schedule(() => {
        if (playing && currentRequest === requestId) showStep(index)
      }, time)
    },
    [0, 1, 2, 3, 4, 5, 6, 7],
    '8n'
  )

  sequence.loop = true
}

export function changeParameter(name, value) {
  const ranges = {
    bpm: [60, 160],
    clarity: [400, 12000],
    interference: [0, 100],
    trace: [0, 100]
  }
  if (!ranges[name] || !Number.isFinite(value)) return
  const [min, max] = ranges[name]
  settings[name] = Math.max(min, Math.min(max, value))

  if (!sequence) return

  switch (name) {
    case 'bpm':
      transport.bpm.rampTo(settings.bpm, 0.1)
      break
    case 'clarity':
      filter.frequency.rampTo(settings.clarity, 0.05)
      break
    case 'interference':
      interferenceGain.gain.rampTo((settings.interference / 100) * 0.035, 0.05)
      break
    case 'trace':
      if (delay) {
        delay.wet.rampTo((settings.trace / 100) * 0.5, 0.05)
        delay.feedback.rampTo((settings.trace / 100) * 0.65, 0.05)
      }
      break
  }
}

export async function play(onStep) {
  if (playing || starting) return false
  const currentRequest = ++requestId
  starting = true
  showStep = onStep

  try {
    await Tone.start()

    if (currentRequest !== requestId) return false

    initAudio()
    if (!delay) createDelay()
    transport.bpm.value = settings.bpm

    const time = Tone.now() + 0.02
    output.gain.cancelAndHoldAtTime(Tone.immediate())
    output.gain.linearRampToValueAtTime(0.5, time)
    playing = true
    sequence.start(0)
    interferenceNoise.start(time)
    transport.start(time, 0)
    return true
  } catch (error) {
    if (currentRequest === requestId) {
      disposeAudio()
      throw error
    }
    return false
  } finally {
    if (currentRequest === requestId) starting = false
  }
}

export function stop() {
  requestId += 1
  playing = false
  starting = false
  showStep(-1)
  if (!transport) return

  const time = Tone.immediate()
  sequence?.stop(0)
  transport.stop(time)
  Tone.getDraw().cancel()
  output.gain.cancelAndHoldAtTime(time)
  output.gain.linearRampToValueAtTime(0, time + 0.02)
  interferenceNoise?.stop(time)

  for (const synth of [lowSynth, highSynth, noiseSynth]) {
    if (!synth) continue

    synth.envelope.cancel(time)
    synth.triggerRelease(time)
  }

  if (delay) {
    filter.disconnect(delay)
    delay.dispose()
    delay = undefined
  }
}

export function disposeAudio() {
  stop()
  for (const node of [
    sequence,
    lowSynth,
    highSynth,
    noiseSynth,
    interferenceNoise,
    interferenceGain,
    filter,
    output,
    limiter
  ]) {
    node?.dispose()
  }
  sequence = lowSynth = highSynth = noiseSynth = filter = undefined
  interferenceNoise =
    interferenceGain =
    output =
    limiter =
    transport =
      undefined
}
