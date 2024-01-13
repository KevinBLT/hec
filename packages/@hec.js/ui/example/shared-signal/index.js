import { templateByNode, signal } from '../../lib/index.js';
import { generateRandomName } from '../nested-signal/util.js';

const signalA = signal(0, { id: 'SHARE', storage: 'session' }),
      signalB = signal(0, { id: 'SHARE', storage: 'session' }),
      signalC = signal({ 
        name: generateRandomName(),
      }, { id: 'C', storage: 'session' })

templateByNode(document.body, { signalA, signalB, signalC });

document.querySelector('button.A').addEventListener('click', () => signalA(signalA() + 1));
document.querySelector('button.B').addEventListener('click', () => signalB(signalB() + 1));