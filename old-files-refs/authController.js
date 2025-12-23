const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const calculateAge = require("../utils/calculateAge");
const { createClubForDevenirPro } = require("../utils/clubService"); // Adjust the path if needed

const createToken = (name, id) => {
  return jwt.sign({ name, id }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user; // Comes from the authenticate middleware
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.signupJoueur = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      dateNaissance,
      genre,
      numTel,
      adresse,
    } = req.body;

    if (!dateNaissance || !genre) {
      return res
        .status(400)
        .json({ message: "Date de naissance et genre sont obligatoires" });
    }
    const age = calculateAge(dateNaissance);
    if (age < 15) {
      return res.status(400).json({
        message:
          "Vous devez avoir au moins 15 ans pour vous inscrire en tant que joueur.",
      });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      dateNaissance,
      genre,
      numTel,
      adresse,
      roles: ["joueur"],
    });

    /*  const token = createToken(newUser.name, newUser._id); */
    res.status(201).json({
      message: "Joueur inscrit avec succès",
      /*  token */
      data: { user: newUser },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.signupPro = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      dateNaissance,
      genre,
      cin,
      numTel,
    } = req.body;

    if (!dateNaissance || !genre || !cin) {
      return res
        .status(400)
        .json({ message: "Date de naissance, genre et CIN sont obligatoires" });
    }

    // Calcul manuel de l'âge pour la validation
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return res.status(400).json({
        message:
          "Vous devez avoir au moins 18 ans pour vous inscrire en tant que propriétaire.",
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.roles.includes("prop")) {
        existingUser.roles.push("prop");
        existingUser.cin = cin;
        existingUser.numTel = numTel;
        await existingUser.save();
      }
      return res.status(200).json({
        message: "Votre compte est maintenant un compte pro",
        data: { user: existingUser },
      });
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      dateNaissance,
      genre,
      cin,
      numTel,
      roles: ["joueur", "prop"],
    });

    /*  const token = createToken(newUser.name, newUser._id);*/
    res.status(201).json({
      message: "Pro inscrit avec succès",
      /*token,*/
      data: { user: newUser },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.signupAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer un nouvel admin
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      roles: ["admin"],
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin créé avec succès !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe invalide" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
      },
      process.env.SECRET_KEY
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user,
      roles: user.roles,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* 
exports.devenirPro = async (req, res) => {
  try {
    const userId = req.user.id; // Récupérer l'ID de l'utilisateur connecté

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "Utilisateur non trouvé" });
    }

    // Vérifier si l'utilisateur est uniquement joueur
    if (!user.roles.includes("joueur")) {
      return res.status(403).json({
        status: "fail",
        message: "Vous devez être un joueur pour devenir propriétaire",
      });
    }

    // Vérifier s'il est déjà Pro
    if (user.roles.includes("prop")) {
      return res
        .status(400)
        .json({ status: "fail", message: "Vous êtes déjà propriétaire" });
    }

    // Recalculer l'âge par sécurité (cas anniversaire récent)
    const age = calculateAge(user.dateNaissance);
    if (age < 18) {
      return res.status(403).json({
        status: "fail",
        message: "Vous devez avoir au moins 18 ans pour devenir propriétaire",
      });
    }

    // Mettre à jour le rôle
    user.roles.push("prop");
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Félicitations, vous êtes maintenant propriétaire !",
      // data: { user },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
*/

exports.devenirPro = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (!user.roles.includes("joueur")) {
      return res.status(403).json({
        message: "Vous devez être un joueur pour devenir propriétaire",
      });
    }

    if (user.roles.includes("prop")) {
      return res.status(400).json({ message: "Vous êtes déjà propriétaire" });
    }

    // Vérifier l'âge
    const age = calculateAge(user.dateNaissance);
    if (age < 18) {
      return res
        .status(403)
        .json({ message: "Vous devez avoir au moins 18 ans" });
    }

    //   Ici, on utilise directement req.body
    if (!req.body || !req.body.patente) {
      return res.status(400).json({
        message: "Veuillez fournir les informations du club (dont la patente)",
      });
    }

    //   Vérifier et ajouter CIN si manquant
    if (!user.cin) {
      const { cin } = req.body;

      if (!cin) {
        return res.status(400).json({
          message:
            "Veuillez fournir votre numéro de CIN pour devenir propriétaire.",
        });
      }

      // Optionnel : vérification du format du CIN
      if (cin.length !== 8 || isNaN(cin)) {
        return res.status(400).json({
          message: "Le CIN doit être un numéro de 8 chiffres.",
        });
      }
      //   Vérifier unicité manuellement
      const existingUserWithCin = await User.findOne({ cin });
      if (existingUserWithCin) {
        return res.status(400).json({
          message: "Ce numéro de CIN est déjà utilisé.",
        });
      }

      user.cin = cin;
    }

    //   Créer le club avec req.body (pas req.body.club)
    const newClub = await createClubForDevenirPro(user, req.body, req.files);

    //   Promouvoir le joueur en prop
    user.roles.push("prop");
    await user.save();

    return res.status(201).json({
      message: "Félicitations, vous êtes maintenant propriétaire !",
      club: newClub,
    });
  } catch (err) {
    console.error("Erreur devenirPro:", err.message);
    return res.status(500).json({ message: err.message });
  }
};
