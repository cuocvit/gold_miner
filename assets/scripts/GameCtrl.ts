import { _decorator, Collider2D, Component, Contact2DType, EPhysics2DDrawFlags, EventKeyboard, input, Input, IPhysics2DContact, KeyCode, Label, Node, PhysicsSystem2D, RigidBody2D, Vec2, Animation, director, Button } from 'cc';
import { RopeCtrl } from './RopeCtrl';
import { objects, State } from './Enum';
import { Actor } from './Actor';
import { BombCtrl } from './BombCtrl';
import { config } from './Config';
import { AudioCtrl } from './AudioCtrl';
const { ccclass, property } = _decorator;

@ccclass('GameCtrl')
export class GameCtrl extends Component {

    @property(RopeCtrl)
    rope: RopeCtrl = null;

    @property(Actor)
    actor: Actor = null;

    @property(Node)
    claw: Node = null;

    @property(AudioCtrl)
    clip: AudioCtrl = null;
    
    @property(Label)
    targetLabel: Label = null;

    @property
    target: number = 1011;

    @property(Label)
    scoreLabel: Label = null;

    private score: number = 0;

    @property(Label)
    timeLabel: Label = null;

    private time: number = 60;

    @property(Label)
    stateLabel: Label = null;

    @property(Node)
    public stateBG: Node = null;
    
    @property(Button)
    restartButton: Button = null;

    @property(Button)
    nextLevelButton: Button = null;

    public weight: number = 0;

    private isCounting: boolean = false;

    protected onLoad(): void {

        this.clip.onAudioQueue(17);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);

        PhysicsSystem2D.instance.enable = true;
        //PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape | EPhysics2DDrawFlags.Joint | EPhysics2DDrawFlags.Aabb;

        const collider = this.claw.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

    }

    start() {
        this.stateBG.active = false;
        this.restartButton.enabled = false;
        this.nextLevelButton.enabled = false;
        this.targetLabel.string = this.target.toString();
        this.scoreLabel.string = this.score.toString();
        this.startCountdown(this.time);
    }

    update(deltaTime: number) {
        // Kiểm tra nếu đang đếm ngược
        if (this.isCounting) {
            this.scoreLabel.string = this.score.toString();
            // Trừ thời gian đã trôi qua cho `remainingTime`
            this.time -= deltaTime;

            // Cập nhật `Label` để hiển thị số giây còn lại
            this.timeLabel.string = Math.ceil(this.time).toString();

            // Khi thời gian bằng hoặc nhỏ hơn 0, dừng đếm ngược
            if (this.time <= 0) {
                this.timeLabel.string = '0'; // Đảm bảo hiển thị số 0 khi hết thời gian
                this.isCounting = false;
                this.onCountdownEnd(); // Gọi hàm khi đếm ngược kết thúc
            }
        }
    }

    startCountdown(duration: number) {
        this.time = duration;
        this.isCounting = true;
    }

    onCountdownEnd() {
        this.stateBG.active = true;

        if(this.score >= this.target){
            this.stateLabel.string = "WINNNN!!!";
            this.restartButton.enabled = true;
            this.nextLevelButton.enabled = true;
            this.clip.onAudioQueue(23);
        }else{
            this.stateLabel.string = "LOSEEEE!!!";
            this.restartButton.enabled = true;
            this.nextLevelButton.enabled = false;
            this.clip.onAudioQueue(24);
        }
    }
    
    onKeyDown(event: EventKeyboard){
        switch(event.keyCode){
            case KeyCode.ARROW_DOWN:
                this.rope.throwRope();
                this.clip.onAudioQueue(4);
                break;
        }
    }


    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

        console.log(otherCollider.tag);

        if(otherCollider.tag === 2) this.clip.onAudioQueue(8);
        if(otherCollider.tag === 50 || otherCollider.tag === 50 || otherCollider.tag === 100 || 
            otherCollider.tag === 250 || otherCollider.tag === 500 || otherCollider.tag === 1000) this.clip.onAudioQueue(10);
        if(otherCollider.tag === 1200) this.clip.onAudioQueue(0);
        if(otherCollider.tag === 10 || otherCollider.tag === 20 || otherCollider.tag === 30) this.clip.onAudioQueue(15);

        if (otherCollider.node.name === "Claw") {
            return; // Không thực hiện bất cứ hành động nào nếu va chạm với claw
        }
        
        this.score += otherCollider.tag;
        
        if (!objects[otherCollider.tag]) {
            this.rope.backWithNothing();
        }
        else{
            let objectName = objects[otherCollider.tag];

            this.scheduleOnce(() => {
                const rigidBody = otherCollider.getComponent(RigidBody2D);
                if (rigidBody) {
                    rigidBody.enabled = false;
                }
                otherCollider.node.active = false;
            }, 0.001); // Trì hoãn 0.1 giây để tránh xung đột với engine vật lý
            
            this.claw.getChildByName(objectName).active = true;

            this.rope.backWithNothing();
        }
        const animationComponent = this.actor.getComponent(Animation);
            if (animationComponent) {
                animationComponent.crossFade('human_rolling', 20);
            }
        this.updateWeightBasedOnTag(otherCollider.tag);
    }

    updateWeightBasedOnTag(tag: number) {
        // Sử dụng giá trị `tag` để quyết định trọng lượng của đối tượng
        switch (tag) {
            case 0: 
                this.rope.weight = 1.5;
                break;
            case 10: // rock10
            case 50: // gold50
            case 1200: // diamond
                this.rope.weight = 1;
                break;
            case 100: // gold100
            case 250: // gold250
            case 20: // rock20
                this.rope.weight = 0.6;
                break;
            case 500: // gold500
                this.rope.weight = 0.3;
                break;
            case 30: // rock30
            case 1000: // gold1000
                this.rope.weight = 0.1;
                break;
            default:
                this.rope.weight = 0.5; // Giá trị mặc định
                break;
        }

        console.log(`Updated rope weight to: ${this.rope.weight} for tag: ${tag}`);
    }

    restartGame() {
        // Tải lại scene hiện tại
        director.loadScene('lv1');  // Thay 'GameScene' bằng tên scene của bạn
        this.stateBG.active = false;
        this.restartButton.enabled = false;
        this.nextLevelButton.enabled = false;
    }

    onNextLevel() {
        // Gọi hàm loadScene để chuyển sang scene tiếp theo
        director.loadScene('lv2'); // Thay 'Level2' bằng tên scene của level tiếp theo
        this.stateBG.active = false;
        this.restartButton.enabled = false;
        this.nextLevelButton.enabled = false;
    }
}


