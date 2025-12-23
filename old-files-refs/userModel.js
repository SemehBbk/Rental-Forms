const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
      minlength: [2, "Le nom doit contenir au moins 2 caractères"],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Veuillez entrer un email valide"],
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
      select: false,
    },
    roles: {
      type: [String],
      enum: ["joueur", "prop", "admin"],
      default: ["joueur"],
    },
    // Date de naissance
    dateNaissance: { type: Date, required: true },

    // Age (calculé automatiquement)
    age: { type: Number },

    genre: {
      type: String,
      enum: ["homme", "femme"],
      required: [true, "Le genre est requis"],
    },
    avatar: { type: String },

    adresse: {
      type: String,
      trim: true,
    },
    numTel: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{8}$/.test(v);
        },
        message: "Le numéro de téléphone doit contenir exactement 8 chiffres",
      },
    },
    // Champs spécifiques au propriétaire
    cin: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    level: [
      {
        sport: {
          type: String,
          enum: [
            "football",
            "basketball",
            "tennis",
            "padel",
            "handball",
            "volleyball",
          ],
          required: true,
        },
        niveau: {
          type: String,
          enum: ["amateur", "good", "excellent", "professionnel"],
          required: true,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Avant de sauvegarder, calculer l'âge automatiquement
userSchema.pre("save", function (next) {
  if (this.dateNaissance) {
    const today = new Date();
    const birthDate = new Date(this.dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    this.age = age;
  }
  next();
});

// Hash password before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.confirmPassword = undefined;
  next();
});

// Vérification du mot de passe
userSchema.methods.verifPass = async function (enteredPass) {
  return await bcrypt.compare(enteredPass, this.password);
};

// 🔥 Middleware `pre-save` pour calculer l'âge et attribuer un avatar automatiquement
userSchema.pre("save", function (next) {
  // Calculer l'âge à partir de la date de naissance
  if (this.dateNaissance) {
    const birthDate = new Date(this.dateNaissance);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }
    this.age = calculatedAge;
  }

  // Définir un avatar par défaut si l'utilisateur n'en a pas défini
  if (!this.avatar) {
    this.avatar =
      this.genre === "homme"
        ? "https://res.cloudinary.com/de7xe2apv/image/upload/v1743122579/avatarMas_gfqibz.jpg"
        : "https://res.cloudinary.com/de7xe2apv/image/upload/v1743122578/avatarFem_rwxmyv.jpg";
  }

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
