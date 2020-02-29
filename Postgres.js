//Alright,this module is supposed to establish the connection to my own Postgres DB & and perform the queries.
const Utility = require('./Utility').utility;
const { Client } = require('pg');
const fs = require('fs');
const connectionString = 'postgres://postgres:renato123@localhost:5432/renato';
const client = new Client({
    connectionString: connectionString
});
client.connect();
const Postgres = {
    tables :
        ['aspirants',
            'careers',
            'departments',
            'frequency_distribution',
            'generations',
            'graphs',
            'new_students',
            'professionals',
            'statistics',
            'students'],
decode:function(response){
        //This function receives the full response directly from the client.
        //However, we don't need all of the entries there just the rows, so we return only them.
        //You can debug all entries within the full response object with: console.log(Object.entries(response));
        return response.rows;
    },
    query:function (q,callback=null) { //Performs query and executes callback with err & resp. With resp being an array of rows.
        return new Promise(((resolve, reject) => {
            client.query(q,(err,resp)=>{
                if(err) reject(err);
                if(callback==null){
                    resolve(resp);
                }else resolve(callback(Postgres.decode(resp)));});
        }));
    },
    show_tables: async function (callback) {
        let q = "SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_schema,table_name;";
        const res = await Postgres.query(q,callback);
        return res;
    },
    select_last: async function(fields,table,where = null){
        let q = "ORDER BY mes DESC" +
            "  LIMIT 1";
        if(where == null) where = "";
        else where = " WHERE "+where;
        if(fields == null)fields = "*";
        const res = await Postgres.query( "SELECT "+fields+" FROM \""+table+"\""+where+" "+q);
        return  res.rows;
    },
    select : async function(fields=null,from,order = null,where = null){
        if(where==null)where = "";
        else where = " WHERE "+where;
        if(fields == null)fields = "*";
        if(order==null)order = "";
        else order = " ORDER BY "+order;
        const res = await Postgres.query( "SELECT "+fields+" FROM \""+from+"\" "+where+order);
        return  res.rows;
    },
    truncate: async function(tables){
        const res = await  Postgres.query('truncate table '+tables);
        return  res;
    },
    update:async function(table,fields,values,where){
        const q = 'UPDATE '+table+' SET ('+Utility.to_list(fields)+') = ('+Utility.to_list(values)+') WHERE '+where;
        await Postgres.query(q);
    },
    frequency_distribution:async function(field,table,where = null){
        if(where==null)where = "";
        else where = " WHERE "+where;
        let  q = 'select '+field+', count('+field+') as '+field+'_count from '+table+where+
            ' group by '+field+' order by '+field+';';
        const res = await Postgres.query(q);
        return res.rows;
    },
    sum: async function(field,table,where = null){
        if(where==null)where = "";
        else where = " WHERE "+where;
        let  q = 'select SUM('+field+') from '+table+where;
        const res = await Postgres.query(q);
        return res.rows;
    },
    export_table: async function(query,file_name,header){
        let rows = await Postgres.query(query);
        rows = rows.rows;
        let stream = fs.createWriteStream(file_name, {flags:'a'});
        stream.write(header + "\n");
        console.log(new Date().toISOString());
        for(let i = 0; i<rows.length; i++){
            let row = rows[i];
            stream.write(Utility.to_list(Object.values(row)) + "\n");
        }
        console.log(new Date().toISOString());
        stream.end();
    },
    insert:async function(entry, table) {
        let fields = Object.keys(entry);
        let field_list = fields[0];
        for(let i = 1; i<fields.length; i++){
            field_list+=", "+fields[i];
        }
        let values = Object.values(entry);
        let value_list = Utility.wrap_value(values[0]);
        for(let i = 1; i<values.length; i++){
            value_list+=", "+Utility.wrap_value(values[i]);
        }
        let q = "INSERT INTO "+table+" ("+field_list+") " +
            "    VALUES ("+value_list+");";
        const res = await Postgres.query(q);
        return res;
    },
    delete_all_data: async function() {
        await Postgres.truncate(Utility.to_list(Postgres.tables));
    },
    insert_graph:async function(id,name,explanation,qualitative,filters,type){
        let filters_ = 'filter1';
        for (let i = 1; i<filters.length;i++){
            filters_+= ","+'filter'+Number(i+1);
        }
        let filtros = "'{"+Utility.to_list(filters[0],true,true)+"}'";
        for(let j = 1; j<filters.length; j++){
            filtros += ", '{"+Utility.to_list(filters[j],true,true)+"}'";
        }
        let q = "insert into graphs (id,name,explanation,qualitative,"+filters_+",type) values ("+id+
            ","+Utility.wrap_value(name)+","+Utility.wrap_value(explanation)+","+qualitative+","+filtros+","+Utility.wrap_value(type)+");";
        await Postgres.query(q);
    }
};
exports.postgres = Postgres;