import uniqid from 'uniqid';

export default class List{
    constructor(){
        this.items = [];
    }

    addItem(count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient,
        }
        this.items.push(item);
        return item;
    }

    deleteItem(id) {
        const index = this.items.findIndex(el => el.id === id);
        //[2,4,8] -> splice(1,1) means from index 1 and select how many element (ie 1 here) therefor returns [2,8] and original array is mutated
        //[2,4,8] -> slice(1,1) means from index 1 and till end index number and end index wont be included therefor returns [2,4,8] and original array is not mutated
        this.items.splice(index,1);     //we pass starting index and total number of elements to select. function returns those elements and deletes them from original array
    }

    updateCount(id, newCount) { //just numbers
        if(this.items){
            this.items.find(el => el.id === id).count = newCount;     //it returns item not index of item 
        }
    }
}