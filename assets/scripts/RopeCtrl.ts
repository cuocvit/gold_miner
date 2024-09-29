import { _decorator, animation, Animation, Collider2D, Component, Contact2DType, EPhysics2DDrawFlags, find, IPhysics2DContact, Node, PhysicsSystem2D, RigidBody2D, UITransform } from 'cc';
import { State } from './Enum';
import { config } from './Config';
import { GameCtrl } from './GameCtrl';
import { Actor } from './Actor';

const { ccclass, property } = _decorator;

@ccclass('RopeCtrl')
export class RopeCtrl extends Component {

    @property
    rollSpeed: number = config.rollSpeed;

    @property
    growSpeed: number = config.growSpeed;

    @property(Actor)
    actor: Actor = null;

    @property
    backSpeed: number = config.backSpeed;

    public state: number = State.Idle;
    private nowDegree: number = 0;

    public nowLength: number = config.Idle_Len;

    public weight: number = 0;

    private claw: Node = null;

    public isScore: boolean = false;

    protected onLoad(): void {
        this.claw = this.node.getChildByName("Claw");
        this.setRopeLength(config.Idle_Len);
    }

    start() {
        
    }

    update(deltaTime: number) {
        if(this.state == State.Idle){
            this.idleUpdate(deltaTime);
        }else if(this.state == State.Grow){
            this.growUpdate(deltaTime);
        }else if(this.state == State.Back){
            this.backUpdate(deltaTime);
        }

    }

    idleUpdate(deltaTime: number){
        this.nowDegree += (this.rollSpeed * deltaTime * 0.6);
        this.node.angle = this.nowDegree;

        if(this.nowDegree >= config.rightDegree || this.nowDegree <= config.leftDegree){
            this.rollSpeed = -this.rollSpeed;
        }else if(this.nowDegree >= config.rightDegree && this.rollSpeed > 0){
            this.rollSpeed = -this.rollSpeed;
        }

    }

    setRopeLength(length: number){
        this.node.getComponent(UITransform).height = length;
        this.claw.setPosition(-1.47, -(length + this.claw.getComponent(UITransform).height / 2));
    }

    growUpdate(deltaTime: number){
        this.nowLength += this.growSpeed * deltaTime;
        this.setRopeLength(this.nowLength);
    }   

    backUpdate(deltaTime: number){
        this.nowLength -= this.growSpeed * deltaTime * this.weight;
        this.setRopeLength(this.nowLength);
        if(this.nowLength <= config.Idle_Len){
           this.nowLength = config.Idle_Len; 
           this.state = State.Idle;
           this.isScore = true;
           this.resetClawChildrenActive();
        }
    } 

    backWithNothing(){
        if(this.state !== State.Grow){
            return;
        }
        this.state = State.Back;
    }

    public throwRope() {
        if(this.state !== State.Idle){
            return;
        }
        this.state = State.Grow;
    }  

    resetClawChildrenActive() {
        // Duyệt qua tất cả các node con của claw và đặt trạng thái active = false
        this.claw.children.forEach(child => {
            child.active = false;
        });
        const animationComponent = this.actor.getComponent(Animation);
        if (animationComponent) {
            animationComponent.stop(); // Dừng Animation khi vàng biến mất
        }

        this.isScore = true;
    }
    

}


