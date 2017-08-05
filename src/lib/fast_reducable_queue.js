export default class FastReducableQueue {
    constructor(){
        this.length = 0;
    }
    take(queue){
        for(let i=0, len=queue.length; i<len; i++){
            this.push(queue[i]);
        }
        queue.clear();
    }
    push(...values){

        for(let i=0, len=values.length; i<len; i++){
            this[this.length] = values[i];
            ++this.length;
        }
    }
    shift(){
        let v = this[0], i = 0;
        --this.length;
        while(i < this.length){
            this[i] = this[i+1];
        }

        return v;
    }
    reduce(fn, startValue){
        let i = 0;
        let result = startValue;
        //console.log('this.length ', this.length)
        while(i < this.length){
            result = fn(result, this[i], i, this);
            ++i;
        }
        return result;
    }
    clear(){
        let i = -1, len = this.length;
        while(++i < len){
            try{
                delete this[i];
            }catch(e){}
        }
        this.length = 0;
    }
}
