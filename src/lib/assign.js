import objectAssign from 'object-assign';
export default function assign(target, ...sources){
    return objectAssign(target, ...sources);
}
