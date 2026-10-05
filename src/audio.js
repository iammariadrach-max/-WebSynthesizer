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

// «Ночной сигнал»: 32 такта, четыре раздела по 8 тактов.
// В каждой строке — один такт.
// Формат ноты: [доля внутри такта, нота, длительность в долях].
const melodyBars = [
  // 1–8: появление темы, много воздуха.
  [
    [0, 'C4', 1.5],
    [2.5, 'E4', 1]
  ],
  [
    [0.5, 'G4', 2],
    [3, 'E4', 0.75]
  ],
  [
    [0, 'E4', 1.5],
    [2, 'D4', 0.75],
    [3, 'C4', 0.75]
  ],
  [
    [1, 'B3', 1.5],
    [3, 'E4', 0.75]
  ],
  [
    [0, 'A4', 1.5],
    [2.5, 'G4', 1]
  ],
  [
    [0.5, 'E4', 1.5],
    [2.5, 'D4', 0.75]
  ],
  [
    [0, 'G4', 1.5],
    [2, 'A4', 0.75],
    [3, 'E4', 0.75]
  ],
  [
    [0.5, 'D4', 1],
    [2, 'C4', 1.5]
  ],

  // 9–16: ответ на тему, новые окончания и синкопы.
  [
    [0, 'E4', 1],
    [1.5, 'G4', 0.75],
    [3, 'B4', 0.75]
  ],
  [
    [0.5, 'D5', 1.5],
    [2.5, 'B4', 1]
  ],
  [
    [0, 'C5', 1.5],
    [2, 'B4', 0.5],
    [3, 'G4', 0.75]
  ],
  [
    [0.5, 'E4', 1.5],
    [2.5, 'A4', 1]
  ],
  [
    [0, 'G4', 1],
    [1.5, 'D5', 1],
    [3, 'E5', 0.75]
  ],
  [
    [0.5, 'D5', 1],
    [2, 'B4', 1.5]
  ],
  [
    [0, 'A4', 1.5],
    [2, 'G4', 0.75],
    [3, 'E4', 0.75]
  ],
  [
    [0.5, 'D4', 1],
    [2, 'G4', 1.5]
  ],

  // 17–24: раскрытие — выше регистр, плотнее фразы.
  [
    [0, 'C5', 1],
    [1.5, 'D5', 0.5],
    [2.5, 'E5', 1]
  ],
  [
    [0, 'G5', 1.5],
    [2, 'E5', 0.75],
    [3, 'D5', 0.75]
  ],
  [
    [0.5, 'E5', 1],
    [2, 'C5', 0.75],
    [3, 'A4', 0.75]
  ],
  [
    [0, 'G4', 1],
    [1.5, 'A4', 0.5],
    [2.5, 'C5', 1]
  ],
  [
    [0, 'E5', 1.5],
    [2, 'D5', 0.5],
    [3, 'B4', 0.75]
  ],
  [
    [0.5, 'A4', 1],
    [2, 'G4', 0.75],
    [3, 'E4', 0.75]
  ],
  [
    [0, 'G4', 1],
    [1.5, 'A4', 0.5],
    [2.5, 'D5', 1]
  ],
  [
    [0.5, 'B4', 1],
    [2, 'A4', 0.75],
    [3, 'G4', 0.75]
  ],

  // 25–32: возвращение знакомого мотива и мягкое завершение.
  [
    [0, 'E4', 1.5],
    [2.5, 'G4', 1]
  ],
  [
    [0.5, 'B4', 1.5],
    [2.5, 'G4', 1]
  ],
  [
    [0, 'A4', 1],
    [1.5, 'G4', 0.75],
    [3, 'E4', 0.75]
  ],
  [
    [0.5, 'D4', 1],
    [2, 'C4', 1.5]
  ],
  [
    [0, 'E4', 1.5],
    [2.5, 'A4', 1]
  ],
  [
    [0.5, 'G4', 1.5],
    [2.5, 'E4', 1]
  ],
  [
    [0, 'D4', 1],
    [1.5, 'E4', 0.75],
    [3, 'D4', 0.75]
  ],
  [
    [0.5, 'B3', 1],
    [2, 'C4', 1.75]
  ]
]

// Четырёхголосные аккорды меняются раз в два такта.
const chordChanges = [
  [0, ['C3', 'G3', 'B3', 'E4']],
  [2, ['A2', 'G3', 'B3', 'E4']],
  [4, ['F3', 'A3', 'C4', 'E4']],
  [6, ['G2', 'D3', 'A3', 'E4']],
  [8, ['E3', 'G3', 'B3', 'D4']],
  [10, ['A2', 'E3', 'B3', 'C4']],
  [12, ['C3', 'G3', 'A3', 'D4']],
  [14, ['F3', 'A3', 'B3', 'E4']],
  [16, ['C3', 'G3', 'D4', 'E4']],
  [18, ['A2', 'F3', 'C4', 'E4']],
  [20, ['A2', 'G3', 'B3', 'E4']],
  [22, ['G2', 'F3', 'A3', 'E4']],
  [24, ['C3', 'G3', 'B3', 'E4']],
  [26, ['A2', 'E3', 'G3', 'C4']],
  [28, ['F3', 'A3', 'C4', 'E4']],
  [30, ['C3', 'G3', 'B3', 'D4']]
]

// Редкие верхние ноты — тихий ответ основной мелодии.
const answers = [
  [3, 2.5, 'E5'],
  [7, 2.5, 'D5'],
  [11, 1.5, 'B5'],
  [15, 3, 'E5'],
  [17, 2, 'G5'],
  [19, 3, 'E5'],
  [21, 2, 'B5'],
  [23, 1, 'A5'],
  [27, 2, 'G5'],
  [29, 2, 'E5'],
  [31, 0.5, 'D5']
]

function musicalTime(bar, beat = 0) {
  return `${bar}:${Math.floor(beat)}:${(beat % 1) * 4}`
}

const sectionDynamics = [0.5, 0.59, 0.68, 0.48]
const accents = [1, 0.82, 0.9, 0.76]

const leadEvents = melodyBars
  .flatMap((notes, bar) =>
    notes.map(([beat, note, length], index) => ({
      time: musicalTime(bar, beat),
      kind: 'lead',
      note,
      length,
      velocity: sectionDynamics[Math.floor(bar / 8)] * accents[index % 4]
    }))
  )
  .map((event, index) => ({ ...event, index }))

// Существующий main.js продолжает показывать ноты.
export const melodyNotes = leadEvents.map((event) => event.note)

const musicEvents = [
  ...leadEvents,

  ...chordChanges.map(([bar, notes]) => ({
    time: musicalTime(bar),
    kind: 'pad',
    notes,
    length: 6,
    velocity: sectionDynamics[Math.floor(bar / 8)] * 0.7
  })),

  ...answers.map(([bar, beat, note]) => ({
    time: musicalTime(bar, beat),
    kind: 'answer',
    note,
    length: 0.75,
    velocity: 0.36
  }))
]

export const settings = {
  bpm: 100,
  clarity: 6000,
  interference: 0,
  trace: 20,
  melody: 60
}

let lowSynth, highSynth, noiseSynth, answerSynth, filter, delay
let leadSynths = []
let padSynths = []
let musicInput, musicReverb
let tapeGain, melodyGain, interferenceNoise, interferenceGain, output, limiter
let sequence, compositionPart, transport
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
  if (sequence && compositionPart) return

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

  musicInput = new Tone.Gain(1)

  // Два чередующихся голоса сохраняют хвост предыдущей ноты.
  leadSynths = Array.from({ length: 2 }, () =>
    new Tone.Synth({
      volume: -16,

      oscillator: {
        type: 'triangle'
      },

      portamento: 0.04,

      envelope: {
        attack: 0.09,
        decay: 0.45,
        sustain: 0.45,
        release: 1.8
      }
    }).connect(musicInput)
  )

  // Четыре мягких голоса для аккордовой подложки.
  padSynths = Array.from({ length: 4 }, () =>
    new Tone.Synth({
      volume: -25,

      oscillator: {
        type: 'sine'
      },

      portamento: 0.35,

      envelope: {
        attack: 1.1,
        decay: 1,
        sustain: 0.65,
        release: 3.8
      }
    }).connect(musicInput)
  )

  answerSynth = new Tone.Synth({
    volume: -26,

    oscillator: {
      type: 'sine'
    },

    envelope: {
      attack: 0.015,
      decay: 0.9,
      sustain: 0.1,
      release: 2.8
    }
  }).connect(musicInput)

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

  compositionPart = new Tone.Part((time, event) => {
    if (!tracks.melody.playing) return

    const duration = Tone.Time('4n').toSeconds() * event.length

    if (event.kind === 'lead') {
      leadSynths[event.index % 2].triggerAttackRelease(
        event.note,
        duration,
        time,
        event.velocity
      )

      drawStep(tracks.melody, event.index, time)
    } else if (event.kind === 'pad') {
      event.notes.forEach((note, index) => {
        padSynths[index].triggerAttackRelease(
          note,
          duration,
          time,
          event.velocity
        )
      })
    } else {
      answerSynth.triggerAttackRelease(
        event.note,
        duration,
        time,
        event.velocity
      )
    }
  }, musicEvents)

  sequence.loop = true

  compositionPart.loopEnd = '32m'
  compositionPart.loop = true
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

function createMusicReverb() {
  if (!musicReverb) {
    musicReverb = new Tone.Reverb({
      decay: 4.5,
      preDelay: 0.04,
      wet: 0.32
    })

    musicInput.chain(musicReverb, melodyGain)
  }

  return musicReverb.ready
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

    if (name === 'melody') {
      // Reverb подготавливается асинхронно.
      // STOP может отменить ожидание.
      await createMusicReverb()

      if (currentRequest !== track.requestId) return false
    }

    if (!delay) createDelay()

    const time = Tone.now() + 0.02

    // Подключаем голос на ближайшей восьмой
    // общей ритмической сетки.
    const stepTicks = transport.PPQ / 2

    const position = transportRunning
      ? `${Math.ceil(transport.getTicksAtTime(time) / stepTicks) * stepTicks}i`
      : 0

    track.playing = true

    if (name === 'tape') {
      tapeGain.gain.rampTo(1, 0.02)
      sequence.start(position)
      interferenceNoise.start(time)
    } else {
      melodyGain.gain.rampTo(settings.melody / 100, 0.02)
      compositionPart.start(position)
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
      if (!sequence || !compositionPart) {
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
    compositionPart?.stop(0)
  }

  const synths =
    name === 'tape'
      ? [lowSynth, highSynth, noiseSynth]
      : [...leadSynths, ...padSynths, answerSynth]

  for (const synth of synths) {
    if (!synth) continue

    synth.envelope.cancel(time)
    synth.triggerRelease(time)
  }

  // Очищаем пространство мелодии,
  // не затрагивая играющую ленту.
  if (name === 'melody' && musicReverb) {
    musicInput.disconnect(musicReverb)
    musicReverb.dispose()
    musicReverb = undefined
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
    compositionPart,
    lowSynth,
    highSynth,
    noiseSynth,
    ...leadSynths,
    ...padSynths,
    answerSynth,
    musicInput,
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

  sequence = compositionPart = undefined
  lowSynth = highSynth = noiseSynth = answerSynth = undefined

  leadSynths = []
  padSynths = []

  musicInput = musicReverb = undefined
  tapeGain = melodyGain = filter = undefined

  interferenceNoise =
    interferenceGain =
    output =
    limiter =
    transport =
      undefined

  transportRunning = false
}
