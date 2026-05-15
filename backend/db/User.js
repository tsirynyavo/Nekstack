const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Veuillez entrer un email valide'],
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // <-- peut être 'user' ou 'admin'
        default: 'user'
    }
}, {
    timestamps: true
});

// Méthode simplifiée pour comparer les mots de passe
userSchema.methods.comparePassword = function(candidatePassword) {
    return candidatePassword === this.password;
};

// Ne jamais envoyer le mot de passe dans les réponses
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

module.exports = mongoose.model("User", userSchema);
