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

export const melodyNotes = ['C4', 'E4', 'G4', 'B4', 'A4', 'G4', 'E4', 'D4']

export const settings = {
  bpm: 100,
  clarity: 6000,
  interference: 0,
  trace: 20,
  melody: 60
}

let lowSynth, highSynth, noiseSynth, melodySynth, filter, delay
let tapeGain, melodyGain, interferenceNoise, interferenceGain, output, limiter
let sequence, melodySequence, transport
let transportRunning = false

const tracks = {
  tape: {
    playing: false,
    starting: false,
    requestId: 0,
    showStep: () => {}
  },
  melody: {
    playing: false,
    starting: false,
    requestId: 0,
    showStep: () => {}
  }
}

function createDelay() {
  delay = new Tone.FeedbackDelay({
    delayTime: 0.3,
    maxDelay: 1,
    feedback: (settings.trace / 100) * 0.65,
    wet: (settings.trace / 100) * 0.5
  })

  filter.chain(delay, output)
}

function drawStep(track, index, time) {
  const currentRequest = track.requestId

  Tone.getDraw().schedule(() => {
    if (track.playing && currentRequest === track.requestId) {
      track.showStep(index)
    }
  }, time)
}

function initAudio() {
  if (sequence && melodySequence) return

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

  tapeGain = new Tone.Gain(0).connect(filter)
  melodyGain = new Tone.Gain(0).connect(filter)

  lowSynth = new Tone.MembraneSynth({
    volume: -12,
    octaves: 3,
    pitchDecay: 0.03,
    envelope: {
      attack: 0.002,
      decay: 0.1,
      sustain: 0,
      release: 0.08
    }
  }).connect(tapeGain)

  highSynth = new Tone.Synth({
    volume: -16,
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.005,
      decay: 0.06,
      sustain: 0,
      release: 0.05
    }
  }).connect(tapeGain)

  noiseSynth = new Tone.NoiseSynth({
    volume: -22,
    noise: {
      type: 'white'
    },
    envelope: {
      attack: 0.002,
      decay: 0.035,
      sustain: 0,
      release: 0.02
    }
  }).connect(tapeGain)

  melodySynth = new Tone.Synth({
    volume: -18,
    oscillator: {
      type: 'triangle'
    },
    portamento: 0.18,
    envelope: {
      attack: 0.6,
      decay: 0.5,
      sustain: 0.5,
      release: 3
    }
  }).connect(melodyGain)

  interferenceGain = new Tone.Gain((settings.interference / 100) * 0.035)

  interferenceNoise = new Tone.Noise({
    type: 'pink',
    fadeIn: 0.02,
    fadeOut: 0.02
  })

  interferenceNoise.chain(interferenceGain, output)

  sequence = new Tone.Sequence(
    (time, index) => {
      if (!tracks.tape.playing) return

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

      drawStep(tracks.tape, index, time)
    },
    [0, 1, 2, 3, 4, 5, 6, 7],
    '8n'
  )

  melodySequence = new Tone.Sequence(
    (time, index) => {
      if (!tracks.melody.playing) return

      melodySynth.triggerAttackRelease(melodyNotes[index], '2n.', time, 0.65)

      drawStep(tracks.melody, index, time)
    },
    melodyNotes.map((note, index) => index),
    '1m'
  )

  sequence.loop = true
  melodySequence.loop = true
}

export function changeParameter(name, value) {
  const ranges = {
    bpm: [60, 160],
    clarity: [400, 12000],
    interference: [0, 100],
    trace: [0, 100],
    melody: [0, 100]
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

    case 'melody':
      melodyGain.gain.rampTo(
        tracks.melody.playing ? settings.melody / 100 : 0,
        0.05
      )
      break
  }
}

async function startTrack(name, onStep) {
  const track = tracks[name]

  if (track.playing || track.starting) return false

  const currentRequest = ++track.requestId

  track.starting = true
  track.showStep = onStep

  try {
    await Tone.start()

    if (currentRequest !== track.requestId) return false

    initAudio()

    if (!delay) createDelay()

    const time = Tone.now() + 0.02

    const position = transportRunning
      ? `${Math.ceil(transport.getTicksAtTime(time))}i`
      : 0

    track.playing = true

    if (name === 'tape') {
      tapeGain.gain.rampTo(1, 0.02)
      sequence.start(position)
      interferenceNoise.start(time)
    } else {
      melodyGain.gain.rampTo(settings.melody / 100, 0.02)
      melodySequence.start(position)
    }

    if (!transportRunning) {
      transport.bpm.value = settings.bpm

      output.gain.cancelAndHoldAtTime(Tone.immediate())
      output.gain.linearRampToValueAtTime(0.5, time)

      transport.start(time, 0)
      transportRunning = true
    }

    return true
  } catch (error) {
    if (currentRequest === track.requestId) {
      stopTrack(name)

      // При ошибке инициализации не оставляем
      // частично созданную цепочку.
      if (!sequence || !melodySequence) {
        disposeAudio()
      }

      throw error
    }

    return false
  } finally {
    if (currentRequest === track.requestId) {
      track.starting = false
    }
  }
}

function stopTrack(name) {
  const track = tracks[name]

  track.requestId += 1
  track.playing = false
  track.starting = false
  track.showStep(-1)

  if (!transport) return

  const time = Tone.immediate()
  const gain = name === 'tape' ? tapeGain : melodyGain

  if (gain) {
    gain.gain.cancelAndHoldAtTime(time)
    gain.gain.linearRampToValueAtTime(0, time + 0.02)
  }

  if (name === 'tape') {
    sequence?.stop(0)
    interferenceNoise?.stop(time)
  } else {
    melodySequence?.stop(0)
  }

  const synths =
    name === 'tape' ? [lowSynth, highSynth, noiseSynth] : [melodySynth]

  for (const synth of synths) {
    if (!synth) continue

    synth.envelope.cancel(time)
    synth.triggerRelease(time)
  }

  if (tracks.tape.playing || tracks.melody.playing) return

  transport.stop(time)
  transportRunning = false

  Tone.getDraw().cancel()

  if (output) {
    output.gain.cancelAndHoldAtTime(time)
    output.gain.linearRampToValueAtTime(0, time + 0.02)
  }

  if (delay) {
    filter.disconnect(delay)
    delay.dispose()
    delay = undefined
  }
}

export function play(onStep = () => {}) {
  return startTrack('tape', onStep)
}

export function stop() {
  stopTrack('tape')
}

export function playMelody(onNote = () => {}) {
  return startTrack('melody', onNote)
}

export function stopMelody() {
  stopTrack('melody')
}

export function disposeAudio() {
  stop()
  stopMelody()

  for (const node of [
    sequence,
    melodySequence,
    lowSynth,
    highSynth,
    noiseSynth,
    melodySynth,
    tapeGain,
    melodyGain,
    interferenceNoise,
    interferenceGain,
    filter,
    output,
    limiter
  ]) {
    node?.dispose()
  }

  sequence = melodySequence = undefined
  lowSynth = highSynth = noiseSynth = melodySynth = undefined
  tapeGain = melodyGain = filter = undefined

  interferenceNoise =
    interferenceGain =
    output =
    limiter =
    transport =
      undefined

  transportRunning = false
}
