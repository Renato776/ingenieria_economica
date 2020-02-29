const Utility = require('./Utility').utility;
const Postgres = require('./Postgres').postgres;
const fs = require('fs');

const data_table = 'experiments';

async function load_plans(){
    await Postgres.truncate('ie_details');
    let plan = {};
    plan["precio"] = 473394;
    plan["enganche"] = 37894;
    plan["saldo_principal_inicial"] = plan.precio - plan.enganche;
    plan["tasa_interes_efectiva"] = 0.006;
    plan["cuota"] = 8664.58;
    plan["plazo"] = 5*12;
    plan["abonos"] = null;
    await Postgres.insert(plan,'ie_details');
    plan.cuota = 5101.53;
    plan.plazo = 10*12;
    await Postgres.insert(plan,'ie_details');
    plan.cuota = 3963.25;
    plan.plazo = 15*12;
    await Postgres.insert(plan,'ie_details');
    plan.cuota = 3428.91;
    plan.plazo = 20*12;
    await Postgres.insert(plan,'ie_details');
    plan.cuota = 3133.81;
    plan.plazo = 25*12;
    await Postgres.insert(plan,'ie_details');
    plan.cuota = 3133.81;
    plan.plazo = 25*12;
    plan.abonos = [[1000,5,6,7,8,9,10,11,12,13],[3000,35,36,37,38,39,40,41,42,43], [2000,55,56,57,58,59,60,61,62,63]];
    await Postgres.insert(plan,'ie_details');
    plan.cuota = 5101.53;
    plan.plazo = 10*12;
    plan.abonos = [[2000,5,6],[2000,10,13],[3000,20,21]];
    await Postgres.insert(plan,'ie_details');
    plan.cuota = 8664.58;
    plan.plazo = 5*12;
    plan.abonos = null;
    plan.enganche = 0;
    plan.saldo_principal_inicial = plan.precio;
    await Postgres.insert(plan,'ie_details');
    plan.cuota = 5101.53;
    plan.plazo = 10*12;
    plan.abonos = null;
    plan.enganche = 0;
    plan.saldo_principal_inicial = plan.precio;
    await Postgres.insert(plan,'ie_details');
}

async function calculate_plan(plan){
    let entry = {};
    let i = 1;
    entry["mes"] = 1;
    entry["saldo_principal"] = plan.saldo_principal_inicial;
    entry["cuota"] = plan.cuota;
    entry["interes"] = entry.saldo_principal*plan.tasa_interes_efectiva;
    entry["capital"] = plan.cuota - entry.interes;
    entry["saldo"] = entry.saldo_principal - entry.capital;
    entry["details"] = plan.id;
    await Postgres.insert(entry,"ie_data");
    while(entry.saldo>2){
        i++;
        let last = await Postgres.select_last('cuota,saldo','ie_data','details = '+plan.id);
        last = last[0];
        entry.saldo_principal = last.saldo;
        entry.cuota = last.cuota;
        entry.mes = i;
        entry.interes = entry.saldo_principal*plan.tasa_interes_efectiva;
        entry.capital = entry.cuota - entry.interes;
        entry.saldo = entry.saldo_principal - entry.capital;
        entry.details = plan.id;
        await Postgres.insert(entry,'ie_data');
    }
}
async function load_constant_data(amount,period){
    for (let n = 0; n<period; n++){
        let entry = {};
        entry["field1"] = amount;
        await Postgres.insert(entry,data_table);
    }
}
function get_future(present, interest, n){
    return present * Math.pow(1+interest,n);
}
async function main() {
//    await load_constant_data(1000,8);
    //Alright, now let's move to the future each entry.
    const total_period = 8;
    let entries = await Postgres.select(null,data_table);
    let interest = 1.5/100;
    const ie = 12/100; //12 porciento de interes
    let sum = 0;
    interest = Math.pow(1+0.045/3,3)-1;
    console.log(Math.pow(1+((4.57/100)/3)/(1/3),1/3)-1);
    let plan = {};
    plan["cuota"] = 600;
    plan["saldo_principal_inicial"] = 2763.9;
    plan["tasa_interes_efectiva"] = 16/100;
    plan["id"] = 11;
    await calculate_plan(plan);
    return ;
    for (let i = 0; i<24/3; i++){
        let true_future = get_future(1000,interest,i);
        let false_future = get_future(1000,4.5/100,i);
        console.log('true: '+true_future+" false: "+false_future+" error: "+Math.abs(true_future-false_future));
    }

    //await load_constant_data(1000,12);
    for (let i = 0; i<entries.length; i++){
        let f = get_future(entries[i].field1,interest,i);
        await Postgres.update(data_table,['field2'],[f],'id = '+(i+1));
        sum+= f;
    }
    console.log(sum);
}

main().then(()=>{
    console.log('Processed finished!!');
});