import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioCtrl')
export class AudioCtrl extends Component {
    
    @property(AudioClip)
    clips: AudioClip[] = [];

    @property(AudioSource)
    audioSource: AudioSource = null;

    onAudioQueue(index: number) {
        let clip: AudioClip = this.clips[index];

        this.audioSource.playOneShot(clip);
    }
}


