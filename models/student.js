const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const studentSchema = new Schema({
    Sname: { type: String, required: true },
    Semail: { type: String, required: true },
    Sphone: { type: String },
    image: { type: String },
    created_at: { type: Date, default: Date.now }
    
});



const student = mongoose.model("student", studentSchema);

module.exports = student;