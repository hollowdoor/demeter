export default class FastReducableQueue {
    constructor(){
        this.length = 0;
    }
    take(...queues){
        for(let j=0; j<queues.length; j++){
            for(let i=0; i<queues[j].length; i++){
                this.push(queues[j][i]);
            }
            queues[j].clear();
        }
    }
    push(...values){
        if(this.length === 0){
            for(let i=0; i<50; i++){ this[i] = {}; }
        }

        for(let i=0; i<values.length; i++){
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
        let i = 0;
        while(i < this.length){
            try{
                delete this[i];
            }catch(e){}
        }
        this.length = 0;
    }
}
