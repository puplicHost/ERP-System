const mongoose = require("mongoose");
const { Schema } = mongoose;

const RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission"
    }]
}, { timestamps: true });

const RoleModel = mongoose.model("Role", RoleSchema);

module.exports = RoleModel;
