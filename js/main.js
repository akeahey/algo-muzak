// For my project I was inspired by the rager being thrown two floors below me 
// during finals week. My roommates and I were up until 2:30, enjoying the 
// dulcet tones of Katy Perry and Flo Rida, and even met our downstairs neighbors, 
// who came up to our place because their tables were shaking with the force of the bass. 
// However, the indiscriminate pulse of party music provided a welcome background for us
// as we worked, and I came to enjoy it as ambient noise. 
// Thus, I decided to create Two Floors Down, a project for randomly generating 
// vague, distant party beats.

const ctx = new (window.AudioContext || window.webkitAudioContext)()

const tone = new OscillatorNode(ctx)
const chord = new OscillatorNode(ctx)
const kick = new OscillatorNode(ctx)
const lvl = new GainNode(ctx, { gain: 0.001 })
const fft = new AnalyserNode(ctx)

tone.connect(lvl)
kick.connect(lvl)
chord.connect(lvl)
lvl.connect(ctx.destination)
lvl.connect(fft)

// ADSR function
function adsr (param, peak, val, time, a, d, s, r) {
  /*
                peak
                /\   val  val
               /| \__|____|
              / |    |    |\
             /  |    |    | \
       init /a  |d   |s   |r \ init

       <----------time------------>
  */
  const initVal = param.value
  param.setValueAtTime(initVal, time)
  param.linearRampToValueAtTime(peak, time+a)
  param.linearRampToValueAtTime(val, time+a+d)
  param.linearRampToValueAtTime(val, time+a+d+s)
  param.linearRampToValueAtTime(initVal, time+a+d+s+r)
}


// randomly choosing tempo between 105 and 145 BPM - typical for pop music
let tempo = Math.floor(Math.random() * (40 + 1)) + 105;
// how far apart is each beat
let beatMark = 60 / tempo; 
let timelength = tempo * 3;
// randomly chooses a key 
const keys = [110.0, 116.54, 123.47, 130.81, 69.3, 73.41, 77.78, 82.41, 87.31, 92.5, 98, 103.83]
let keyindex = Math.floor(Math.random() * keys.length)
let key = keys[keyindex]

// step note function
function step( rootFreq, steps ){
  // formula: http://pages.mtu.edu/~suits/NoteFreqCalcs.html
  var tr2 = Math.pow(2, 1/12) // the twelth root of 2
  // we could replace the 12 with how ever many tones we want
  // ie. this could easily get really microtonal :) 
  rnd = rootFreq * Math.pow(tr2,steps)
  return Math.round(rnd*100)/100
}

// determine chord progression
// a lot of popular music uses the I-V-vi-IV progression 
// so I chose to replicate that progression here
let stage = 0
function progression (rootFreq) {
  if (stage == 0) {
    stage = 1;
    return rootFreq;
  }
  if (stage == 1) {
    stage = 2;
    return step(rootFreq, 5);
  }
  if (stage == 2) {
    stage = 3;
    return step(rootFreq, 6);
  }
  if (stage == 3) {
    stage = 0;
    return step(rootFreq, 4);
  }

}


// for-loop 
for (i = 0; i < timelength; i++) {
  tone.frequency.setValueAtTime(71.9, ctx.currentTime + (i * beatMark))
  adsr(lvl.gain, 0.8,0.5, ctx.currentTime + (i * beatMark), 0.05,0.1,0.1,0.1)

  kick.frequency.setValueAtTime(82.5, ctx.currentTime + (i * beatMark) + (beatMark / 2))
  adsr(lvl.gain, 0.8,0.2, ctx.currentTime + (i * beatMark) + (beatMark / 2), 0.05,0.1,0.1,0.05)

  if (i % 4 == 0) {
    chord.frequency.setValueAtTime(progression(key), ctx.currentTime + (i * beatMark) + (beatMark / 2))
    adsr(lvl.gain, 0.5,0.2, ctx.currentTime + (i * beatMark), 0.1,0.1,0.1,0.1)
  }
}


tone.start(ctx.currentTime)
kick.start(ctx.currentTime)
chord.start(ctx.currentTime)
tone.stop(ctx.currentTime + 180)
kick.stop(ctx.currentTime + 180)
chord.stop(ctx.currentTime + 180)


createWaveCanvas({ element: 'section', analyser: fft })

