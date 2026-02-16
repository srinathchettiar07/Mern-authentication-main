import pg from "pg"

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "mpt",
  password: "tumtak1234",
});

export const connectPgDB = async ()=>{
try {
    db.connect()
    console.log("PostGres Db connected");
} catch (error) {
    console.log(error);
}
}
export default db;