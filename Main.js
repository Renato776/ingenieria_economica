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
    let abonos = {};
    if(plan.abonos!=null){
        for(let i = 0; i < plan.abonos.length; i++){
            let abono = plan.abonos[i];
            let a = abono[0]; //actual value.
            for(let j = 1; j<abono.length; j++){
                abonos[abono[j]] = a;
            }
        }
    }
    let i = 1;
    entry["details"] = plan.id;
    if( 1 in abonos)entry["abono"] = abonos[1];
    else entry["abono"] = 0;
    entry["mes"] = 1;
    entry["saldo_principal"] = plan.saldo_principal_inicial;
    entry["cuota"] = plan.cuota;
    entry["interes"] = entry.saldo_principal*plan.tasa_interes_efectiva;
    entry["capital"] = plan.cuota - entry.interes;
    entry["saldo"] = entry.saldo_principal - entry.capital;
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
        if(i in abonos)entry.abono = abonos[i];
        else entry.abono = 0;
        entry.saldo = entry.saldo_principal - entry.capital - entry.abono;
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
    const interest = 14/100;
    const ie = 1.5/100; //12 porciento de interes
    let sum = 0;
    //await load_constant_data(1000,12);
    let sub_period = 3; //Trimestral
    for (let i = 0; i<entries.length; i++){
        let int = 0;
        if(i!=0){
            if((i+1)%sub_period==0){
                let accumulated = 0;
                for (let j = 0;  j<sub_period; j++){
                    accumulated = entries[i-j];
                }
            }
        }
        await Postgres.update(data_table,['field4'],[int],'id = '+(i+1));
        console.log(int);
    }
}

main().then(()=>{
    console.log('Processed finished!!');
});