import { _decorator, Component, Node, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Actor')
export class Actor extends Component {

    public actorAnimation: Animation;

    protected onLoad(): void {
        this.actorAnimation = this.node.getComponent(Animation);
    }
}


