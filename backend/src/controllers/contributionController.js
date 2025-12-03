import Contribution from "../models/Contribution.js";
import Project from "../models/Project.js";
import mongoose from "mongoose"

// Créer contribution off-chain
export const createContribution = async (req, res) => {
  try {
    const { amountADA } = req.body;
    if (!amountADA || amountADA <= 0) {
      return res.status(400).json({ message: "Montant valide requis" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    const contribution = await Contribution.create({
      project: project._id,
      user: req.user._id,
      amountADA,
      status: "pending",
    });

    res.status(201).json({ message: "Contribution créée", contribution });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// Mock checkout Cardano
export const checkoutContribution = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    // Génération d'un payload / QR mock
    const checkoutPayload = {
      address: "addr_test1qmockaddressxyz123...", // mock testnet
      amountADA: req.body.amountADA,
      message: `Contribution au projet ${project.title}`,
      expiry: Date.now() + 15 * 60 * 1000 // 15 min
    };

    res.json({ message: "Checkout généré", checkoutPayload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Recevoir confirmation tx (webhook mock)
export const confirmTx = async (req, res) => {
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
// Statistiques contributions projet
export const getProjectContributionStats = async (req, res) => {
  try {
    const projectId = req.params.id;
    const totalContributions = await Contribution.countDocuments({ project: projectId, status: "confirmed" });
    const totalAmountADA = await Contribution.aggregate([
      { $match: { project: mongoose.Types.ObjectId(projectId), status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$amountADA" } } }
    ]); 
    res.json({
      totalContributions,
      totalAmountADA: totalAmountADA[0] ? totalAmountADA[0].total : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// Statistiques contributions globales
export const getGlobalContributionStats = async (req, res) => {
  try {
    const totalContributions = await Contribution.countDocuments({ status: "confirmed" });
    const totalAmountADA = await Contribution.aggregate([
      { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$amountADA" } } }
    ]);
    res.json({
      totalContributions,
      totalAmountADA: totalAmountADA[0] ? totalAmountADA[0].total : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};  

export default {
  createContribution,
  checkoutContribution,
    confirmTx,
    listContributions,
    getContribution,
    listUserContributions,
    getProjectContributionStats,
    getGlobalContributionStats
};
   
