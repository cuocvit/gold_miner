import { _decorator, Component, Node, Collider2D, Contact2DType, IPhysics2DContact, Vec2, RigidBody2D, Animation, math, PhysicsSystem2D, PhysicsGroup, director, find } from 'cc';
import { AudioCtrl } from './AudioCtrl';
const { ccclass, property } = _decorator;

@ccclass('BombCtrl')
export class BombCtrl extends Component {

    @property(Animation)
    bombAnimation: Animation = null; // Animation của quả bom

    @property(AudioCtrl)
    clip: AudioCtrl = null; // Audio controller

    @property
    explosionRadius: number = 500; // Bán kính nổ của quả bom

    onLoad() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            // Lắng nghe sự kiện va chạm
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBombContact, this);
        }
    }

    /**
     * Hàm xử lý khi bom va chạm với claw.
     */
    onBombContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // Kiểm tra xem va chạm có phải với claw không
        if (otherCollider.node.name === 'Claw') {
            // Chạy animation nổ bom
            if (this.bombAnimation) {
                this.bombAnimation.play('bomb_explosion');

                // Khi animation nổ kết thúc, gọi hàm `explode`
                this.bombAnimation.once(Animation.EventType.FINISHED, this.explode, this);
            } else {
                console.warn("Bomb Animation not found or not assigned.");
            }

            //this.clip.onAudioQueue(8);
        }
    }

    /**
     * Hàm xử lý nổ bom sau khi animation nổ kết thúc.
     */
    explode() {
        console.log("Bomb exploded!");

        // Lấy vị trí hiện tại của quả bom
        const bombPosition = this.node.worldPosition;

        // Tìm các node trong bán kính nổ
        const nodesToDestroy = this.findNodesWithinRadius(bombPosition, this.explosionRadius);

        // Vô hiệu hóa các node trong bán kính nổ
        nodesToDestroy.forEach(node => {
            const rigidBody = node.getComponent(RigidBody2D);
            if (rigidBody) rigidBody.enabled = false;

            const collider = node.getComponent(Collider2D);
            if (collider) collider.enabled = false;

            node.active = false; // Vô hiệu hóa node
        });

        // Vô hiệu hóa chính quả bom
        this.disableBomb();
    }

    /**
     * Hàm tìm các node trong bán kính nổ.
     */
    findNodesWithinRadius(position: math.Vec3, radius: number): Node[] {
        const nodesWithinRadius: Node[] = [];
    
        // Duyệt qua toàn bộ cây Scene để lấy các node có Collider2D
        director.getScene().walk((node: Node) => {
            // Kiểm tra nếu node này có collider và không phải là quả bom hiện tại hoặc là node Claw
            if (node.getComponent(Collider2D) && node !== this.node && node.name !== 'Claw') {
                const nodePosition = node.worldPosition;
                const distance = math.Vec2.distance(new Vec2(position.x, position.y), new Vec2(nodePosition.x, nodePosition.y));
    
                // Nếu khoảng cách nhỏ hơn hoặc bằng bán kính nổ thì thêm vào danh sách
                if (distance <= radius) {
                    nodesWithinRadius.push(node);
                }
            }
        });
    
        return nodesWithinRadius;
    }
    
    

    /**
     * Hàm vô hiệu hóa quả bom.
     */
    disableBomb() {
        // Vô hiệu hóa rigid body và collider của quả bom
        const rigidBody = this.getComponent(RigidBody2D);
        if (rigidBody) rigidBody.enabled = false;

        const collider = this.getComponent(Collider2D);
        if (collider) collider.enabled = false;

        // Vô hiệu hóa node của quả bom
        this.node.active = false;
    }
}
