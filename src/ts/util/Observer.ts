interface Func {
    (...args: any): any;
}

interface EventItem {
    [key: string]: Func[]
}

class Observer {
    items: EventItem;

    constructor() {
        this.items = {};
    }

    //订阅事件
    on(name: string, callback: Func) {
        if (!this.items[name]) {
            this.items[name] = [];
        }
        //将事件函数添加到对应的数组中
        this.items[name].push(callback);
    }

    //发布
    emit(name: string, ...data: any) {
        if (!this.items[name]) {
            throw new Error("该事件还没有订阅,请先订阅");
        }

        //执行订阅的事件,并传入数据
        this.items[name].forEach((fn: Func) => {
            fn.call(this, ...data);
        });
    }

    //退订
    off(name: string, callback: Func) {
        if (!this.items[name]) {
            /*throw new Error("该事件您并没有订阅");*/
            return "该事件您并没有订阅";
        }

        //获取到下标
        let index = this.items[name].indexOf(callback);

        //删除掉对应的函数
        this.items[name].splice(index, 1);
    }
}
export default new Observer();