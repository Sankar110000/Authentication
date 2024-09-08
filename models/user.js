const mongoose = require("mongoose");
const {Schema} = mongoose;
const MONGO_URL = 'mongodb://127.0.0.1:27017/figma';

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
.then(() => {
    console.log("Connection successful");
})
.catch(err => console.log(err));

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        uniqe: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("User", userSchema);