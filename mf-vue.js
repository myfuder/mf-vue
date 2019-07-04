class MFVue { 
    constructor(options) { //类构造器
        this.$el = document.querySelector(options.el);
        this.$data = options.data;
        this.$methods = options.methods;
        this.mWatcherObj = {}; // 属性值订阅器的集合对象
        this.observe(); // 数据劫持
        this.compile(this.$el); // DOM解析
    }
    observe() {
        for (let key in this.$data) {
            let value = this.$data[key];
            this.mWatcherObj[key] = [];
            let mWatcherObj = this.mWatcherObj[key];
            Object.defineProperty(this.$data, key, {  //es的方法，实现数据劫持的根本
                configurable: false, // 该状态下的属性描述符不能被修改和删除
                enumerable: false, // 该状态下的属性描述符中的属性不可被枚举
                get() {
                    return value
                },
                set(newVal) {
                    if (newVal !== value) {
                        value = newVal;
                        mWatcherObj.forEach((obj) => {
                            obj.update();
                        });
                    }
                }
            });
        }
    }
    compile(el) {
        let nodes = el.children;
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if (node.children.length > 0) {
                this.compile(node); // 递归所有子节点
            }
            if (node.hasAttribute('mf-on:click')) {
                let eventAttrVal = node.getAttribute('mf-on:click');
                node.addEventListener('click', this.$methods[eventAttrVal].bind(this.$data)); // 绑定获取到的指令对应的数据所触发的方法
            }
            if (node.hasAttribute('mf-if')) {
                let ifAttrVal = node.getAttribute('mf-if');
                this.mWatcherObj[ifAttrVal].push(new Watcher(this, node, "", ifAttrVal)); // 给该指令对应的数据创建订阅器放在该数据对应的订阅器数组里
            }
            if (node.hasAttribute('mf-model')) {
                let modelAttrVal = node.getAttribute('mf-model');
                node.addEventListener('input', ((index) => {
                    this.mWatcherObj[modelAttrVal].push(new Watcher(this, node, "value", modelAttrVal));
                    return () => {
                        this.$data[modelAttrVal] = nodes[index].value; // 将该指令所在节点的值扔给该指令的数据
                    }
                })(i));
            }
            if (node.hasAttribute('mf-text')) {
                let textAttrVal = node.getAttribute('mf-text');
                this.mWatcherObj[textAttrVal].push(new Watcher(this, node, "innerText", textAttrVal));
            }
        }
    }
}
class Watcher { //订阅器
    constructor(...arg) {
        this.vm = arg[0];  //MEVue对象
        this.el = arg[1];
        this.attr = arg[2];
        this.val = arg[3];
        this.update(); // 初始化订阅器时更新一下视图
    }
    update() { // 将收到的新的数据更新在视图中从而实现真正的VM
        if (this.vm.$data[this.val] === true) {
            this.el.style.display = 'block';
        } else if (this.vm.$data[this.val] === false) {
            this.el.style.display = 'none';
        } else {
            this.el[this.attr] = this.vm.$data[this.val];
        }
    }
}
