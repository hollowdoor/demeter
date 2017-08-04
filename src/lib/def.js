export default function def(self, src){
    for(let n in src){
        if(src.hasOwnProperty(n)){
            Object.defineProperty(self, n, {
                value: src[n],
                enumerable: true
            });
        }
    }

    return self;
}
