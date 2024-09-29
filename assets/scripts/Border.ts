import { _decorator, BoxCollider2D, Collider, Component, Node } from 'cc';
import { RopeCtrl } from './RopeCtrl';
const { ccclass, property } = _decorator;

@ccclass('Border')
export class Border extends Component {

    @property(RopeCtrl)
    rope: RopeCtrl = null;

    onCollisionEnter (other: any, self: any) {
        this.rope.backWithNothing();
        console.log("collided")
    }
}


