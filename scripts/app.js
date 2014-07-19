/// <reference path="//ajax.aspnetcdn.com/ajax/jQuery/jquery-2.1.1.js" />
/// <reference path="//cdnjs.cloudflare.com/ajax/libs/knockout/3.1.0/knockout-min.js" />
/// <reference path="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js" />

// Modelデータ
function MIDI(access) {
  var self = this;
  self.access = access;
  self.inputs = access.inputs();
  self.outputs = access.outputs();
  self.input = null;
  self.output = null;
  self.outputChannel = 0;
  self.program = 0;
}

MIDI.prototype = {
  selectInput: function (value) {
    if (this.input !== value) {
      if (this.input) {
        this.input.onmidimessage = null;
      }
      this.input = value;
      var self = this;
      this.input.onmidimessage =
          function (ev) {
            if (ev.data[0] != 0xfe) {
              var m = ev.data[0] & 0xf0;
              if (m != 0xf0) {
                ev.data[0] = m & 0xf0 | self.outputChannel;
              }
              if (self.output) {
                self.output.send(ev.data, 0);
              }
              $(self).trigger('midiEvent', [ev]);
            }
          };
    }
  },
  selectOutput: function (value) {
    if (this.output !== value) {
      this.output = value;
    }
  }
};

// View Model
function ViewModel(midi) {
  var self = this;
  self.inputs = [];
  for (var i = 0; i < midi.inputs.length; ++i) {
    self.inputs.push(
        {
          index: i,
          name: midi.inputs[i].name,
          input: midi.inputs[i],
          selected: ko.observable(false)
        }
    );
  }

  // 入力値の変化に応じてMIDI Modelをいじりたいのでcomputedを使用
  self.input = (function () {
    var input_ = null;
    return ko.computed({
      read: function () {
        return input_;
      },
      write: function (value) {
        if (input_) {
          input_.selected(false);
        }
        input_ = value;
        midi.selectInput(value.input);
        value.selected(true);
      },
      owner: this
    });

  })();

  self.selectInput = function (value) {
    self.input(value);
  };

  self.outputs = [];
  for (var i = 0; i < midi.outputs.length; ++i) {
    self.outputs.push(
        {
          index: i,
          name: midi.outputs[i].name,
          output: midi.outputs[i],
          selected: ko.observable(false)
        }
    );
  }

  // 出力値の変化に応じてMIDI Modelをいじりたいのでcomputedを使用
  self.output = (function () {
    var output_ = null;
    return ko.computed({
      read: function () {
        return output_;
      },
      write: function (value) {
        if (output_) {
          output_.selected(false);
        }
        output_ = value;
        midi.selectOutput(value.output);
        value.selected(true);
      },
      owner: this
    });
  })();

  self.selectOutput = function (value) {
    self.output(value);
  };

  // 出力チャネルの指定

  self.outputChannels = [];
  for (var i = 0; i < 16; ++i) {
    self.outputChannels.push({
      ch: i,
      name: ('00' + i.toString()).slice(-2),
      selected: ko.observable(false)
    });
  }

  self.outputChannel = (function () {
    
    var channel_ = self.outputChannels[midi.outputChannel];
    channel_.selected(true);

    return ko.computed({
      read: function () {
        return channel_;
      },
      write: function (value) {
        channel_.selected(false);
        channel_ = value;
        channel_.selected(true);
        midi.outputChannel = value.ch;
      },
      owner: this
    });
  })();

  self.selectOutputChannel = function (value) {
    self.outputChannel(value);
  };

  // MIDIイベントを保管する配列（10イベントまで）
  self.inputEvents = ko.observableArray();

  // プログラムチェンジ
  self.programs = [
      { 'no': 1, 'name': 'Acoustic Grand Piano' },
      { 'no': 2, 'name': 'Bright Acoustic Piano' },
      { 'no': 3, 'name': 'Electoric Grand Piano' },
      { 'no': 4, 'name': 'Honky-tonk Piano' },
      { 'no': 5, 'name': 'Electoric Piano 1' },
      { 'no': 6, 'name': 'Electoric Piano 2' },
      { 'no': 7, 'name': 'Harpsichord' },
      { 'no': 8, 'name': 'Clavi' },
      { 'no': 9, 'name': 'Celesta' },
      { 'no': 10, 'name': 'Glockenspiel' },
      { 'no': 11, 'name': 'Music Box' },
      { 'no': 12, 'name': 'Vibraphone' },
      { 'no': 13, 'name': 'Marimba' },
      { 'no': 14, 'name': 'Xylophone' },
      { 'no': 15, 'name': 'Tubular Bells' },
      { 'no': 16, 'name': 'Dulcimer' },
      { 'no': 17, 'name': 'Drawbar Organ' },
      { 'no': 18, 'name': 'Percussive Organ' },
      { 'no': 19, 'name': 'Rock Organ' },
      { 'no': 20, 'name': 'Church Organ' },
      { 'no': 21, 'name': 'Reed Organ' },
      { 'no': 22, 'name': 'Accordion' },
      { 'no': 23, 'name': 'Harmonica' },
      { 'no': 24, 'name': 'Tango Accordion' },
      { 'no': 25, 'name': 'Acoustic Giutar (Nylon)' },
      { 'no': 26, 'name': 'Acoustic Giutar (Steel)' },
      { 'no': 27, 'name': 'Electoric Giutar (Jazz)' },
      { 'no': 28, 'name': 'Electoric Giutar (Clean)' },
      { 'no': 29, 'name': 'Electoric Giutar (Muted)' },
      { 'no': 30, 'name': 'Overdriven Guitar' },
      { 'no': 31, 'name': 'Distortion Guitar' },
      { 'no': 32, 'name': 'Guitar Harmonics' },
      { 'no': 33, 'name': 'Acoustic Bass' },
      { 'no': 34, 'name': 'Electoric Bass (Fingar)' },
      { 'no': 35, 'name': 'Electoric Bass (Pick)' },
      { 'no': 36, 'name': 'Fretless Bass' },
      { 'no': 37, 'name': 'Slap Bass 1' },
      { 'no': 38, 'name': 'Slap Bass 2' },
      { 'no': 39, 'name': 'Synth Bass 1' },
      { 'no': 40, 'name': 'Synth Bass 2' },
      { 'no': 41, 'name': 'Violin' },
      { 'no': 42, 'name': 'Viola' },
      { 'no': 43, 'name': 'Cello' },
      { 'no': 44, 'name': 'Contrabass' },
      { 'no': 45, 'name': 'Tremolo Strings' },
      { 'no': 46, 'name': 'Pizzicato Strings' },
      { 'no': 47, 'name': 'Orchestral Harp' },
      { 'no': 48, 'name': 'Timpani' },
      { 'no': 49, 'name': 'String Ensemble 1' },
      { 'no': 50, 'name': 'String Ensemble 2' },
      { 'no': 51, 'name': 'Synth Strings 1' },
      { 'no': 52, 'name': 'Synth Strings 2' },
      { 'no': 53, 'name': 'Choir Aahs' },
      { 'no': 54, 'name': 'Voice Oohs' },
      { 'no': 55, 'name': 'Synth Voice' },
      { 'no': 56, 'name': 'Orchestra Hit' },
      { 'no': 57, 'name': 'Trumpet' },
      { 'no': 58, 'name': 'Trombone' },
      { 'no': 59, 'name': 'Tuba' },
      { 'no': 60, 'name': 'Muted Trumpet' },
      { 'no': 61, 'name': 'French Horn' },
      { 'no': 62, 'name': 'Brass Section' },
      { 'no': 63, 'name': 'Synth Brass 1' },
      { 'no': 64, 'name': 'Synth Brass 2' },
      { 'no': 65, 'name': 'Soprano Sax' },
      { 'no': 66, 'name': 'Alto Sax' },
      { 'no': 67, 'name': 'Tenor Sax' },
      { 'no': 68, 'name': 'Baritone Sax' },
      { 'no': 69, 'name': 'Oboe' },
      { 'no': 70, 'name': 'English Horn' },
      { 'no': 71, 'name': 'Bassoon' },
      { 'no': 72, 'name': 'Clarinet' },
      { 'no': 73, 'name': 'Piccolo' },
      { 'no': 74, 'name': 'Flute' },
      { 'no': 75, 'name': 'Recorder' },
      { 'no': 76, 'name': 'Pan Flute' },
      { 'no': 77, 'name': 'Blown Bottle' },
      { 'no': 78, 'name': 'Shakuhach' },
      { 'no': 79, 'name': 'Whistle' },
      { 'no': 80, 'name': 'Ocarina' },
      { 'no': 81, 'name': 'Lead 1 (square)' },
      { 'no': 82, 'name': 'Lead 2 (Sawtooth)' },
      { 'no': 83, 'name': 'Lead 3 (Calliope)' },
      { 'no': 84, 'name': 'Lead 4 (Chiff)' },
      { 'no': 85, 'name': 'Lead 5 (Charang)' },
      { 'no': 86, 'name': 'Lead 6 (Voice)' },
      { 'no': 87, 'name': 'Lead 7 (Fifths)' },
      { 'no': 88, 'name': 'Lead 8 (Bass+Lead)' },
      { 'no': 89, 'name': 'Pad 1 (New age)' },
      { 'no': 90, 'name': 'Pad 2 (Warm)' },
      { 'no': 91, 'name': 'Pad 3 (Polysynth)' },
      { 'no': 92, 'name': 'Pad 4 (Choir)' },
      { 'no': 93, 'name': 'Pad 5 (Bowed)' },
      { 'no': 94, 'name': 'Pad 6 (Metallic)' },
      { 'no': 95, 'name': 'Pad 7 (Halo)' },
      { 'no': 96, 'name': 'Pad 8 (Sweep)' },
      { 'no': 97, 'name': 'FX 1 (Rain)' },
      { 'no': 98, 'name': 'FX 2 (Soundtrack)' },
      { 'no': 99, 'name': 'FX 3 (Crystal)' },
      { 'no': 100, 'name': 'FX 4 (Atmosphere)' },
      { 'no': 101, 'name': 'FX 5 (Brightness)' },
      { 'no': 102, 'name': 'FX 6 (Goblins)' },
      { 'no': 103, 'name': 'FX 7 (Echoes)' },
      { 'no': 104, 'name': 'FX 8 (Sci-Fi)' },
      { 'no': 105, 'name': 'Sitar' },
      { 'no': 106, 'name': 'Banjo' },
      { 'no': 107, 'name': 'Shamisen' },
      { 'no': 108, 'name': 'Koto' },
      { 'no': 109, 'name': 'Kalimba' },
      { 'no': 110, 'name': 'Bag Pipe' },
      { 'no': 111, 'name': 'Fiddle' },
      { 'no': 112, 'name': 'Shanai' },
      { 'no': 113, 'name': 'Tinkle Bell' },
      { 'no': 114, 'name': 'Agogo' },
      { 'no': 115, 'name': 'Steel Drums' },
      { 'no': 116, 'name': 'Woodblock' },
      { 'no': 117, 'name': 'Taiko Drum' },
      { 'no': 118, 'name': 'Melodic Tom' },
      { 'no': 119, 'name': 'Synth Drum' },
      { 'no': 120, 'name': 'Reverse Cymbal' },
      { 'no': 121, 'name': 'Guitar Fret Noise' },
      { 'no': 122, 'name': 'Breath Noise' },
      { 'no': 123, 'name': 'Seashore' },
      { 'no': 124, 'name': 'Bird Tweet' },
      { 'no': 125, 'name': 'Telephone Ring' },
      { 'no': 126, 'name': 'Helicopter' },
      { 'no': 127, 'name': 'Applause' },
      { 'no': 128, 'name': 'Gunshot' }
  ];

  for (var i = 0; i < self.programs.length; ++i) {
    self.programs[i].selected = ko.observable(false);
  }

  self.program = (function () {
    var program_ = ko.observable(self.programs[midi.program]);
    program_().selected(true);
    return ko.computed({
      read: function () { return program_(); },
      write: function (value) {
        program_().selected(false);
        program_(value);
        value.selected(true);
        midi.program = value.no - 1 | 0;
        midi.output.send([0xC0 | midi.outputChannel, midi.program], 0);
      },
      owner: this
    });
  })();

  self.selectProgram = function (value)
  {
    self.program(value);
  }

  // MIDI Modelのイベント処理
  $(midi).on('midiEvent', function (e, ev) {

    // イベントを文字列に変換
    var evs = [];
    for (var i = 0, end = ev.data.length; i < end; ++i) {
      evs.push(('00' + ev.data[i].toString(16)).slice(-2));
    }
    // データ保存
    self.inputEvents.push(
        {
          timeStamp: ev.receivedTime,
          events: evs
        }
        );
    // 10個以上になったら古いデータを消す
    if (self.inputEvents().length > 10) {
      self.inputEvents().shift();
    }
  });
}

$().ready(function () {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
      sysex: true
    }).then(function (access) {
      ko.applyBindings(new ViewModel(new MIDI(access)));
    },
    //////////////////////////
    // MIDIAccess 取得失敗
    //////////////////////////
    function (fail) {
      console.log('error ' + fail.name + ' ' + fail.message);
      $('body').addClass('alert').addClass('alert-danger').html('<h1>お使いのブラウザではWebMIDI未対応かもしくは設定により実行できません。</h1>');
    });
  } else {
    $('body').addClass('alert').addClass('alert-danger').html('<h1>お使いのブラウザではWebMIDI未対応のため実行できません。</h1>');
  }
});
