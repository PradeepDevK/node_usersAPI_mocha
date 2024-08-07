module.exports = {
    port: 3000,
    db: {
        production: "mongodb://localhost:27017/db_mocha",
        development: "mongodb://localhost:27017/db_mocha",
        test: "mongodb://localhost:27017/test_db_mocha"
    },
    dbParams: {
    }
}