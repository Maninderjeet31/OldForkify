import axios from 'axios';

export default class Recipe {
    constructor (id) {
        this.id = id;   //each recipe has unique id. 
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get/?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        }catch(error) {
            console.log(error);
            alert('Something went wrong :(');
        }
    }

    calcTime() {
        //Assumption : 15 min per ear each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons',
                            'tablespoon',
                            'ounces',
                            'ounce',
                            'teaspoons',
                            'teaspoon',
                            'cups',
                            'pounds'];  //two arrays, here trying to find if this long word exists in the incoming values

        const unitsShort = ['tbsp', 
                            'tbsp', 
                            'oz', 
                            'oz', 
                            'tsp', 
                            'tsp', 
                            'cup', 
                            'pound'];        // this second array's value used as a ref to replace with if the above word if found
        
        const units = [...unitsShort,       //included unitsShort and kg and g
                        'kg',
                        'g' ];
        const newIngredients = this.ingredients.map((el) => {
            // 1) Uniform units
            let ingredient = el.toLowerCase();  //let bcz ingredients will be regularly mutated.
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
 
            // 2) Remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            //3. Parse ing into count, unit and ingredient
            const arrIng = ingredient.split(' '); //turn into array
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2)); //includes method test if element in array
            
            let objIng; // final obj to return so outside
            if(unitIndex > -1) {
                //there is a unit

                //eg 4 1/2 cups areCount will be 4 1/2
                //eg 4 cups then arrCount is 4
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));  // turns out 4+1/2 then the eval function will perform math function 'add' and results to be 4.5
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };

            } else if (parseInt(arrIng[0], 10)) {      //parse arrayINg at 0th index, can be converted to num then true
                //There's no unit but first element is number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                };
            } else if (unitIndex === -1) {
                // There is NO unit and NO number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient: ingredient,
                };
            }
 
            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {      //type tells increase or decrease
        //update Servings
        const newServings = type ==='dec' ? this.servings - 1: this.servings + 1;

        //update ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}