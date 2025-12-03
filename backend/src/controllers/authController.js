import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, walletAddress } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérifier si email existe
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email déjà utilisé" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Créer utilisateur
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      walletAddress: walletAddress || "",
      role: "user",
    });

    // Token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, walletAddress: newUser.walletAddress }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Tous les champs sont requis" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Connexion réussie",
      token,
      user: { id: user._id, name: user.name, email: user.email, walletAddress: user.walletAddress }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Get logged in user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Update wallet address
export const updateWalletAddress = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ message: "Adresse de portefeuille requise" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    user.walletAddress = walletAddress;
    await user.save();
    res.json({ message: "Adresse de portefeuille mise à jour", walletAddress: user.walletAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Les deux mots de passe sont requis" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (name) user.name = name;
    if (email) {
      const emailUsed = await User.findOne({ email });
      if (emailUsed && emailUsed._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email déjà utilisé" });
      }
        user.email = email;
    }
    await user.save();
    res.json({ message: "Profil mis à jour", user: { id: user._id, name: user.name, email: user.email, walletAddress: user.walletAddress } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
export const confirmContribution = async (req, res) => {
  try {
    const { contributionId } = req.body;
    const contribution = await Contribution.findById(contributionId);
    if (!contribution) return res.status(404).json({ message: "Contribution non trouvée" });    
    contribution.status = "confirmed";
    await contribution.save();
    const project = await Project.findById(contribution.project);
    project.totalContributions = (project.totalContributions || 0) + contribution.amountADA;
    if (project.totalContributions >= project.goalADA) {
      project.status = "funded";
    }
    await project.save();
    res.json({ message: "Transaction confirmée", contribution, project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Lister contributions d'un projet
export const listContributions = async (req, res) => {
  try {
    const { status } = req.query;
    const projectId = req.params.id;
    const filter = { project: projectId };
    if (status) filter.status = status;
    const contributions = await Contribution.find(filter).populate("user", "name email");
    res.json(contributions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Détails contribution
export const getContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id).populate("user", "name email").populate("project", "title");
    if (!contribution) return res.status(404).json({ message: "Contribution non trouvée" });
    res.json(contribution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}; 
// Lister contributions utilisateur
export const listUserContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ user: req.user._id }).populate("project", "title");
    res.json(contributions);
  }
    catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
export default {
  register,
  login,
    getMe,
    updateWalletAddress,
    updatePassword,
    updateProfile,
    confirmContribution,
    listContributions,
    getContribution,
    listUserContributions,
};


