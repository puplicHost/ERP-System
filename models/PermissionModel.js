const mongoose = require("mongoose");
const { Schema } = mongoose;

const PermissionSchema = new Schema({
    name: {
        type: String,
        required: [true, "Permission name is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, "Permission description is required"]
    }
}, { timestamps: true });

const PermissionModel = mongoose.model("Permission", PermissionSchema);

module.exports = PermissionModel;
