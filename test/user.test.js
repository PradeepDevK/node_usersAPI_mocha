const expect = require("chai").expect;
const request = require('supertest');
const { User } = require('../models/user.model');
const app = require("../app");
const mongoose = require("mongoose");
const config = require("../config");
const env = process.env.NODE_ENV || 'test';

let userId = '';

describe('api/users', () => {
    before(async () => {
        // before each test delete all users table data
        await User.deleteMany({});
    });

    after(async () => {
        mongoose.disconnect();
    });

    afterEach(async () => {
        // after each test delete all users table data
        await User.deleteMany({});
    });

    it("should connect and disconnect to mongodb", async () => {
        mongoose.disconnect();
        mongoose.connection.on('disconnected', () => {
            expect(mongoose.connection.readyState).to.equal(0);
        });

        mongoose.connection.on('connected', () => {
            expect(mongoose.connection.readyState).to.equal(1);
        });

        mongoose.connection.on('error', () => {
            expect(mongoose.connection.readyState).to.equal(99);
        });

        await mongoose.connect(config.db[env], config.dbParams);
    });

    describe("GET /", () => {
        it("should return all users", async () => {
            const users = [
                { name: "jake", email: "jake@gmail.com", country: "spain" },
                { name: "mike", email: "mike@gmail.com", country: "romania" }
            ];

            await User.insertMany(users);
            const res = await request(app).get("/api/users");
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(2);
        });
    });

    describe("Get /:id", () => {
        it("should return a user if valid id is passed", async () => {
            const user = new User({
                name: "doe",
                email: "doe@gmail.com",
                country: "sweden"
            });
            
            await user.save();
            const res = await request(app).get("/api/users/" + user._id);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("name", user.name);
        });

        it("should return 400 error when invalid object id is passed", async () => {
            const res = await request(app).get("/api/users/1");
            expect(res.status).to.equal(400);
        });

        it("should return 404 error when valid object id is passed but does not exist", async () => {
            const res = await request(app).get("/api/users/5f43ef20c1d4a133e4628181");
            expect(res.status).to.equal(404);
        });
    });

    describe("POST /", () => {
        it("should return user when the all request body is valid", async () => {
            const res = await request(app)
            .post("/api/users")
            .send({
                name: "jake",
                email: "jake@gmail.com",
                country: "india"
            });
            const data = res.body;
            expect(res.status).to.equal(200);
            expect(data).to.have.property("_id");
            expect(data).to.have.property("name", "jake");
            expect(data).to.have.property("email", "jake@gmail.com");
            expect(data).to.have.property("country", "india");
        });
    });

    describe('PUT /:id', () => {
        it("should update the existing user and return 200", async () => {
            const user = new User({
                name: "jake",
                email: "jake@gmail.com",
                country: "sweden"
            });
            await user.save();

            const res = await request(app)
            .put("/api/users/" + user._id)
            .send({
                name: "juan",
                email: "juan@gmail.com",
                country: "spain"
            });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("name", "juan");
            expect(res.body).to.have.property("email", "juan@gmail.com");
            expect(res.body).to.have.property("country", "spain");
        });
    });
    
    describe("Delete /:id", () => {
        it("should delete requested id and return response 200", async () => {
            const user = new User({
                name: "juan",
                email: "juan@gmail.com",
                country: "sweden"
            });

            await user.save();
            userId = user._id;
            const res = await request(app).delete("/api/users/" + userId);
            expect(res.status).to.equal(200);
        });

        it("should return 404 when deleted user is requested", async () => {
            let res = await request(app).get("/api/users/" + userId);
            expect(res.status).to.equal(404);
        });
    });
});
