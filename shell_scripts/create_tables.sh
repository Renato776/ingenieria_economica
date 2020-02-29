#SIMPLE SHELL SCRIPT FOR CREATING ALL TABLES USED BY THE USAC_STATISTICS APP.
declare -a PSQL_COMMANDS
#We declare the careers table:
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS careers (
    id serial PRIMARY KEY,
    name varchar (50) NOT NULL
);" )
#We declare the departments table:
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS departments (
    id smallint NOT NULL DEFAULT nextval('department_sequence') PRIMARY KEY,
    name varchar (250) UNIQUE NOT NULL
);" )
#We declare the generations table:
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS generations (
     id INT NOT NULL PRIMARY KEY,
     valid BOOLEAN NOT NULL DEFAULT FALSE,
     modern BOOLEAN NOT NULL DEFAULT FALSE
);" )
#We create the professionals table:
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS professionals (
    id varchar(100) NOT NULL PRIMARY KEY,
    carrera SMALLINT NOT NULL,
    tiempo_graduarse SMALLINT NOT NULL,
    generacion SMALLINT NOT NULL,
    edad SMALLINT NOT NULL,
    anio_graduacion SMALLINT NOT NULL,
    tier varchar (10) NOT NULL
);" )
#We create the students table: (gathers all students that come back to the university each year.
#Sadly there's no information for how many years each student has spent on the university.
#We only know that they're students but don't know for how long they've been.
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS students (
    id varchar(50),
    carrera SMALLINT NOT NULL,
    anio_inscripcion SMALLINT NOT NULL,
    cambio BOOLEAN,
    original SMALLINT
);" )
#Now, the table for all new students:
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS new_students (
    id varchar(100) NOT NULL PRIMARY KEY,
    carrera SMALLINT NOT NULL,
    anio_inscripcion SMALLINT NOT NULL
);" )
#Alright, now the table for all the aspirants:
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS aspirants (
    correlativo varchar(250) NOT NULL,
    carrera SMALLINT,
    edad SMALLINT,
    materia varchar(50),
    oportunidad SMALLINT,
    aprobado BOOLEAN,
    departamento varchar(250),
    institucion varchar(250),
    anio_intento SMALLINT NOT NULL
);" )
#We create the tables for all graph names:
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS graphs (
    id serial PRIMARY KEY,
    name varchar (300) NOT NULL,
    cualitative BOOLEAN NOT NULL DEFAULT FALSE
);" )
#We create the table for frequency distribution:
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS frequency_distribution (
    graph SMALLINT NOT NULL,
    filter1 INT,
    filter2 INT,
    filter3 INT,
    filter4 INT,
    event INT NOT NULL,
    frequency INT NOT NULL
);" )
#We create the table for statistical analysis:
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS statistics (
    id serial PRIMARY KEY,
    mean REAL,
    median REAL,
    mode REAL,
    min REAL,
    max REAL,
    variance REAL,
    distribution varchar(200)
);" )
###################################Personal Stuff##############################################################
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS Arqui_Inventory (
    id serial PRIMARY KEY,
    precio numeric(20,2) NOT NULL,
    count INT NOT NULL,
    name varchar(200) NOT NULL,
    descripcion TEXT
);" )
###################################END Personal Stuff##########################################################
###################################ING ECONOMICA SCRIPTS
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS ie_details (
    id serial PRIMARY KEY,
    precio numeric(20,2) NOT NULL,
    saldo_principal_inicial numeric(20,2) NOT NULL,
    tasa_interes_efectiva numeric(10,8) NOT NULL,
    cuota numeric(20,2) NOT NULL,
    plazo INT NOT NULL,
    enganche numeric(20,2),
    abonos numeric(20,2)[][],
    total_pagado numeric(20,2),
    interes_total_pagado numeric(20,2)
);" )

PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS experiments (
    id serial PRIMARY KEY,
    field1 numeric(20,2),
    field2 numeric(20,2),
    field3 numeric(20,2),
    field4 numeric(20,2),
    field5 numeric(20,2)
);" )
PSQL_COMMANDS+=( "CREATE TABLE IF NOT EXISTS ie_data (
    details INT NOT NULL,
    mes INT NOT NULL,
    saldo_principal numeric(20,2) NOT NULL,
    cuota numeric(20,2) NOT NULL,
    interes numeric(20,2) NOT NULL,
    capital numeric(20,2) NOT NULL,
    abono numeric(20,2)  DEFAULT 0 NOT NULL,
    saldo numeric(20,2) NOT NULL
);" )
###################################END ING ECONOMICA SCRIPTS
#ALright, we can execute all of them now:
for command in "${PSQL_COMMANDS[@]}"
do
   :
    psql -c "$command"
done
echo "RESULT:"
psql -c "SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_schema,table_name;" > "shell_scripts/table_schema_result.txt"
