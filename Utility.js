const api = "https://datosabiertos.ingenieria.usac.edu.gt/api/3/action/datastore_search_sql";
const Utility = {
   get_stats:function (array) {
       /*
       * This function gets average, min & max. However, it removes outliers from the data.
       * To remove outliers we'll keep all points that are within 95% of the average.
       * We'll exclude the rest and refer to them as outliers.
       * */
       console.log('Alright, is getting called.');
       array = Utility.numerify(array);
       let filtered_data = Utility.remove_outliers(array);
       let useful = filtered_data.result;
       return {"average":Utility.average(useful),"min":Utility.min(useful),"max":Utility.max(useful),"outliers":filtered_data.outliers
       ,"lower_bound":filtered_data.lower_bound,"upper_bound":filtered_data.upper_bound};
   },
numeric_solve:function(equation,a,b,exactitud = 0.00000000001){
    let error = 100;
    let f_a = equation(a);
    let f_b = equation(b);
    let x = (a+b)/2; //initial guess.
    let f_x = equation(x);
    while (!(f_x==0 || error<exactitud )){
        if(Utility.sign_change(f_x,f_a)){
            b = x;
        }else{
            a = x;
        }
        x = (a+b)/2;
        f_x = equation(x);
        f_b = equation(b);
        f_a = equation(a);
        error = Math.abs(f_b - f_a);
    }
    console.log('error: '+error);
    console.log('result: '+x);
    return x;
},
sign_change: function (a,b){
    if(a<0 && b <0) return false;
    if(a>0 && b>0) return false;
    return true;
},
    remove_outliers:function(array){
        let standard_deviation = Utility.standard_deviation(array);
        let mean = Utility.average(array);
        let lower_bound = mean - standard_deviation*2;
        let upper_bound = mean + standard_deviation*2;
        let outliers = [];
        let res = [];
        array.forEach(element=>{
            if(lower_bound<element&&element<upper_bound)
                res.push(element);
            else outliers.push(element);
        });
        return {"outliers":outliers,"result":res,"lower_bound":lower_bound,"upper_bound":upper_bound};
    },
    get_pure_stats:function (array) { //Same as get_stats but keeps outliers during calculation.
       array = Utility.numerify(array); //just in case
       return {"average":Utility.average(array),"min":Utility.min(array),"max":Utility.max(array)};
    },
    average:function (array) {
        let sum = 0;
        for( let i = 0; i < array.length; i++ ){
            sum += array[i]; //don't forget to add the base
        }
        return sum/array.length;
    },
    numerify:function(array){
       let res = [];
       array.forEach(element=>{
           res.push(Number(element));
       });
       return res;
    },
    min:function (array) {
        if(array.length==0)return null;
        return Math.min(...array);
    },
    max:function (array) {
        if(array.length==0)return null;
        return Math.max(...array);
    },
    variance:function (array) { //calculates the variance from a group of data.
        let mean = Utility.average(array);
        let aux = [];
        array.forEach(element=>{
            aux.push(Math.pow(element-mean,2));
        });
        return Utility.average(aux);
    },
    standard_deviation:function (array) {
        let variance = Utility.variance(array);
        return Math.sqrt(variance);
    },
    wrap_value:function(val,special_wrap = false){
       if(Array.isArray(val)){
           let res;
           if(special_wrap) res = "{";
           else res = "'{";
           res += Utility.to_list(val,true,true);
           if(special_wrap)res += "}";
           else res += "}'";
           return  res;
       }
       if(val==null)return val;
       if(!isNaN(val))return  val;
       if(typeof val == "boolean")return val;
       if(special_wrap)return '"'+val+'"';
       else return "'"+val+"'";;
    },
    to_list : function(array,wrap = false,array_element_wrap = false){
       if(array.length==0)return '';
       let r;
       if(wrap) r = Utility.wrap_value(array[0],array_element_wrap);
       else r = array[0];
       for(let i = 1; i<array.length;i++){
           if(wrap)r +=', '+Utility.wrap_value(array[i],array_element_wrap);
           else r += ', '+array[i];
       }
       return r;
    },
    get_tier(grade) {
       grade = grade.split('-');
       let lower_bound = Number(grade[0]);
       let upper_bound = Number(grade[1]);
       if(upper_bound<=65){
           return "D";
       }else if(upper_bound<=70){
           return "C";
       }else if(upper_bound<=75){
           return "B";
       }else if(upper_bound<=80){
           return "A";
       }else if(upper_bound<=85){
           return "S";
       }else{
           return "SS"
       }
    },
    match_record(entry) {
       let keys = Object.keys(entry);
       let res;
       if(entry[keys[0]]==null) res =  keys[0]+' is '+Utility.wrap_value(entry[keys[0]]);
           else res = keys[0]+' = '+Utility.wrap_value(entry[keys[0]]);
       for (let i = 1; i<keys.length;i++){
           if(entry[keys[i]]==null) res += ' AND '+keys[i]+' is '+Utility.wrap_value(entry[keys[i]]);
           else res += ' AND '+keys[i]+' = '+Utility.wrap_value(entry[keys[i]]);
       }
       return res;
    }
};
exports.api = api;
exports.utility = Utility;