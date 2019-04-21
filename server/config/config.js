process.env.PORT = process.env.PORT || 3000;

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_DB;
}

process.env.URLDB = urlDB;

process.env.TOKEN_EXPIRED = '48h';
process.env.TOKEN_SEED = process.env.TOKEN_SEED || 'esta_es_la_semilla_de_desa';

process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '887382925569-sceoljmo34oc0vubp7la25hval07tn98.apps.googleusercontent.com';